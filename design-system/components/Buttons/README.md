Buttons and chips: fully round pill buttons with a glossy blue primary, white "light" buttons that lift off the page, chip-round filters, and glass status badges, adapted from the warmwind reference.

**Variants**

| Variant | Use for | Fill | Text | Edge |
|---|---|---|---|---|
| Primary | The one main action per view | `action-primary` | `action-on-primary` | `shadow-button-primary` (glossy inner highlight) |
| Light | Secondary actions, icon buttons, toolbar buttons | `bg-surface` | `text-primary` | `shadow-button-light` (soft lift + hairline ring) |
| Text | Low-emphasis actions (Regenerate, Cancel) | none | `text-secondary` | none |
| Destructive | Discard, delete, disconnect | `bg-surface` | `status-danger` | `shadow-button-light` |
| Chip | Filters and QR attributes | `bg-surface`; selected `selection-bg` | `text-primary`; selected `action-primary-text` | `shadow-button-light`; selected inset `selection-border` ring |
| Badge | Reply statuses | status tint | status colour | `shadow-glass` (AI draft: dashed outline instead) |

**Shape and size**
- Radius: 1000px for every button, chip and badge.
- Heights: `control-sm` 32px (padding 14px), `control-md` 40px (padding 24px), `control-lg` 48px (padding 28px). Chips are 32px, or 44px (`field`) on touch screens.
- Type: Manrope 600 at 13–15px, −1% tracking.

**States**
- Hover: `action-primary-hover` or `bg-row-hover`.
- Pressed: scale to 97%.
- Focus: 2px `focus-ring` with a 2px offset.
- Loading: a spinner plus a progress word ("Publishing…").
- Disabled: 45% opacity.
- With reduced motion, the press scale and spinner animation are turned off.

**Glass:** `glass-fill` plus `backdrop-filter: blur(var(--blur-glass))` plus `shadow-glass`. Use it for the sidebar or top bar, floating toolbars, and badges over imagery. Content cards stay solid white with hairlines.

**Accessibility**
- White on blue is 4.7:1.
- Blue used as text is `action-primary-text` (#0063C7, 5.1:1 or better).
- Every badge keeps its icon and word.
