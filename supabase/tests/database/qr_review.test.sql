begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(17);

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

select ok(
  (select outcome = 'ok' and attempt = 1 and operation = 'review_suggestions' and request_id is null
   from public.ai_usage_events where model = 'test-model'),
  'a minimal usage row picks up the defaults'
);

select lives_ok(
  $$ insert into public.ai_usage_events
       (branch_id, user_id, model, request_id, attempt, outcome, token_metadata, latency_ms, estimated_cost_usd)
     select id, user_id, 'gemini-2.5-flash', '33333333-3333-3333-3333-333333333333', 1, 'ok',
       '{"input_tokens":120,"output_tokens":40,"thinking_tokens":300,"total_tokens":460,"cached_tokens":0}', 850, 0.00079
     from public.branches where user_id = '11111111-1111-1111-1111-111111111111' limit 1 $$,
  'a full usage row inserts'
);
select is(
  (select token_metadata ->> 'thinking_tokens' from public.ai_usage_events where request_id = '33333333-3333-3333-3333-333333333333'),
  '300',
  'the token breakdown is stored in token_metadata'
);
select throws_ok(
  $$ insert into public.ai_usage_events (branch_id, user_id, model, request_id, attempt)
     select id, user_id, 'gemini-2.5-flash', '33333333-3333-3333-3333-333333333333', 1
     from public.branches where user_id = '11111111-1111-1111-1111-111111111111' limit 1 $$,
  '23505',
  null,
  'the same request and attempt cannot be logged twice'
);
select throws_ok(
  $$ insert into public.ai_usage_events (branch_id, user_id, model, outcome)
     select id, user_id, 'gemini-2.5-flash', 'unknown' from public.branches where user_id = '11111111-1111-1111-1111-111111111111' limit 1 $$,
  '23514',
  null,
  'an unknown outcome is refused'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select is((select count(*) from public.ai_usage_events where user_id = '22222222-2222-2222-2222-222222222222'), 0::bigint, 'A cannot read B''s AI usage');
select is((select count(*) from public.ai_usage_events where user_id = '11111111-1111-1111-1111-111111111111'), 1::bigint, 'A can read their own AI usage');
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
