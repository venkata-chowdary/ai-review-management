Inbox split layout: a frosted-glass sidebar, a one-line metrics strip, and the review list beside a detail panel with the AI draft editor and activity history.

**Use it for** the Reviews page and anywhere people work through a queue.

**Structure**
- `sidebar-width` (240px) glass sidebar with:
  - location switcher
  - Workspace navigation (Overview, Reviews, Insights, QR codes, AI replies)
  - Account navigation (Locations, Billing, Settings)
  - AI-usage meter
  - account row
- 68px header with the page title, search and Sync now.
- Metrics strip: four figures separated by hairlines.
- `list-pane-width` (400px) list with Needs reply / All / Failed tabs. The selected row is `selection-bg`.
- Detail panel:
  - reviewer and rating
  - full review text
  - dashed AI draft with a tone selector
  - the approval rule and a reminder that publishing posts on Google
  - Regenerate / Edit / Approve & publish
  - an activity timeline

**Responsive:** below 1024px the sidebar becomes the icon rail and the detail panel opens as a drawer. Below 768px the list is full width and the detail is a full-screen sheet.
