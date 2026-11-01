# Local Business Review Platform — Product & Technical Master Plan

**Document status:** Planning draft  
**Working product label:** Local Business Review Platform (temporary descriptive name; final product/brand name is undecided)  
**Version:** 1.0  
**Primary launch market:** India  
**Initial pilot target:** 10–50 businesses  
**Initial vertical:** Restaurants and cafés, with an architecture that can expand to other local businesses  
**Last updated:** 1 November 2026

---

## 1. Executive Summary

The Local Business Review Platform is a multi-tenant SaaS platform for local businesses to collect authentic customer feedback, help customers express their experiences as Google review drafts, and manage Google reviews and owner responses from one dashboard.

The product has two connected workflows:

1. **Customer QR review assistant:** A customer scans a business QR code, selects a star rating and relevant experience attributes, optionally adds a comment, and receives 3–5 AI-generated review suggestions based only on their input. The customer can edit a suggestion and is redirected to Google to submit the review themselves. Customers do not need an account or app.
2. **Business reputation dashboard:** Owners connect Google Business Profile where supported, monitor reviews, configure AI reply tone and rules, review drafts that need approval, and optionally enable automated replies for eligible review types. Owners can manage multiple locations from one account.

The recommended initial technology stack is **Next.js + Supabase + Vercel + Google Gemini**, with Google Business Profile APIs and Google Cloud Pub/Sub for review notifications where access and configuration permit. The initial pilot should prioritize a reliable, useful core product rather than a large feature set.

### Product principles

- Help customers express genuine experiences; do not manufacture reviews.
- Do not gate or suppress negative feedback, or steer only satisfied customers toward Google.
- Never promise unlimited AI usage.
- Do not silently charge for AI top-ups.
- Keep business data isolated between accounts.
- Make automation transparent, configurable, auditable, and safe to recover from failures.
- Keep the first release operationally simple, while leaving room for future growth.
- Treat visual design and the payment provider as open decisions for now.

---

## 2. Goals and Success Criteria

### Initial goals

- Validate the customer QR journey with 10–50 pilot businesses.
- Make the QR review journey usable on mobile without customer registration.
- Reduce friction for owners managing Google reviews and replies.
- Demonstrate reliable business/location separation and secure Google account connections.
- Measure AI usage and costs from the first release.
- Learn which workflows and analytics are most valuable before expanding the product.

### Suggested pilot metrics

These are proposed measurement targets, not promises:

- Number of businesses that complete onboarding.
- Percentage of onboarded businesses that publish/use at least one QR code.
- QR landing-page visits and completion rates, measured with privacy-minimizing aggregate events if enabled.
- Number of AI generations and average cost per generation.
- Number of Google reviews synchronized and reply drafts created.
- Percentage of automated tasks completed successfully.
- Number of replies requiring owner approval and average time to resolution.
- Subscription conversion and renewal rates once billing is implemented.
- Support issues, integration failures, and duplicate-action incidents.

A QR scan or page visit must not be reported as a Google review submission. The product should only claim review submissions when reliable evidence is available.

---

## 3. Target Customers and Positioning

### Initial audience
- Independent restaurants and cafés.
- Small restaurant groups with multiple branches.

### Future audience
The product should be designed so it can expand to shops, salons, hotels, clinics, and other local businesses without requiring a separate architecture for each vertical.

### Positioning
A simple reputation-management tool that combines QR-based review assistance with Google review monitoring and configurable AI reply workflows.

Avoid promising guaranteed rating increases or a specific number of reviews. The product supports honest review writing and response management; it cannot control what customers decide to publish.

---

## 4. Customer QR Review Experience

### Proposed flow

1. Customer scans a QR code.
2. A fast, mobile-friendly landing page opens in the browser.
3. The page identifies the relevant business/location and shows clear, neutral prompts.
4. Customer selects a star rating and applicable experience attributes. Restaurant examples include food quality, staff, ambience, speed, cleanliness, and value.
5. Customer may optionally enter their own comment.
6. The server sends the supplied information to Gemini using a controlled prompt.
7. Gemini returns 3–5 distinct review suggestions grounded in the customer's input.
8. The customer chooses and may edit a suggestion.
9. The customer follows a clear link to Google to submit the review themselves.

### Required safeguards

- Do not invent dishes, services, staff interactions, events, or other experiences.
- Do not force a positive rating or block negative feedback.
- Do not route only positive ratings to Google. The same neutral path should be available regardless of rating.
- Do not auto-submit reviews or impersonate customers.
- Make it clear that the customer is responsible for reviewing and editing the text before submitting.
- Keep prompts and examples neutral and avoid pressure, rewards, or misleading claims.
- Do not require customers to register or provide contact details.
- Launch text-only; consider optional photo support later.

### QR behavior and management

- Each business location has a stable identity and Google review destination.
- QR codes should resolve through a platform-managed URL so the destination or landing-page behavior can be updated without reprinting physical codes.
- The initial product uses a standardized template. Branding and layout customization can be considered later.
- Multiple codes per location and scan analytics may be supported as implementation details, but they are not required to block the initial pilot.
- QR pages should remain usable during subscription suspension. If AI is paused, provide a clear fallback link to the business's Google review page rather than a broken page.

---

## 5. Business Dashboard and Review Management

### Dashboard direction
The visual design is intentionally undecided. Functional requirements are established; colors, typography, brand identity, and final layouts will be selected later.

The dashboard should be responsive and include:

1. **Overview:** Review count, average rating, recent activity, AI usage and allowance remaining.
2. **Action center:** Pending approvals, sensitive reviews, integration problems, and failed tasks.
3. **Reviews:** Searchable/filterable review list with location, rating, date, sentiment classification where available, reply status, and timestamps.
4. **Locations:** Create/manage locations and their Google connections.
5. **QR codes:** Create and download codes, with location mapping.
6. **AI settings:** Global defaults and per-location overrides.
7. **Analytics:** Basic and advanced metrics according to plan.
8. **Account and subscription:** Plan, allowance, usage, and billing status when billing is implemented.

### In-dashboard notifications only for MVP
- Pending reply approvals.
- Google connection or permission issues.
- Failed processing and automation tasks.
- AI allowance reached or nearing its limit.
- Subscription/payment status when billing is introduced.

Email notifications are out of scope for the initial release unless later requested.

---

## 6. AI Reply Workflow

### Hybrid automation
Owners can configure automation by review category and location.

- Routine/eligible reviews may receive an automatic reply only after the owner has explicitly enabled and authorized automation.
- Negative, sensitive, uncertain, or policy-risky reviews should be drafted for owner approval or escalated.
- The system must never fabricate promises, compensation, private facts, or unsupported details.
- Owners can choose a tone and add optional custom instructions.
- Global settings act as defaults; locations can override them.
- Maintain an audit trail of generated drafts, approvals, automatic actions, errors, and final Google responses.

### Suggested workflow
1. Receive a Google review notification or discover a review during reconciliation.
2. Verify the connected account/location and retrieve the authoritative review.
3. Check whether the review has already been processed.
4. Classify the review and apply the location's active rules.
5. Generate a reply draft with Gemini using the business's preferences and review content.
6. Apply policy and safety checks.
7. If eligible and explicitly authorized, post the reply; otherwise add it to the approval queue.
8. Persist status, timestamps, provider response, and audit event.
9. Retry transient failures safely. Never blindly repost after an ambiguous timeout; reconcile the remote state where possible.

### Reply settings
- Tone selector (for example: friendly, professional, warm, formal).
- Optional custom instructions.
- Reply length preference can be a later setting if it adds value.
- Automation enabled/disabled.
- Approval rules by review type.
- Global defaults with per-location overrides.

---

## 7. Google Business Profile Integration

### Connection options
Support both:
- **Manual setup:** Business details and Google Maps review link can be entered to enable the QR review journey.
- **Connected profile:** Owner completes OAuth authorization and grants the required permissions for supported review monitoring and response capabilities.

Signing in with Google is not the same as connecting Google Business Profile. The owner must separately authorize the required business-profile access.

### Notifications
Google Business Profile documentation describes review event notifications, including new and updated reviews, using Google Cloud Pub/Sub and the Business Profile Notifications API. The implementation should use event-driven notifications where available and retain a scheduled reconciliation mechanism to detect missed events.

Official documentation to verify during implementation:
- Business Profile API prerequisites: https://developers.google.com/my-business/content/prereqs
- Notification setup: https://developers.google.com/my-business/content/notification-setup
- Reviews API reference: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews

### Important dependencies and risks
- Google Business Profile API access and eligibility must be confirmed before promising monitoring or reply automation to customers.
- OAuth scopes, ownership/manager access, quotas, API terms, and notification configuration must be tested.
- Pub/Sub notifications indicate that an event occurred; the application still needs to retrieve the review and run its workflow.
- API behavior and policy requirements can change; verify current official documentation during implementation.
- Keep manual Google review-link functionality useful even when full API access is unavailable.

---

## 8. Product Plans and Pricing (Provisional)

Proposed India pricing, subject to validation and cost modeling:

| Plan | Proposed monthly price | Included locations | Analytics |
|---|---:|---:|---|
| Starter | ₹499/month | 1 | Basic |
| Growth | ₹1,499/month | Up to 3 | Advanced analytics and location comparisons |
| Pro | ₹3,999/month | Up to 10 | Advanced analytics, downloadable reports, and consolidated multi-location reports |

### Core feature parity
All plans are intended to include the same core capabilities:
- QR-based AI review suggestions.
- 3–5 suggestions per generation.
- AI reply drafting.
- Core reply customization (tone selector and custom instructions).
- Hybrid automation controls.
- Google review monitoring and notifications, where the customer's connection and available API access permit.
- In-dashboard notifications.
- Privacy and security protections.

Plan differentiation is primarily based on location count, analytics/reporting, and AI allowance.

### AI usage and top-ups
- Every plan has a defined monthly allowance; no plan promises unlimited usage.
- Allowances scale with plan/location capacity.
- Exact allowances and top-up prices are **not yet decided**. Set them only after estimating Gemini token usage, prompt sizes, expected review volume, and margin.
- Track usage per account and show usage/remaining allowance in the dashboard.
- When the allowance is exhausted, pause AI generation, explain why, and offer either waiting until reset or an optional clearly priced top-up.
- Never purchase top-ups or charge a payment method without explicit customer confirmation.
- Define abuse protection, idempotency, and accounting for failed/partial AI requests.

### Billing provider
**Undecided by request.** Razorpay, Stripe, or another provider should be evaluated later based on business eligibility, India payment methods, recurring billing, tax/invoice needs, international expansion plans, and current provider terms.

### Subscription failure behavior
- Use a configurable grace period after a failed renewal.
- Notify owners in the dashboard.
- Preserve account data and historical records.
- After grace period, pause paid automation according to clearly documented rules.
- Keep QR landing pages usable, with AI disabled and a Google review link fallback.
- Restore service safely after payment recovery.
- Exact grace duration and billing rules remain open.

---

## 9. Recommended Technical Architecture

### Core stack

| Layer | Recommendation |
|---|---|
| Web application | Next.js with TypeScript |
| Hosting | Vercel |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth: email/password and Google Sign-In |
| Database access control | PostgreSQL Row-Level Security (RLS) |
| AI provider | Google Gemini, called server-side |
| Review notifications | Google Business Profile Notifications API + Google Cloud Pub/Sub, subject to access/configuration |
| Background work | Begin with a simple reliable job mechanism compatible with the chosen deployment; add a dedicated worker/queue when justified |
| QR generation | Server or client library that generates stable QR destinations and downloadable assets |
| Billing | Provider undecided |
| Error monitoring | Select a production error/logging service during implementation |
| Analytics/report exports | PostgreSQL queries initially; PDF/CSV generation added in later phase |

### High-level flow

```text
Customer phone / Business owner's browser
                 |
                 v
          Next.js application
        (Vercel-hosted web app)
          /      |       \
         /       |        \
        v        v         v
   Supabase   Gemini API   Google APIs
  Auth/DB/RLS (server-side)  (OAuth/reviews/replies)
        ^                    |
        |                    v
        |             Google Cloud Pub/Sub
        |                    |
        +--------- Next.js secure endpoint / job processor
                             |
                             v
                    Review workflow + audit log
```

This is a conceptual diagram, not a final deployment topology. The exact placement of Pub/Sub push endpoints, background jobs, and scheduled reconciliation must be validated against current Vercel execution limits, retry semantics, and operational requirements.

### Why Next.js + Supabase
This approach reduces initial operational overhead compared with maintaining a separate frontend and custom backend service. Next.js can handle server-side application logic and API endpoints; Supabase provides managed PostgreSQL and authentication. The architecture should be modular so a dedicated backend/worker can be added later if background processing or scale requires it.

### Server-side security requirements
- Gemini API keys, Google credentials, OAuth refresh tokens, and any privileged Supabase key must never be exposed to the browser.
- Use least-privilege access for server secrets and service accounts.
- Validate all inputs and enforce rate limits on public QR endpoints and AI generation.
- Apply RLS to every tenant-owned table and test cross-tenant access attempts.
- Treat browser-supplied business/location IDs as untrusted.
- Verify OAuth state and callback parameters.
- Verify billing webhooks before changing subscription state.
- Use idempotency keys and durable task state for retries.
- Keep sensitive tokens encrypted/managed using suitable platform secret storage.
- Avoid storing customer personal data that is not required.

---

## 10. Data Model (Initial Concept)

The final schema will be designed and migration-tested before implementation. Suggested core tables:

- `profiles` — application user profile linked to Supabase Auth.
- `businesses` — tenant/account and business-level configuration.
- `business_members` — optional future extension for staff roles; MVP can enforce owner-only access.
- `locations` — branches and location-specific configuration.
- `google_connections` — OAuth connection metadata and encrypted token references/credentials.
- `qr_codes` — stable code identifier, location, destination, active state, and optional placement label.
- `reviews` — provider review ID, location, rating, text, timestamps, and sync metadata.
- `review_events` — received/processed event records and deduplication identifiers.
- `reply_drafts` — AI draft, status, approval state, posted reply metadata, and failure reason.
- `automation_settings` — global defaults and per-location overrides.
- `ai_usage_events` — model, operation type, token/usage measurements, estimated cost, and idempotency key.
- `subscription_accounts` — plan, status, period, and provider identifiers once billing is implemented.
- `usage_allowances` — allowance period, included amount, consumed amount, and top-up balance if applicable.
- `audit_events` — important security, configuration, approval, and automation actions.
- `dashboard_notifications` — in-app notification items and read state.
- `scan_events` — optional aggregate/minimal QR engagement metrics if enabled; avoid storing unnecessary personal identifiers.

### Data isolation
Every tenant-owned record must be associated with a business/account scope. RLS and server-side authorization must enforce access; hiding UI elements alone is not security. Queries and jobs must verify that a Google connection, location, review, and subscription belong to the expected business.

### Retention
Define a documented retention schedule for customer-entered comments, generated text, review records, logs, and tokens. Avoid retaining raw customer QR-session input longer than needed unless a clear operational purpose and disclosure justify it. Keep audit records sufficient for security and billing disputes without storing unnecessary personal data.

---

## 11. Security, Privacy, and Trust

### Customer privacy
- No customer accounts required for QR use.
- Do not ask for names, email addresses, or phone numbers for review generation.
- Process user input to generate suggestions and avoid unnecessary session retention.
- Avoid collecting IP/device identifiers for analytics unless necessary and appropriately disclosed.
- Separate customer-supplied content from AI-generated text.
- Publish a privacy notice explaining relevant processing and third-party AI usage.

### Business security
- Strict tenant isolation through RLS and server-side checks.
- Secure OAuth and token handling.
- Audit logs for automated actions and configuration changes.
- Least-privilege service access.
- Rate limits, abuse controls, and input validation.
- Regular backups and tested restore procedures.
- Production secrets separated from local development.
- Error messages must not expose tokens, internal prompts, or sensitive data.

### AI trust controls
- Use prompts that instruct Gemini to rely only on supplied facts.
- Do not create false experiences, unsupported claims, or fabricated apologies/compensation.
- Use conservative automation rules for sensitive/uncertain reviews.
- Make human approval available.
- Log the decision and result for automated actions.
- Keep human owners accountable for the public replies made under their authorization.

### Operational resilience
- Use controlled retry/backoff for transient Google/API errors.
- Reconcile state after ambiguous timeouts before retrying public replies.
- Deduplicate incoming notifications and processing jobs.
- Alert owners in the dashboard when their Google connection needs attention.
- Maintain a reconciliation process for missed Pub/Sub events.
- Keep QR pages functional during account suspension with AI paused and a Google-link fallback.

---

## 12. Analytics and Reporting

### Starter
- Total reviews.
- Average rating.
- Review volume over time.
- Basic reply status.
- AI allowance and usage.

### Growth
Everything in Starter, plus:
- Rating and sentiment trends.
- Common feedback themes (clearly labeled as AI-derived analysis).
- Reply rate and response-time metrics.
- Location comparisons.

### Pro
Everything in Growth, plus:
- Downloadable PDF/CSV reports.
- Consolidated multi-location reporting.
- More detailed reporting periods and summaries.

### Data interpretation rules
- Sentiment and topic labels are AI estimates, not objective truth.
- Distinguish data fetched from Google from product-generated interpretations.
- Do not claim a QR visit led to a posted review unless that is verifiably known.
- Define metric formulas consistently (for example, what counts as a reply and how response time is measured).

---

## 13. Phased Delivery Plan

The exact scope may shift after technical validation. Some foundational reliability work must be implemented early even if the full feature is released later.

### Phase 0 — Validation and technical spikes
- Verify Google Business Profile API access prerequisites and test account eligibility.
- Test OAuth, review retrieval, reply posting, notifications, and Pub/Sub configuration.
- Validate Vercel's fit for secure notification endpoints and any required background tasks.
- Benchmark Gemini quality and costs using representative inputs.
- Confirm QR-to-Google destination behavior.
- Finalize data model, tenant isolation strategy, and AI usage accounting.
- Define privacy notice, terms, and acceptable-use rules with appropriate professional review where needed.

**Exit criteria:** Critical external integrations are proven feasible, and cost assumptions are documented.

### Phase 1 — Core MVP
- Authentication: email/password and Google Sign-In.
- Owner-only account model.
- Business and location setup.
- Manual Google review link setup.
- Google Business Profile connection flow where access is available.
- Standard QR landing page and QR generation/download.
- Rating/attribute/comment input.
- Gemini generation of 3–5 review suggestions with safeguards.
- Redirect to Google for customer submission.
- Basic dashboard and review/location views.
- Secure tenant data model and RLS.
- Foundational usage metering, rate limits, logging, and monitoring.
- In-dashboard notifications for key failures where the relevant integration exists.

**Exit criteria:** Pilot users can onboard, create/use QR codes, generate suggestions reliably, and only access their own data.

### Phase 2 — Review automation and monetization
- Google review notifications via Pub/Sub, if access and configuration are approved.
- Review synchronization and reconciliation.
- Hybrid AI reply drafts and automation.
- Global AI settings with per-location overrides.
- Approval queue for sensitive/uncertain reviews.
- Idempotent processing, retries, and audit history.
- Subscription billing integration (provider selected later).
- Monthly AI allowance enforcement and explicit top-ups.
- Grace period and suspension behavior.
- Advanced analytics and branch comparisons.

**Exit criteria:** Automation is safe, observable, recoverable, and has tested cost controls.

### Phase 3 — Reporting and expansion
- Downloadable PDF/CSV reports.
- Consolidated multi-location reporting.
- Improved scan/engagement analytics with privacy minimization.
- Additional QR placements per location if useful.
- Photo upload support for customer review drafting, if validated.
- Staff roles and agency/multi-business capabilities if demanded.
- Additional local-business verticals.
- International payment support if business strategy warrants it.

---

## 14. Testing and Release Readiness

### Required testing
- Unit tests for prompts, usage accounting, plan rules, and workflow state transitions.
- Integration tests for Supabase RLS and tenant boundaries.
- OAuth connection, token expiry, and revocation tests.
- Google review retrieval/reply API tests.
- Pub/Sub duplicate, delayed, and missed-event tests.
- Retry/idempotency tests, especially ambiguous reply-post timeouts.
- AI output validation and prompt-injection robustness tests.
- QR landing-page tests on common mobile screen sizes and browsers.
- Subscription renewal, failure, grace-period, top-up confirmation, and reactivation tests once billing exists.
- Load/rate-limit tests for public QR and AI endpoints.
- Backup/restore test before production launch.

### Release checklist
- Production credentials and secrets configured securely.
- Privacy notice and terms published.
- Google API access and permissions verified.
- Tenant isolation tests pass.
- AI allowance and cost telemetry verified.
- Failure states are visible and understandable.
- QR pages have graceful fallback behavior.
- Logs do not leak secrets or unnecessary customer content.
- Monitoring and recovery runbooks documented.
- Pilot feedback channel established.

---

## 15. Key Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Google API access unavailable or delayed | Validate access early; keep manual review-link QR flow useful |
| Google notifications missed or delayed | Pub/Sub plus scheduled reconciliation and durable event tracking |
| Duplicate public replies | Idempotency, state checks, and remote-state reconciliation before retries |
| AI invents facts in review drafts/replies | Ground prompts in provided facts, validate outputs, allow editing/approval, conservative automation |
| AI cost exceeds plan revenue | Measure usage, set quotas, tune prompts/models, use explicit top-ups |
| Cross-business data exposure | RLS, server-side authorization, negative security tests, least privilege |
| QR traffic abuse | Rate limits, request validation, abuse monitoring, quota protection |
| Owner's Google authorization expires | Dashboard alert, pause affected operations, guide reconnection |
| Billing provider changes or is delayed | Keep provider undecided and isolate billing integration behind a module |
| Overbuilding before market validation | Pilot with 10–50 businesses; defer advanced features based on evidence |
| UI decisions made too early | Keep visual design open; lock functional requirements first |
| Misleading review analytics | Label estimates, define metrics, distinguish visits from actual Google submissions |

---

## 16. Decisions Log

### Confirmed
- Product: QR-based AI review drafting plus Google review management/replies.
- Initial audience: restaurants and cafés; architecture should expand to local businesses.
- Initial pilot: approximately 10–50 businesses.
- Customer flow: mobile web, no app/account required.
- Review drafts: 3–5 options generated from customer-selected answers and optional comments.
- Customer review generation launches text-only; photo support later.
- Standardized QR landing page for initial launch.
- Manual Google review-link setup plus Google Business Profile connection.
- One owner account manages multiple locations.
- Hybrid reply automation: routine eligible reviews can be automatic; sensitive/uncertain reviews go to approval.
- Global AI defaults with per-location overrides.
- Authentication: email/password and Google Sign-In.
- Stack: Next.js + Supabase, hosted on Vercel.
- AI provider: Google Gemini.
- Google review notifications: desired across all paid plans, subject to API access.
- Notification channel: in-dashboard only for initial release.
- Dashboard: combined overview and action center.
- Data collection: minimal; no unnecessary customer personal details.
- Usage: plan-based monthly allowances, no unlimited promises, pause at limit, optional explicitly purchased top-ups.
- Pricing proposal: Starter ₹499/month (1 location), Growth ₹1,499/month (up to 3), Pro ₹3,999/month (up to 10); provisional.
- Core review generation and reply customization should be available across all plans.
- Analytics/reporting differentiate plans.
- Subscription failures: grace period, retain data, pause paid automation after the period.
- QR pages remain usable during suspension with AI paused and Google link fallback.
- Security model starts owner-only; no staff roles in MVP.
- UI visual style: undecided.
- Payment provider: undecided.
- Onboarding: default to self-service with optional assisted help, but can be revisited.
- Phased launch: core MVP, then automation/monetization, then advanced reporting/expansion.

### Recommendations/assumptions to validate
- Exact Google API eligibility and supported notification/reply behavior.
- Exact Pub/Sub delivery and background-worker topology.
- Gemini model selection, prompt design, and cost per operation.
- AI usage allowances and top-up prices.
- Billing provider, grace period duration, tax/invoice behavior.
- Final schema, retention duration, and privacy/legal disclosures.
- Final visual design and QR print templates.
- Whether scan analytics should be included in the initial pilot.
- Final plan prices after competitor/cost validation.

---

## 17. Immediate Next Steps

1. **Validate Google API feasibility first.** Confirm API access, OAuth permissions, review retrieval/reply support, and Pub/Sub notification setup with a test business.
2. **Prototype the customer QR journey.** Test rating/attribute input, optional comments, Gemini's 3–5 suggestions, editing, and Google redirect.
3. **Create the tenant-safe Supabase schema.** Implement RLS and automated cross-tenant security tests before real business data is stored.
4. **Measure Gemini cost.** Record input/output usage per operation and model the monthly allowance for each plan.
5. **Build a minimal owner dashboard.** Focus on onboarding, locations, QR codes, basic review data, AI usage, and clear errors.
6. **Run a small pilot.** Start with a handful of restaurants, gather feedback, and expand toward 10–50 businesses.
7. **Finalize billing and UI later.** Avoid prematurely locking the payment provider or visual design.

---

## 18. Official Technical References

Use current official documentation during implementation because API availability, quotas, terms, and platform limits can change.

- Next.js documentation: https://nextjs.org/docs
- Supabase documentation: https://supabase.com/docs
- Vercel documentation: https://vercel.com/docs
- Gemini API documentation: https://ai.google.dev/gemini-api/docs
- Google Business Profile API prerequisites: https://developers.google.com/my-business/content/prereqs
- Google Business Profile notification setup: https://developers.google.com/my-business/content/notification-setup
- Google Business Profile Reviews API: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews
- Google Cloud Pub/Sub documentation: https://cloud.google.com/pubsub/docs

---

**End of master plan.**
