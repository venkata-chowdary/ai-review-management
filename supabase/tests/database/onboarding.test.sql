begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(6);

-- New users start at the first onboarding step.
select is(
  (select onboarding_step from public.businesses where user_id = '11111111-1111-1111-1111-111111111111'),
  'done',
  'seed owners are fully onboarded'
);

select throws_ok(
  $$ update public.businesses set onboarding_step = 'nope' where user_id = '11111111-1111-1111-1111-111111111111' $$,
  '23514',
  null,
  'an unknown onboarding step is rejected'
);

select throws_ok(
  $$ update public.businesses set ai_tone = 'Rude' where user_id = '11111111-1111-1111-1111-111111111111' $$,
  '23514',
  null,
  'an unknown tone is rejected'
);

select throws_ok(
  $$ update public.businesses set ai_approval_rule = '5' where user_id = '11111111-1111-1111-1111-111111111111' $$,
  '23514',
  null,
  'an unknown approval rule is rejected'
);

-- updated_at moves forward on every update, whatever the client sends.
update public.businesses set updated_at = '2000-01-01' where user_id = '11111111-1111-1111-1111-111111111111';
select ok(
  (select updated_at > '2020-01-01' from public.businesses where user_id = '11111111-1111-1111-1111-111111111111'),
  'businesses.updated_at is set by the database'
);

update public.branches set updated_at = '2000-01-01' where user_id = '11111111-1111-1111-1111-111111111111';
select ok(
  (select min(updated_at) > '2020-01-01' from public.branches where user_id = '11111111-1111-1111-1111-111111111111'),
  'branches.updated_at is set by the database'
);

select * from finish();
rollback;
