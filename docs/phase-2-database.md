# Phase 2: database and security foundation

## Tables

| Table | Purpose |
|---|---|
| `businesses` | One per user (`user_id` is unique). Created by a trigger when a user signs up. `name` starts empty. |
| `locations` | Branches of a business (`branch_name`, `address`, `place_id`). A composite foreign key `(business_id, user_id)` stops a location from pointing at another user's business. |

Users are Supabase's own `auth.users`. There is no members table: the app has a single owner per business. Other tables (QR codes, reviews, and so on) are added by the feature that needs them.

## Access control

Every table has a `user_id` column and four row level security policies (select, insert, update, delete) for the `authenticated` role:

```sql
using ((select auth.uid()) = user_id)
-- insert and update also: with check ((select auth.uid()) = user_id)
```

`anon` has no access. RLS is both enabled and forced. The service-role key bypasses RLS, so it is only used on the server through `src/lib/supabase/admin.ts`.

The server finds the current business from the signed-in user (`getCurrentBusiness()` in `src/lib/auth/session.ts`), never from an id in the request. Ids in the URL, such as `?loc=`, are untrusted: query with them and treat an empty result as not found.

## Adding a table

1. New migration in `supabase/migrations/` (never edit an applied one).
2. Columns: `id uuid` primary key, `user_id` referencing `auth.users` with `on delete cascade`, `created_at` and `updated_at`.
3. Child tables add `unique (id, user_id)` on the parent and a composite foreign key `(parent_id, user_id)`.
4. Index `user_id`.
5. `enable` and `force row level security`, `revoke all ... from anon`, and the four policies.
6. Add a test next to `isolation.test.sql` that tries to read and change another user's rows.
7. `npm run db:reset`, `npm run db:test`, `npm run db:types`.

`rls_enabled.test.sql` fails if any public table is missing RLS.

## Running the tests

Locally (Docker running): `npm run db:test`.

Against a hosted project, `supabase test db --linked` fails with `function plan(integer) does not exist`, because the CLI's temporary login role cannot see the `extensions` schema where pgTAP lives. Run a test file as the project owner instead:

```bash
npx supabase db query --linked -f supabase/tests/database/isolation.test.sql
```

That prints only the last assertion. Every test file starts with `begin;` and ends with `rollback;`, so nothing is left in the database. The tests rely on the users from `supabase/seed.sql`, so only run them on a development project.

## Updating `updated_at`

There is no trigger. Set `updated_at: new Date().toISOString()` in every update.

## Not done yet

Login pages, the auth callback and sign-out, Google sign-in, and replacing the mock data with real queries. `verifySession()` is ready for those but is not used by any page yet.
