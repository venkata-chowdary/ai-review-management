create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  branch_name text not null,
  address text,
  place_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, place_id),
  -- A location can only point at a business owned by the same user.
  foreign key (business_id, user_id) references public.businesses (id, user_id) on delete cascade
);

create index locations_user_id_idx on public.locations (user_id);
create index locations_business_id_idx on public.locations (business_id);

alter table public.businesses enable row level security;
alter table public.businesses force row level security;
alter table public.locations enable row level security;
alter table public.locations force row level security;

revoke all on public.businesses from anon;
revoke all on public.locations from anon;

create policy "businesses_select_own" on public.businesses
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "businesses_insert_own" on public.businesses
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "businesses_update_own" on public.businesses
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "businesses_delete_own" on public.businesses
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "locations_select_own" on public.locations
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "locations_insert_own" on public.locations
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "locations_update_own" on public.locations
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "locations_delete_own" on public.locations
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Every new auth user gets their own business. Runs as the function owner
-- because a brand-new user has no session to pass the insert policy with.
create function public.create_business_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.businesses (user_id) values (new.id);
  return new;
end;
$$;

revoke execute on function public.create_business_for_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_business_for_new_user();
