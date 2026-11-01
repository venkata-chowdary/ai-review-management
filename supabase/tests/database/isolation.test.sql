begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(17);

-- User A = 1111..., user B = 2222... (see supabase/seed.sql).
create temp table ids as
select
  (select id from public.businesses where user_id = '22222222-2222-2222-2222-222222222222') as b_business_id,
  (select id from public.locations where user_id = '22222222-2222-2222-2222-222222222222' limit 1) as b_location_id;
grant select on ids to authenticated;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select is((select count(*) from public.businesses), 1::bigint, 'A sees only their own business');
select is((select count(*) from public.locations), 2::bigint, 'A sees only their own locations');
select is(
  (select count(*) from public.businesses where id = (select b_business_id from ids)),
  0::bigint,
  'A cannot read B''s business by id'
);
select is(
  (select count(*) from public.locations where id = (select b_location_id from ids)),
  0::bigint,
  'A cannot read B''s location by id'
);

with changed as (
  update public.businesses set name = 'hacked' where id = (select b_business_id from ids) returning 1
)
select is((select count(*) from changed), 0::bigint, 'A cannot update B''s business');

with changed as (
  update public.locations set branch_name = 'hacked' where id = (select b_location_id from ids) returning 1
)
select is((select count(*) from changed), 0::bigint, 'A cannot update B''s location');

with removed as (
  delete from public.businesses where id = (select b_business_id from ids) returning 1
)
select is((select count(*) from removed), 0::bigint, 'A cannot delete B''s business');

with removed as (
  delete from public.locations where id = (select b_location_id from ids) returning 1
)
select is((select count(*) from removed), 0::bigint, 'A cannot delete B''s location');

select throws_ok(
  $$insert into public.locations (business_id, user_id, branch_name)
    values ((select b_business_id from ids), '22222222-2222-2222-2222-222222222222', 'x')$$,
  '42501',
  null,
  'A cannot insert a location owned by B'
);

select throws_ok(
  $$insert into public.locations (business_id, user_id, branch_name)
    values ((select b_business_id from ids), '11111111-1111-1111-1111-111111111111', 'x')$$,
  '23503',
  null,
  'A cannot attach a location to B''s business'
);

select throws_ok(
  $$update public.locations set user_id = '22222222-2222-2222-2222-222222222222'
    where user_id = '11111111-1111-1111-1111-111111111111'$$,
  '42501',
  null,
  'A cannot hand their location to B'
);

select throws_ok(
  $$update public.businesses set user_id = '22222222-2222-2222-2222-222222222222'
    where user_id = '11111111-1111-1111-1111-111111111111'$$,
  '42501',
  null,
  'A cannot hand their business to B'
);

select throws_ok(
  $$insert into public.businesses (user_id) values ('22222222-2222-2222-2222-222222222222')$$,
  '42501',
  null,
  'A cannot insert a business owned by B'
);

select lives_ok(
  $$update public.businesses set name = 'Renamed' where user_id = '11111111-1111-1111-1111-111111111111'$$,
  'A can update their own business'
);

select lives_ok(
  $$insert into public.locations (business_id, user_id, branch_name)
    values ((select id from public.businesses), '11111111-1111-1111-1111-111111111111', 'Harbour')$$,
  'A can add a location to their own business'
);

reset role;
set local role anon;

select throws_ok('select * from public.businesses', '42501', null, 'signed-out visitors cannot read businesses');
select throws_ok('select * from public.locations', '42501', null, 'signed-out visitors cannot read locations');

select * from finish();
rollback;
