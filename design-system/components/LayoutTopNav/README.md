Top navigation layout: a frosted-glass top bar with horizontal navigation, centered content up to `content-max`, a review feed with inline AI drafts, and a "Needs attention" side rail.

**Use it for** a lighter, website-like product where owners check in occasionally.

**Structure**
- `topbar-height` (64px) glass bar: location switcher, navigation pills (the active one on `sidebar-active-bg`), notifications, settings and account.
- Page header with the title, date range and search.
- Four KPI cards.
- Feed with status tabs and Filters. Each review card has its draft and actions inline.
- Right rail (340px):
  - **Needs attention:** failed reply, approvals waiting, Google access expiring.
  - **Rating breakdown.**

**Trade-offs:** about five top-level items fit before a "More" menu is needed, and long feeds mean more scrolling than a split view.
