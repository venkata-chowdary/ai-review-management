# Progress log

Newest entries first. Add a new entry at the top for each milestone.

## Current status

Phase 2 (database and security foundation) is complete on a development Supabase project. The database has businesses and locations, and each user can only reach their own rows. The screens still run on sample data, and there is no sign-in page, AI or Google connection yet.

| Phase | Scope | State |
|---|---|---|
| Phase 0 | Repository setup, design inventory, Google API access research | Setup done; owner actions open |
| Phase 1 | App shell, all screens, loading/empty/error states, sample data | Done |
| Phase 2 | Supabase schema, row level security, server clients, setup docs | Done |
| Next | Sign-in pages, real data in place of sample data (one table per feature), QR suggestions via Gemini | Not started |

## Open items and blockers

- [ ] Confirm a Google Business Profile that has been verified for 60+ days and lists a website, then submit the GBP API access form. Google publishes no approval timeline, so this blocks review sync and replies.
- [x] Create a development Supabase project and fill `.env.local` (done 2 Nov 2026).
- [ ] Create the Google Cloud project and fill its variables in `.env.local`.
- [ ] Empty the stray `.env` file; the same Supabase keys are in `.env.local`.
- [ ] Create a separate Supabase project for production, and never run `seed.sql` there.
- [ ] Switch local Node to 22 or 24 LTS (currently 23.7).
- [ ] Benchmark 2–3 Gemini models on about 20 sample QR inputs; record tokens and cost.
- [ ] Confirm the QR → Google review link format on Android and iOS.
- [ ] Decide the product name and domain (needed for the Google sign-in consent screen and legal pages).
- [ ] Choose rate-limiting and error-monitoring providers (Upstash and Sentry proposed).
- [ ] Review the provisional screens (Insights, QR codes, AI replies, Locations, Billing, Settings, customer QR page).

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
