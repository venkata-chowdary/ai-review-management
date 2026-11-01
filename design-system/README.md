> **Status: theme, buttons and navigation set; layout under review.** The theme is **Apple Cool base, warmwind blue #0071E3, glass navigation, subtle intensity, Manrope**. Buttons, chips and badges follow the warmwind reference: fully round pills, a glossy blue primary, white buttons that lift off the page, and glass edges. No layout is selected yet.

## 1. Colour

The product is calm and neutral with one bright, friendly blue.

- **Page** on `bg-app` (Apple's cool light grey). **Cards, panels and inputs** on `bg-surface` (white), separated by hairlines (`border-subtle`).
- **Blue** (`action-primary`, #0071E3) fills primary buttons, counts, progress and the latest chart value. White text on it reads 4.7:1.
- **Blue as text** (links, the selected tab and chip labels, "Awaiting approval") uses the slightly deeper `action-primary-text` (#0063C7, 5.1:1 or better).
- **Selection** is a soft blue wash (`selection-bg`) with a light blue edge (`selection-border`).
- **Navigation** is frosted glass: `sidebar-bg` (→ `glass-fill`) with `shadow-glass` and `blur-glass`. Labels are `sidebar-text` and `sidebar-text-muted` (4.9:1). The active item is a blue pill on `selection-bg` with `action-primary-text`, and counts are blue pills.
- **Status colours** appear only where named: green (`status-success`) for Published, red (`status-danger`) for Failed and errors, amber (`star`) for stars. AI draft and Queued are grey.

| Token | Value | Use |
|---|---|---|
| `bg-app` | #F5F5F7 | Page background |
| `bg-surface` | #FFFFFF | Cards, panels, inputs, light buttons |
| `bg-subtle` | #EBEBEF | Tab tracks, table headers, meter tracks |
| `text-primary` | #1D1D1F | Main text |
| `text-secondary` | #636368 | Meta and helper text |
| `action-primary` | #0071E3 | Blue button fill |
| `action-primary-hover` | #0063C8 | Hover and pressed |
| `action-primary-text` | #0063C7 | Blue text |
| `selection-bg` | #E6F1FC | Selected rows, chips, nav items |
| `glass-fill` | rgba(255,255,255,0.72) | Frosted sidebar, top bar, toolbars |

## 2. Buttons, chips and badges (from warmwind)

- **Shape:** every button, chip, badge, tab and nav item is a full pill (1000px radius).
- **Primary:** blue fill with `shadow-button-primary`, a stack of four shadows. Together they make a soft inner glow, a small lift, and a white highlight line just under the top edge that reads as a glossy, glassy border.
- **Light:** white fill with `shadow-button-light`, a soft lift plus a hairline ring. Use it for secondary actions, icon buttons and toolbars.
- **Text:** no fill, `text-secondary`. Use it for low-emphasis actions such as Regenerate.
- **Destructive:** a light button with `status-danger` text.
- **Chips:** light buttons that turn `selection-bg` with blue text and a `selection-border` ring when selected.
- **Badges:** a tinted pill with `shadow-glass`, which adds hairline sides and white highlights top and bottom. The AI draft badge keeps its dashed outline because dashed means not public.
- **Glass surfaces:** `glass-fill`, `backdrop-filter: blur(var(--blur-glass))` (18px) and `shadow-glass`. Use them on navigation, floating toolbars, and badges over photos or QR previews. Content cards stay solid white so text stays crisp.
- **Sizes:** `control-sm` 32px (padding 14px), `control-md` 40px (padding 24px), `control-lg` 48px (padding 28px). Chips are 32px, or 44px on touch screens.
- **States:**
  - hover: `action-primary-hover` or `bg-row-hover`
  - pressed: scale to 97%
  - focus: 2px `focus-ring` with a 2px offset (a white inner ring on blue buttons)
  - loading: spinner plus "Publishing…"
  - disabled: 45% opacity
  - reduced motion: press scale and spinner animation turned off

See the **Buttons & chips** card.

## 3. Typography: Manrope

- **Weights:** 700 for headings and figures, 600 for controls and labels, 500 for meta, 400 for reading text.
- **Scale:** `display` 32/40, `page-title` 24/32, `section` 17/24, `card-title` 15/22, `body` 14/22, `control` 14/20, `label` 13/18, `small` 12/18, `metric` 30/36.
- **Numbers:** tabular figures throughout. Large sizes and button labels use slightly tighter tracking.

## 4. Three layout options

Each one is a full 1280px desktop screen with the same data, all with glass navigation.

| | Inbox split | Top navigation | Overview home |
|---|---|---|---|
| Navigation | Sidebar (240px) | Top bar (64px) | Icon rail (76px) |
| First screen | Review list beside a detail panel | Review feed with inline AI drafts | Greeting, action queue, KPIs, recent reviews |
| Best for | Clearing the queue daily | Occasional check-ins; feels like a website | A home page that says what needs doing |
| Trade-offs | Denser; detail needs a drawer on tablets | Fewer nav items fit; more scrolling | Reviewing still happens on another page |

A common combination is the **Overview home** as the landing page with the **Inbox split** as the Reviews page.

**Responsive behaviour:**
- Below 1024px the sidebar collapses to the icon rail.
- Below 768px navigation becomes a bottom tab bar.
- Detail panels become full-screen sheets.
- KPI tiles reflow 4 → 2 → 1.
- Tables become stacked rows.

## 5. Rules carried through

- **Dashed means not public; solid means published.** AI drafts are labelled "AI draft · not published". Each of the five reply statuses has an icon and a word.
- Stars always show the number; sentiment is a word and an icon.
- The customer QR page never implies a submission. The customer posts on Google themselves.

## 6. Labelled assumptions

- **Assumption:** React and Tailwind, so the BEUI components can be re-themed with these tokens and shadows.
- **Assumption:** a dark theme comes later and will be derived from the same blue.
- "[Business name]", reviewer names, locations and the "Owner / Pro plan" account row are placeholders.
