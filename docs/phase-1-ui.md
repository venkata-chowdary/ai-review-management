# Phase 1 — Application foundation and UI

**Date:** 2 November 2026
**Scope:** a navigable, responsive UI on sample data. There is no auth, database, AI or Google integration yet.

## Decisions

- **Layout:** the Overview home is the landing page (`/`) and the Inbox split is the Reviews page (`/reviews`). One glass sidebar (240px) is used everywhere. It becomes the icon rail (76px) below 1024px and a glass bottom tab bar below 768px. The tab bar's "More" sheet holds the remaining pages, the location picker and AI usage.
- **Icons:** the mockups' inline SVGs live in one typed component, `src/components/icons/Icon.tsx`, with no icon library. A few new glyphs follow the same 1.8-stroke style: close, copy, external, sparkle, bell, chevron-left, trend-down, sentiment faces, user and shield.
- **Hover motion:** this is CSS only, played by any ancestor with the `group` class (see `globals.css`):
  - `spin`: Sync, Retry, Settings
  - `nudge`: right chevrons, external links, copy
  - `draw`: the check on Approve and Save
  - `wiggle`: available for alerts

  Reduced motion turns these off, along with the press scale and spinners.
- **Dependencies:** none added.

## Design fidelity

The Overview and Reviews pages are ported class by class from `design-system/components/LayoutOverview` and `LayoutInbox`. Buttons, chips, badges and tabs match `components/Buttons`. All colours, radii, shadows and sizes come from `design-system/tokens.css` through the Tailwind theme in `src/app/globals.css`, and nothing is hard-coded.

Deviations needed to fit the sidebar layout:
- On the Overview, the rating breakdown sits beside the recent-reviews table only from 1360px; below that it stacks under the table. The Location column hides below 1280px. (The mockup has the 76px rail, which leaves more room.)
- On the Reviews page, the list pane is 340px between 1024 and 1279px, and the token `list-pane-width` (400px) from 1280px.

## Provisional screens (no mockup yet)

These are composed only from existing components, with no new visual language. Review them before they're treated as final.

| Screen | Contents |
|---|---|
| Insights | KPI tiles, weekly reviews bar chart, rating breakdown, sentiment, QR attribute mentions, per-location table |
| QR codes | One card per location with a placeholder QR graphic (it does not scan), scan count, link, Open page and Copy link. PNG/SVG download is disabled. |
| AI replies | Tone chips, approval rule, auto-publish switch, custom instructions, per-location overrides. Saving is simulated. |
| Locations | Location list with Google connection badges. Add, Edit and Reconnect are disabled. |
| Billing | Plan and AI usage. No prices are shown, because pricing is provisional. |
| Settings | Read-only business details, notifications, account |
| Customer QR page `/r/[code]` | Star rating, 44px attribute chips, optional comment, then 3 suggestions to edit and copy, then Continue to Google. The same path is used for every rating. Includes an "AI paused" fallback. |

On the QR page, the suggestions are templates built only from the customer's rating, chosen attributes and comment, so nothing is invented. Phase 2 swaps `suggest()` in `ReviewAssistant.tsx` for the Gemini server action.

## States

| State | How it shows |
|---|---|
| Loading | Skeletons for each page through `<Suspense>`, plus `(dashboard)/loading.tsx` |
| Empty | "All caught up", "No failed replies", "No reviews match", "No locations yet", "No invoices yet" and similar |
| Error | `(dashboard)/error.tsx` with Try again (`retry`) and a link to Overview |
| Not found | `(dashboard)/not-found.tsx` inside the shell, and `app/not-found.tsx` for unknown URLs and QR codes |

Preview any state with `?state=loading|empty|error` (development only).

## Simulated actions

These show their real loading states but change nothing:
- Approve & publish, Retry publish, Regenerate
- Sync now
- Save changes on AI replies
- Copy on the QR pages, which does write to the clipboard

Each action says "Demo only" where something would have been sent.

## Where Phase 2 plugs in

- **Data:** replace the bodies in `src/lib/mock/loaders.ts` (`getOverview`, `getReviews`, `getInsights`, `getLocations`, `getUsage`) with Supabase queries. The UI types live in `src/lib/mock/types.ts`.
- **Actions:** wire `DraftPanel`, `SyncButton`, `AiSettingsForm` and `ReviewAssistant` to server actions.
- **Known gap:** `/r/[unknown]` renders the not-found page with HTTP 200, because the lookup streams inside Suspense. A real 404 needs the lookup moved before streaming, or `generateStaticParams`.
