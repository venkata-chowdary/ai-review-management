# Phase 0 — Repository Assessment

**Date:** 2 November 2026
**Inputs reviewed:** `masterplan_updated.md` (the plan; there is no `masterplan.md`), `design-system/`, official Google Business Profile (GBP) docs (pages last updated 2026-08-28).

---

## 1. Repository state

### Before Phase 0
The repository had no application code:
- `masterplan_updated.md`: product and technical plan, v1.0.
- `design-system/`: tokens, component and layout previews (HTML). See §2.
- No git, no `package.json`, no Supabase project.

### Established in Phase 0 (setup only, no features)

| Area | What exists |
|---|---|
| Framework | Next.js **16.4.3**, App Router, `src/` dir, React 19.3, TypeScript 5.9, ESLint 9 |
| Styling | Tailwind CSS 4.3; `src/app/globals.css` imports `design-system/tokens.css` and maps tokens to Tailwind utilities (`bg-app`, `bg-surface`, `text-fg-muted`, `bg-primary`, `rounded-pill`, `shadow-button-primary`, …) |
| Font | Manrope via `next/font/google` (`src/app/layout.tsx`) |
| Supabase | `@supabase/ssr` 0.12.7, `@supabase/supabase-js` 2.118, `supabase` CLI 2.122 (dev dependency, run with `npx supabase`), `supabase/config.toml` |
| Supabase clients | `src/lib/supabase/client.ts` (browser), `server.ts` (server, `server-only`), `proxy.ts` (session refresh) |
| Request proxy | `src/proxy.ts` refreshes auth cookies. Excludes static assets and `/r/*` (reserved for public QR pages). |
| Env template | `.env.example` (committed via a `.gitignore` exception) |
| Git | Initialised; one scaffold commit. `design-system/`, `masterplan_updated.md` and the setup changes are uncommitted. |

**Verified:** `next typegen`, `tsc --noEmit`, `npm run lint` and `npm run build` all pass.

### Next.js 16 notes for implementers
`AGENTS.md` says this Next version differs from older training data. Read `node_modules/next/dist/docs/` before writing code. Notable changes:
- **`middleware.ts` is now `proxy.ts`.** It runs on the Node runtime (not Edge) and is for optimistic checks only. Authorization belongs in pages, route handlers and RLS.
- **`cookies()`, `headers()`, `params` and `searchParams` are async-only.**
- Global route types (`PageProps<'/x'>`, `LayoutProps`) are generated. Run `npx next typegen` before a standalone `tsc`.

### Local toolchain

| Tool | Status |
|---|---|
| Node | v23.7.0. Odd-numbered and outside some packages' supported engines (e.g. `eslint-visitor-keys` wants `^22.13 \|\| >=24`). **Switch to Node 22 or 24 LTS.** |
| npm / git / Docker | Installed (Docker 28.3 is needed for `npx supabase start`) |
| Supabase CLI | Local via npm |
| Vercel CLI, gcloud CLI, pnpm | **Not installed**. Install Vercel and gcloud when deployment and Pub/Sub work start. |

---

## 2. UI design inventory

### Locked decisions
From `design-system/README.md` and `tokens.json`:
- **Theme:** Apple Cool base with blue `#0071E3`, glass navigation and Manrope.
- **Buttons:** pill-shaped.
- **Theme modes:** light only; a dark theme is planned.

### Screens designed
1280px desktop mockups with sample data:

| Preview | Content |
|---|---|
| `LayoutOverview` | Icon rail (76px), greeting, action queue (approvals / failed / AI allowance), 4 KPI tiles, recent-reviews table, rating breakdown |
| `LayoutInbox` | Glass sidebar (240px), metrics strip, review list with tabs (Needs reply / All / Failed), detail panel with AI draft, tone, approval rule, actions and activity timeline |
| `LayoutTopNav` | Glass top bar, KPI cards, review feed with inline drafts, "Needs attention" rail |
| `Buttons` | Button variants and states, chips, status badges, tabs, glass-over-imagery example |
| `Typography` | Manrope scale (display, page-title, section, card-title, body, control, label, small, metric) |
| `ThemeStudio` | Theme builder tool (not product UI) |

> **No layout has been chosen.** The design notes suggest **Overview home** as the landing page and **Inbox split** as the Reviews page.

### Components to build
From the previews:
- **Buttons:** primary, light, text, destructive and icon buttons. Sizes 32, 40 and 48px. States: hover, pressed, focus, loading and disabled.
- **Inputs and filters:** filter and attribute chips (32px, or 44px on touch screens), pill tabs, search field.
- **Status badges:** AI draft (dashed outline), Awaiting approval, Queued, Published and Failed, plus Google connected.
- **Navigation:** sidebar, icon rail and top bar, location switcher, account row, AI-usage meter and ring.
- **Data display:** KPI tile with trend, metrics strip, review list row and table row, star rating with number, sentiment label, rating breakdown bars.
- **Review workflow:** AI-draft editor panel with tone selector, activity timeline, action-queue cards.

### Assets
- **Fonts:** Manrope 400/500/600/700 only. `tokens.css` also declares Poppins, Jakarta, Outfit, DM Sans and Urbanist, but only Theme Studio uses them.
- **Icons:** inline SVGs drawn by hand, with no icon library. **Decision needed:** adopt one with a similar look (e.g. Lucide) or extract the SVGs.
- **Images and logos:** none. There's no product logo, since the name is still undecided.

### Design gaps
These screens and states have no designs yet. Owner input is needed before or during Phase 1.

1. **Customer QR review page.** This is the core of Phase 1. Only fragments exist: a 48px "Continue to Google" button, attribute chips, a `qr-max` 440px token and a 16px input rule.
2. Sign up, sign in and onboarding (business setup, first location, Google review link).
3. Locations, QR codes (create and download), AI reply settings (global and per location), Insights, Billing and Settings.
4. Empty, loading and error states; the "AI paused" QR fallback; Google reconnect.
5. Tablet and mobile layouts. Responsive rules are written down but not drawn.

---

## 3. Google Business Profile API: access requirements and blockers

Sources:
- [Prerequisites](https://developers.google.com/my-business/content/prereqs)
- [Basic setup](https://developers.google.com/my-business/content/basic-setup)
- [OAuth setup](https://developers.google.com/my-business/content/oauth-setup)
- [Notification setup](https://developers.google.com/my-business/content/notification-setup)
- [Reviews API reference](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews)
- [Deprecation schedule](https://developers.google.com/my-business/content/sunset-dates)

### Access process
1. **Eligibility.** The applicant must manage a GBP that has been **verified and active for 60+ days** and **lists a website**. This can be the agency's own profile or a client's.
2. **Set up the applicant.** Create a Google Cloud project and note its **project number**. The docs also list creating a GBP **Organization account**.
3. **Apply.** Submit the [GBP API contact form](https://support.google.com/business/contact/api_default) and choose "Application for Basic API Access". Use an email that is an owner or manager on the qualifying GBP.
4. **Confirm approval.** Quota is **0 QPM until approved** and **300 QPM once approved**. **Google publishes no review timeline.**
5. **Enable the APIs.** After approval, enable the Business Profile APIs. Basic-setup lists seven:
   - Google My Business
   - Account Management
   - Business Information
   - Notifications
   - Verifications
   - Place Actions
   - Lodging

   The Google My Business API only appears in the console after approval.

### Integration facts
- **OAuth scope:** `https://www.googleapis.com/auth/business.manage`.
  - This is a sensitive scope, so a public app needs **OAuth consent-screen verification**. That needs a homepage, privacy policy, terms, app name and logo, and adds lead time.
  - This is a separate Google OAuth client and consent from Supabase "Sign in with Google".
- **Acting for merchants:** platforms may act for owners and managers after a one-time consent. Merchants can revoke access at any time, so the product must detect revocation and prompt reconnection.
- **Reviews (v4):**
  - Endpoints: `accounts.locations.reviews.list`, `get`, `updateReply` and `deleteReply`. `batchGetReviews` lives on `accounts.locations`.
  - None of these are on the deprecation schedule.
  - Replies are at most **4096 bytes**.
  - Replies go through **moderation** (`reviewReplyState`: PENDING, APPROVED or REJECTED). The UI must not show "Published" until the reply is APPROVED.
- **Notifications:**
  - Create a Pub/Sub topic.
  - Grant `pubsub.topics.publish` to `mybusiness-api-pubsub@system.gserviceaccount.com`.
  - Register the topic **per GBP account** with `PATCH mybusinessnotifications.googleapis.com/v1/accounts/{id}/notificationSetting`.
  - Notifications only signal an event. The app must fetch the review itself, and still needs scheduled reconciliation to catch missed events.

### Blockers

| # | Blocker | Impact | Mitigation |
|---|---|---|---|
| B1 | Need a 60+ day verified GBP with a website to apply | Can't apply until one is available | Use the agency's own GBP or a willing pilot restaurant's; confirm age now |
| B2 | Approval time unknown; quota 0 until approved | No review sync or replies in Phase 1 until approved | **Apply immediately.** Phase 1 relies on the manual Google review link (QR flow needs no API) |
| B3 | OAuth verification for `business.manage` | Unverified apps show warnings and have user caps | Publish privacy policy and terms early; submit for verification before the pilot |
| B4 | Reply moderation | "Posted" ≠ "Published" | Model a `pending_moderation` reply state |

---

## 4. External dependencies requiring setup

| # | Service | Needed for | Owner action | Env vars (`.env.example`) | Phase |
|---|---|---|---|---|---|
| 1 | **Supabase project** (region: Mumbai `ap-south-1`) | DB, Auth, RLS | Create project; copy URL and keys | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` | 1 |
| 2 | **Google Cloud project** | All Google services | Create; note the project number | `GOOGLE_CLOUD_PROJECT_ID` | 0 |
| 3 | **GBP API access** | Review sync and replies | Submit the form (§3) | — | **0 (now)** |
| 4 | **Google OAuth client (Sign-In)** | Supabase "Sign in with Google" | Create a web client; add it to Supabase Auth providers | Configured in the Supabase dashboard | 1 |
| 5 | **Google OAuth client (GBP)** + consent screen | Connecting a Business Profile | Create client and consent screen; plan verification | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `TOKEN_ENCRYPTION_KEY` | 1 (if access granted) |
| 6 | **Gemini API key** | Review suggestions, reply drafts | Create a key in AI Studio or Vertex; pick a model after benchmarking | `GEMINI_API_KEY`, `GEMINI_MODEL` | 0 benchmark, 1 |
| 7 | **Pub/Sub topic + push subscription** | Review notifications | Create topic, grant the GBP service account, set up a push subscription with OIDC auth | `GBP_PUBSUB_TOPIC`, `PUBSUB_PUSH_AUDIENCE`, `PUBSUB_PUSH_SERVICE_ACCOUNT` | 2 |
| 8 | **Vercel project** | Hosting, Cron for reconciliation | Create; link the repo; set env vars | `CRON_SECRET` | 1 |
| 9 | **Rate limiting store** (e.g. Upstash Redis) | Public QR and AI endpoint limits | Choose a provider | `UPSTASH_REDIS_*` (proposed) | 1 |
| 10 | **Error monitoring** (e.g. Sentry) | Production errors | Choose a provider | `SENTRY_DSN` (proposed) | 1 |
| 11 | **Domain + legal pages** | OAuth verification, privacy notice | Buy a domain; draft privacy policy and terms (with professional review) | `NEXT_PUBLIC_SITE_URL` | 0–1 |
| 12 | Billing provider | Subscriptions | **Deferred** (Razorpay or Stripe, undecided) | — | 2 |

---

## 5. Phase 0 checklist

Items marked ☐ need the owner or external accounts.

- [x] Read the master plan
- [x] Audit the repository and design system
- [x] Set up Next.js + Supabase; build passes
- [x] Document GBP access requirements and blockers
- ☐ Confirm a qualifying GBP (60+ days verified, has a website) and **submit the GBP API access form**
- ☐ Create Supabase and Google Cloud projects; fill `.env.local`
- ☐ Switch local Node to 22 or 24 LTS
- ☐ Gemini spike: benchmark 2–3 models on about 20 sample QR inputs; record tokens and cost per generation
- ☐ After approval: test OAuth → `reviews.list` → `updateReply` → moderation state → Pub/Sub notification on a test location
- ☐ Validate the Vercel fit: Pub/Sub push endpoint latency and auth, and Cron for reconciliation
- ☐ Confirm the QR → Google review link format (`https://search.google.com/local/writereview?placeid=…`) on Android and iOS
- ☐ Finalise the data model and RLS strategy (first task of Phase 1, §6)
- ☐ Owner decisions (§7)

---

## 6. Phase 1 implementation checklist (dependency order)

1. **Schema and RLS.** Add migrations under `supabase/migrations`:
   - Tables: `profiles`, `businesses`, `locations`, `qr_codes`, `ai_usage_events`, `usage_allowances`, `audit_events`, `dashboard_notifications`.
   - Every tenant table is scoped by `business_id`, with RLS on.
   - Automated cross-tenant denial tests.
2. **Auth.** Email/password and Google Sign-In through Supabase, then a `profiles` row created on sign-up. Owner-only model.
3. **App shell.** Build the chosen layout from the design system: navigation, buttons, badges and chips as React components on the mapped Tailwind tokens.
4. **Business and location onboarding.** Includes manual setup of the Google review link and Place ID.
5. **QR codes.** Stable platform URL `/r/{code}`, generation, PNG and SVG download.
6. **Public QR page.**
   - Rating, attribute chips and an optional comment.
   - Rate-limited server action calls Gemini and returns 3–5 suggestions.
   - Edit, copy, then continue to Google. The same path appears for every rating.
   - Fallback when AI is paused.
7. **AI usage metering.** Log tokens and cost per call with an idempotency key; enforce the allowance.
8. **Dashboard v1.** Overview, locations and QR views, usage meter, in-dashboard notifications.
9. **GBP connect flow.** Only if access is granted. Separate OAuth, encrypted refresh token, read-only review list.
10. **Operations.** Error monitoring, logs that never contain secrets, privacy notice page.

---

## 7. Open decisions for the owner

1. **Dashboard layout:** Overview + Inbox (recommended), Top nav, or another combination.
2. **Missing designs:** the customer QR page first, then onboarding and settings screens. Should Claude design these from the system, or will design come separately?
3. **Icon set:** adopt Lucide (or similar), or extract the inline SVGs.
4. **Gemini model:** decide after the cost benchmark.
5. **Rate-limit and monitoring providers:** Upstash and Sentry proposed.
6. **Product name and domain:** needed for the OAuth consent screen and legal pages.
7. **GBP applicant:** which business profile qualifies for the API application.
