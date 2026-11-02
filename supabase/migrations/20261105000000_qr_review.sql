-- Customer QR review journey: the public code and Google review link on each
-- branch, plus the two tables the public endpoint writes to (rate limit counters
-- and AI usage). Customers have no account, so the public page and the suggestion
-- action reach these through the server's service role, never through anon.

alter table public.branches
  add column google_review_url text check (
    google_review_url is null
    or (google_review_url like 'https://%' and char_length(google_review_url) <= 2048)
  ),
  add column qr_code text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  add column ai_paused boolean not null default false;

create table public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  model text not null,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now(),
  foreign key (branch_id, user_id) references public.branches (id, user_id) on delete cascade
);

create index ai_usage_events_branch_id_idx on public.ai_usage_events (branch_id);
create index ai_usage_events_user_id_idx on public.ai_usage_events (user_id);

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);

alter table public.ai_usage_events enable row level security;
alter table public.ai_usage_events force row level security;
alter table public.rate_limits enable row level security;
alter table public.rate_limits force row level security;

revoke all on public.ai_usage_events from anon;
revoke all on public.rate_limits from anon, authenticated;

-- Owners can read their own usage; only the service role writes it.
create policy "ai_usage_events_select_own" on public.ai_usage_events
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- One atomic increment per call, in fixed windows. Returns false once the key
-- has used up its allowance for the current window.
create function public.rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  current_hits integer;
begin
  insert into public.rate_limits (key, window_start, hits)
  values (p_key, current_window, 1)
  on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into current_hits;

  -- Old windows are of no use; sweep them now and then instead of on every call.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return current_hits <= p_limit;
end;
$$;

revoke execute on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;
