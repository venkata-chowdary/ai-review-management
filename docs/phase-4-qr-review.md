# Phase 4: customer QR review journey

## What is real now
- Each branch has a public `qr_code` (12 random hex characters, made by the database). The QR points to `<NEXT_PUBLIC_SITE_URL>/r/<qr_code>`, so the Google link behind it can change without reprinting.
- `/r/[code]` is the customer page. No account, name or phone number. It reads the branch with the service role through `getPublicBranch` in `src/lib/data/branches.ts`, which returns only what the page needs.
- The customer gives a star rating (1 to 5), picks experience chips (preset per business type, in `src/lib/qr/suggestions.ts`) and can add a short comment.
- `suggestReviews` (`src/app/r/[code]/actions.ts`) is a server action. It validates the input, rate limits, calls Gemini on the server and returns 3 suggestions. If Gemini is not set up, fails or returns something unusable, it returns template suggestions built only from the customer's own answers.
- The customer edits a suggestion, taps "Copy and open Google", and the text is copied while Google's review page opens. They paste, choose their own stars and post. Nothing is submitted for them.
- Every rating gets the same path to Google. No rating is blocked or sent to a private form.
- Owners paste the review link from Google Business Profile, Get more reviews (`https://g.page/r/<id>/review`). Only that link format, or `search.google.com/local/writereview?placeid=…`, is accepted, because customers are sent there. No Places API and no `place_id` lookup is needed.
- `/qr-codes` shows a real, scannable QR per branch, with PNG and SVG downloads (`/qr-codes/[id]/download?format=png|svg`, owner only). The onboarding QR step uses the same code.

## Not fabricating feedback
Gemini gets only the rating, the chosen chips, the comment and the business name, as data. The instructions forbid adding facts, require a low rating to stay unhappy, and tell the model to ignore instructions inside the comment. Output that has links or long digit runs is thrown away. Customer answers and suggestions are never stored.

## Abuse protection
- Input checks (Zod): code format, rating 1 to 5, at most 8 chips that must all be in the branch's preset list, comment up to 500 characters.
- A hidden `website` field is a honeypot and must stay empty.
- Rate limits use the `rate_limit_hit` Postgres function: 10 requests per 10 minutes per client, and 200 per hour per branch (a cost cap). The client key is a SHA-256 of the address and `RATE_LIMIT_SALT`; the address itself is not stored. If the check fails, the request is refused.
- When a limit is hit or something fails, the customer sees a plain message and the "write it myself on Google" link stays visible.
- `rate_limits` and `ai_usage_events` have row level security on. Anonymous visitors cannot read or write them. Only the service role writes.

## Database
Migration `20261105000000_qr_review.sql` adds `branches.google_review_url`, `branches.qr_code` and `branches.ai_paused`, the `ai_usage_events` table (model and token counts for each Gemini call; see the next paragraph for how it looks now) and the `rate_limits` table with `rate_limit_hit`. Tests are in `supabase/tests/database/qr_review.test.sql`.

Migration `20261106000000_ai_usage_detail.sql` makes `ai_usage_events` a per-attempt log. Each Gemini attempt gets a row, and so does each template fallback:
- `outcome` is `ok`, `rejected` (Gemini answered and was billed, but the text was unusable), `error` (the call threw) or `fallback` (template text served, model `template`, `error_message` holds `no_api_key` or `gemini_unusable`).
- `request_id` and `attempt` group the attempts of one customer request. `unique (request_id, attempt)` stops duplicates.
- `token_metadata` holds all the token counts in one place, with plain names: `input_tokens`, `output_tokens`, `thinking_tokens`, `total_tokens` and `cached_tokens`. The old `input_tokens` and `output_tokens` columns were removed by migration `20261107000000_ai_usage_token_metadata.sql`, which first moved any counts already logged into it. It is null for `error` and `fallback` rows. To sum, use `(token_metadata->>'input_tokens')::int`.
- `latency_ms` and `estimated_cost_usd`. Cost uses the list prices in `src/lib/ai/pricing.ts` (input tokens at the input rate, output plus thinking tokens at the output rate) and is stored when the row is written. It is 0 for API errors and fallbacks, and null (unknown) for timeouts, unknown models and responses without `usageMetadata`.

Existing branches have no review link yet. Their QR page shows "not found" until the owner adds one (Branches, Edit).

## Setup
- `.env.local`: `GEMINI_API_KEY`, `GEMINI_MODEL` (the code falls back to `gemini-2.5-flash` when empty), `RATE_LIMIT_SALT`, and `NEXT_PUBLIC_SITE_URL` (the QR encodes this address, so it must be the public one).
- Apply the migration to the development project (`npx supabase db push`) and run `npm run db:test`.

## Still to do
- Test the `g.page` review link on Android and iOS.
- Benchmark Gemini models and set `GEMINI_MODEL`.
- Scan counts are not collected (no `scan_events`), so the QR page shows no scan numbers.
- `ai_paused` has no switch in the dashboard yet.
- AI usage is logged but not shown or limited yet. Later, by area:
  - Billing: monthly allowance check before each Gemini call, the real usage meter on the Billing page, and checking our cost estimate (timeouts included) against Google's invoice.
  - User UI: real usage on the Overview and Insights pages, and a per-branch breakdown.
  - Admin: a usage and cost view across all accounts, and alerts on errors, latency, fallback rate and spend spikes.
  - Data and reliability: a rollup table with a retention policy, retries or a queue for the usage write, and a `provider` column.
