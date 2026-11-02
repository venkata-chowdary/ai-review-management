# Phase 3: sign-in and business onboarding

## What is real now
- Email and password sign-up, sign-in, password reset and sign-out (Supabase Auth, server actions in `src/lib/auth/actions.ts`).
- Google sign-in code (`signInWithGoogle`). It needs the OAuth client set up first, see below.
- `/auth/callback` exchanges the one-time code from confirmation, reset and Google links.
- `src/proxy.ts` sends signed-out visitors to `/sign-in` and signed-in owners away from the auth pages. This is a quick check only. Pages, actions and row level security do the real checks.
- Onboarding saves each step to `businesses` and `branches`. `businesses.onboarding_step` is the next step to do (`business`, `branch`, `google`, `replies`, `qr`, `done`). `/onboarding` resumes there, and opening a later step goes back.
- The dashboard needs a signed-in owner with `onboarding_step = 'done'`.
- Branches: list, add (`/branches/new`) and edit (`/branches/[id]/edit`). A branch that is not yours returns 404.
- Settings: business name can be saved. Sign out works in Settings, the sidebar, the mobile menu and onboarding.

## Still sample data
Reviews, overview, insights, usage, QR page and AI reply settings still use `src/lib/mock`. Because the branch switcher now lists real branches, `?loc=` filtering of the sample reviews does not match them until reviews are real. "Connect Google" in onboarding and on Branches is a disabled placeholder, and auto-posting is always saved as off.

## Database
Migration `20261104000000_onboarding.sql` adds `business_type`, `onboarding_step`, `ai_tone`, `ai_approval_rule`, `ai_auto_publish` to `businesses`, plus an `updated_at` trigger on both tables. Apply `20261103000000_locations_to_branches.sql` first. Then run `npm run db:test` and `npm run db:types`.

## Email confirmation
Local: off (`supabase/config.toml`), sign-up goes straight to onboarding. Production: turn on "Confirm email" in the Supabase dashboard. Sign-up then goes to Check your email, and the link opens `/auth/callback?next=/onboarding`.

## Google sign-in setup
1. Google Cloud Console, APIs & Services, OAuth consent screen (product name, support email, authorized domain). Then Credentials, create an OAuth client ID of type Web application.
2. Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`. For local Supabase use `http://127.0.0.1:54321/auth/v1/callback`.
3. Supabase dashboard, Authentication, Providers, Google: paste the client ID and secret. For local, set `GOOGLE_SIGNIN_CLIENT_ID` and `GOOGLE_SIGNIN_CLIENT_SECRET` in `.env.local`.
4. Authentication, URL Configuration: add your site URL and `<site>/auth/callback` to the redirect URLs.
5. This is separate from the Business Profile connection (`business.manage`), which comes later.
