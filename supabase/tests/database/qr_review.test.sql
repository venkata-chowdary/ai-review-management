begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(11);

-- Branches get a public code on their own, and it is unique.
select ok(
  (select bool_and(char_length(qr_code) = 12) from public.branches),
  'every branch has a 12 character qr_code'
);
select is(
  (select count(distinct qr_code) from public.branches),
  (select count(*) from public.branches),
  'qr_code is unique per branch'
);

select throws_ok(
  $$ update public.branches set google_review_url = 'http://example.com' where user_id = '11111111-1111-1111-1111-111111111111' $$,
  '23514',
  null,
  'a review link must be https'
);

-- The service role can count hits, and the limit holds within one window.
select is(public.rate_limit_hit('test-key', 2, 600), true, 'first hit is allowed');
select is(public.rate_limit_hit('test-key', 2, 600), true, 'second hit is allowed');
select is(public.rate_limit_hit('test-key', 2, 600), false, 'third hit is refused');
select is(public.rate_limit_hit('other-key', 2, 600), true, 'another key has its own allowance');

-- Owners read their own usage; nobody but the service role writes it.
insert into public.ai_usage_events (branch_id, user_id, model)
select id, user_id, 'test-model' from public.branches where user_id = '22222222-2222-2222-2222-222222222222' limit 1;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select is((select count(*) from public.ai_usage_events), 0::bigint, 'A cannot read B''s AI usage');
select throws_ok('select * from public.rate_limits', '42501', null, 'owners cannot read rate limit counters');
select throws_ok(
  $$ select public.rate_limit_hit('x', 1, 60) $$,
  '42501',
  null,
  'owners cannot call rate_limit_hit'
);

reset role;
set local role anon;
select throws_ok('select * from public.ai_usage_events', '42501', null, 'signed-out visitors cannot read AI usage');

select * from finish();
rollback;
