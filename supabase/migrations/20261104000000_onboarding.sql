-- Onboarding progress and the answers the setup steps collect. Everything is
-- added to businesses, so the existing row level security policies (owner only,
-- by user_id) already cover the new columns.

alter table public.businesses
  add column business_type text check (business_type is null or char_length(business_type) <= 60),
  add column onboarding_step text not null default 'business'
    check (onboarding_step in ('business', 'branch', 'google', 'replies', 'qr', 'done')),
  add column ai_tone text check (ai_tone is null or ai_tone in ('Warm', 'Friendly', 'Professional', 'Formal')),
  add column ai_approval_rule text check (ai_approval_rule is null or ai_approval_rule in ('2', '3', 'all')),
  add column ai_auto_publish boolean not null default false;

-- Keep updated_at honest on every update, whatever the client sends.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

create trigger branches_set_updated_at
  before update on public.branches
  for each row execute function public.set_updated_at();
