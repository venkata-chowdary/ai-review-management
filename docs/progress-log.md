# Progress log

Newest entries first. Add a new entry at the top for each milestone.

## 3 Nov 2026 (latest): detailed AI usage logging

`ai_usage_events` now records every Gemini attempt (including failed and rejected ones) and every template fallback, with the full token breakdown, latency and estimated cost. See `phase-4-qr-review.md`. Migrations `20261106000000_ai_usage_detail.sql` and `20261107000000_ai_usage_token_metadata.sql` are applied to the development project. The database tests (`npm run db:test`) and a real Gemini call still need to be run. Billing, dashboard and admin views of this data are listed there as later work.

## 3 Nov 2026: customer QR review journey (Phase 4)

QR page, Gemini suggestions, rate limiting and real QR codes are built. See `phase-4-qr-review.md`. Owners now paste Google's own review link per branch; customers rate, pick suggestions, edit and post on Google themselves. `tsc`, lint, `next build` and the unit tests pass. The new migration and database tests, and the Gemini call, still need to be run against a real project.

## 3 Nov 2026: sign-in and onboarding wired (code complete, database not yet applied)

Sign-up, sign-in, password reset, sign-out, Google sign-in code, route protection, onboarding saved to the database, and branch add/edit are built. See `phase-3-auth.md`. `tsc`, lint and `next build` pass. Not yet run against a database: the two pending migrations must be applied, the database tests run, and the flow tested by hand.

## Current status

Phases 0–4 code is complete. Phase 2 has been applied to a development Supabase project with row level security. Phases 3 and 4 migrations are pending application. The app has sign-in, onboarding with branch setup, real QR codes with Gemini suggestions (fallback to templates), rate limiting, and customer review flow—all on sample data without real Google or Gemini APIs yet.

| Phase | Scope | State |
|---|---|---|
| Phase 0 | Repository setup, design inventory, Google API access research | Done; owner actions remain |
| Phase 1 | App shell, all screens, loading/empty/error states, sample data | Done |
| Phase 2 | Supabase schema, row level security, server clients, setup docs | Applied to development project |
| Phase 3 | Sign-in, onboarding, branches, route protection | Code done; 2 migrations pending |
| Phase 4 | QR landing page, Gemini suggestions, rate limiting, real QR codes | Code done; 1 migration pending |
| Phase 5 | Real data: reviews, Google connection, insights | Not started |

## Next steps

**Critical path** (next week)
- [ ] Push Phase 3 migrations (onboarding, branches) to development project
- [ ] Run `npm run db:test` after applying migrations
- [ ] Test sign-in, onboarding, and branch flow by hand
- [ ] Push Phase 4 migration (QR, rate limiting, Gemini) 
- [ ] Set up and test Gemini API (benchmark 2–3 models on sample QR inputs)
- [ ] Confirm QR code scans on Android and iOS
- [ ] Test with real Google Business Profile link

**Blockers**
- [ ] Confirm a Google Business Profile (60+ days verified, with website) and submit GBP API access form
- [ ] Create Google Cloud project and fill GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET in `.env.local`
- [ ] Create Supabase production project (never run seed.sql there)

**Future**
- [ ] Decide product name and domain (for Google consent screen and legal pages)
- [ ] Choose error-monitoring provider (Sentry proposed)
- [ ] Switch local Node to 22 or 24 LTS
- [ ] Empty the stray `.env` file; use `.env.local` only

## 3 Nov 2026 — Sign-in and onboarding screens (provisional), locations renamed to branches

Sign-in pages and a five-step onboarding now exist as provisional screens on sample data. Every "location" in the app and the database is now a "branch". Wording is plain Indian English for non-technical owners: sign-in pages are minimal, and onboarding keeps about 70% of the first draft's explanations (step hints, why Google is needed, what it asks permission for, and a setup summary).

**Decisions**

- Sign-in pages have one short column that fits the screen without scrolling, and no side panel. The email field is labelled "Email".
- Onboarding asks only for the branch name and its Google Maps link. There is no address and no Google search.
- The AI replies step asks two plain questions: reply style (with a sample Google review and your reply under it), and who checks replies. The choices are "I will check every reply" (default), "Auto-post 4★ and 5★ replies" or "Auto-post 3★ to 5★ replies"; the auto-post choices unlock only after Google is connected. They are stored as `approvalRule` plus `autoPublish`. The old star rule did nothing while auto-reply was off, so it was removed.
- The customer QR page shows suggestions one at a time in a horizontal swipe row; the visible one can be edited in place.
- Database: `locations` → `branches`, `branch_name` → `name`, `address` dropped, `google_maps_url` added (https only). This is a new migration; the applied one is unchanged.

**Built**

| Item | What it does |
|---|---|
| `/sign-in`, `/sign-up`, `/check-email`, `/forgot-password`, `/reset-password` | Email and password forms with inline errors; a placeholder "Continue with Google" button |
| `/onboarding/business`, `branch`, `google`, `replies`, `qr` | Five steps; answers kept in `sessionStorage` |
| `/branches` | Formerly `/locations` |
| `supabase/migrations/20261103000000_locations_to_branches.sql` | Renames the table, columns, indexes, constraints and policies |

Preview states (development only): `/sign-in?state=error`, `/reset-password?state=error`, `/onboarding/google?state=error`.

**Checked**

- `tsc` and `npm run lint` pass.
- In the browser: sign-up fits a 375×812 phone with no scroll; sign-in fits 1024×768. Onboarding runs from business to the QR code on a phone, including the wrong-link error and Skip for Google. The QR suggestions swipe one at a time with arrows and dots.

**Limitations**

- Nothing is real yet: sign-in, emails, Google connection and saving are simulated, and onboarding answers are lost when the tab closes.
- The Google button must be replaced with Google's official button before launch.
- The migration has not been pushed, and the database tests were not rerun. `database.types.ts` was edited by hand to match.
- Internal mock names were renamed with a script; customer review text that says "location" was left as written.

## 2 Nov 2026 — Phase 2: database and security foundation

A development Supabase project now holds the first two tables, and the database itself stops one user from reading or changing another user's data. The schema is rebuilt from the migration file alone.

**Decisions**

- One user owns one business. There is no staff or members table; the app has a single owner for now.
- Every table carries a `user_id`, and its rules are `(select auth.uid()) = user_id`. Signed-out visitors get no access. Later tables copy this pattern.
- Tables are added one feature at a time. Only `businesses` and `locations` exist now.
- Child tables point at their parent with a composite key `(parent_id, user_id)`, so a row cannot be attached to another user's parent.
- `updated_at` has no trigger; the app sets it on each update.

**Built**

| Item | What it does |
|---|---|
| `businesses` | One per user, created automatically when someone signs up |
| `locations` | Branches of a business: `branch_name`, `address`, `place_id` |
| Migration and seed | `supabase/migrations/` and `supabase/seed.sql` (two demo owners, each with a business and two locations) |
| Tests | Three files in `supabase/tests/database/`, 20 checks in all |
| `src/lib/supabase/admin.ts` | Server-only client that bypasses the rules, for jobs and webhooks |
| `src/lib/auth/session.ts` | `verifySession()` and `getCurrentBusiness()`, which finds the business from the signed-in user and never from an id in the request |
| Types | `database.types.ts`, generated from the database and used by the three Supabase clients |
| Setup | `db:*` scripts, README section, `.env.example`, `config.toml` URLs, [phase-2-database.md](phase-2-database.md) |

**Checked**

- The migration and seed were pushed to the development project.
- All 20 checks pass there: user A cannot read, change, delete or attach to user B's rows, cannot reassign a row to B, and signed-out visitors are blocked. A new user gets exactly one business. Every test rolls back.
- A check fails if any public table is added without row level security.
- `tsc`, `npm run lint` and `npm run build` pass.

**Limitations**

- Not tested with a real sign-in, because there is no login page yet. `verifySession()` is not used by any page.
- `npx supabase test db --linked` fails on a hosted project. The tests were run with `npx supabase db query --linked -f <file>` instead, which shows only the last result, so the 20 results were collected through a scratch copy. The local command `npm run db:test` was not run (Docker was not used).
- The seed users have the password `password123`, so the seed must not be used on a production project.
- The sample data still drives every screen. Each feature switches to real queries when its table exists.
- Not built: sign-in pages, Google sign-in, and every table beyond businesses and locations.

Details: [phase-2-database.md](phase-2-database.md).

## 2 Nov 2026 — Source control set up

The project is now under git and pushed to GitHub, so work can be shared and reviewed.

**Changed**

- Repository: `github.com/venkata-chowdary/ai-review-management`, branch `main`.
- `.gitignore` extended with editor and OS folders (`.idea/`, `.vscode/`, `Thumbs.db`). `.env*` stays ignored, except `.env.example`.
- Repository initialized fresh, with one commit holding all current work (95 files). The earlier local history (the create-next-app commit and an unpushed commit) was discarded, so git history starts at this commit.

**Checked**

- The commit contains no `.env` files, `node_modules` or `.next` output; a scan of the staged content found no keys.
- `git push` to `origin/main` succeeded.

**Limitations**

- The push first failed because the saved GitHub login belonged to a different account; it was cleared and the push was retried under the owner's account.

## 2 Nov 2026 — Analytics metrics revised

Average reply time was dropped because it mostly reflects how long Google takes to publish a reply, not anything the owner does. The analytics now follow an agreed list of ten metrics.

**Changed**

- Overview: the fourth headline figure is now **Auto-reply rate**, in place of average reply time.
- Renamed "New reviews" to **Reviews received** and "Reply rate" to **Reply coverage**.
- Insights: added a second row of figures (**Unanswered reviews**, **Pending approvals**, **Reply success rate**, **AI usage**) and two weekly charts, **Rating trend** and **Sentiment trend**.
- Design-system mockups updated to show Auto-reply rate.

**Checked**

- `tsc` and lint pass; Overview and Insights load on the dev server, including the empty state. The new charts have not yet been reviewed visually or at phone width.

**Limitations**

- Pending approvals, Unanswered reviews and AI usage are counted from the sample reviews; the other figures and all weekly values are sample numbers.
- The rating trend chart starts at 3.5 stars rather than 0, so small weekly changes stay visible.

## 2 Nov 2026 — Phase 1: UI foundation complete

The dashboard and the customer QR page work end to end on sample data, on phones, tablets and desktops. No new packages were added.

**Decisions**

- Layout: the Overview page is the home page and the Inbox split is the Reviews page, with one frosted-glass sidebar everywhere. It shrinks to an icon rail below 1024px and becomes a bottom tab bar below 768px.
- Screens without a mockup are composed only from existing design-system parts and marked provisional.
- Icons are the ones drawn in the mockups, kept in-house rather than taken from an icon library, so hover animations can be tuned exactly. All motion turns off for people who prefer reduced motion.

**Built**

| Screen | What it does |
|---|---|
| Overview (`/`) | Approvals waiting, failed replies, AI allowance, four headline figures, recent reviews, rating breakdown |
| Reviews (`/reviews`) | Review list with Needs reply / All / Failed tabs and search; detail with the AI draft, tone, edit and approve |
| Insights | Weekly review trend, sentiment, what QR visitors mention, figures per location (extended on 2 Nov, see above) |
| QR codes | One card per location with scans, link and a preview image |
| AI replies | Tone, approval rule, auto-publish switch, custom instructions, per-location overrides |
| Locations, Billing, Settings | Location list with Google connection status, plan and usage, account details |
| Customer QR page (`/r/[code]`) | Star rating, highlights, optional comment, three suggested texts to edit and copy, then Continue to Google; a fallback when AI is paused |

Every page also has loading, empty and error states (preview with `?state=loading|empty|error` in development).

**Checked**

- `tsc`, `npm run lint` and `npm run build` all pass.
- Screens captured at 1440, 1280, 900 and 390px and compared with the approved mockups.
- Key interactions clicked through in a browser: location filter, review drawer and sheet, approve and publish, QR flow, reduced motion.

**Limitations**

- Nothing is sent anywhere yet. Approve & publish, Regenerate, Sync and Save show their loading states, then say "Demo only".
- QR images are placeholders that don't scan; PNG/SVG download is disabled.
- QR suggestions are templates built from what the customer picked; Gemini replaces them later.
- To fit the sidebar, the Overview's rating breakdown moves under the reviews table below 1360px wide.
- An unknown QR link shows the not-found page but returns HTTP 200 rather than 404.

Details: [phase-1-ui.md](phase-1-ui.md).

## 2 Nov 2026 — Phase 0: setup and assessment

The project was set up and the main external risks were documented; the owner actions above are still open.

- Set up Next.js 16, React 19, Tailwind CSS 4, the Supabase clients and the design-system tokens and font.
- Reviewed the master plan and design system, and listed the screens with no design.
- Researched Google Business Profile API access: eligibility, approval, sign-in scope and reply moderation.
- Listed every external service and setting needed, by phase.

Details: [phase-0-assessment.md](phase-0-assessment.md).
