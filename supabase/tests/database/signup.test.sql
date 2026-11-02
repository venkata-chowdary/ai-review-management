begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(3);

insert into auth.users (instance_id, id, aud, role, email, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated', 'new-owner@example.com', now(), now()
);

select is(
  (select count(*) from public.businesses where user_id = '33333333-3333-3333-3333-333333333333'),
  1::bigint,
  'a new user gets exactly one business'
);

select is(
  (select name from public.businesses where user_id = '33333333-3333-3333-3333-333333333333'),
  '',
  'the new business starts with an empty name'
);

select is(
  (select onboarding_step from public.businesses where user_id = '33333333-3333-3333-3333-333333333333'),
  'business',
  'a new business starts at the first onboarding step'
);

select * from finish();
rollback;
