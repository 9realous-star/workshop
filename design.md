# design.md

Style guide describing the visual design system as it currently exists across the workshop site's pages. This documents the *implementation as-is* — each page currently repeats these rules in its own `<style>` block rather than pulling from a shared stylesheet (see [CLAUDE.md](CLAUDE.md) "Known issues"). If a shared CSS file is ever extracted, this doc is the source of truth for what it should contain.

## Palette

- **Background**: dark "cosmic" gradient, `linear-gradient(135deg, #0f0c29, #302b63, #24243e)`. `reboot.html` uses a slightly different dark navy variant.
- **Per-section accent colors** (semantic, one per page/feature):
  - Purple `#a78bfa` / `#c4b5fd` — primary / Refresh
  - Blue `#60a5fa` / `#93c5fd` — Review
  - Green `#34d399` / `#6ee7b7` — Reboot / success states
  - Orange `#fb923c` / `#fdba74` — Cheer / call-to-action
  - Amber `#fbbf24` — individual highlights

## Typography

- Font: Google Font "Noto Sans KR", weights 400/500/700/900.
- Headings use gradient-clipped text (`background-clip: text` with a gradient fill).
- Badges/labels: uppercase, small text, wide `letter-spacing`, pill-shaped background.

## Layout

- Page content wrapped in a `.wrap` container, `max-width: 960–1100px`.
- Generous rounding: 16–24px border-radius on cards and panels.
- Glassmorphism on the fixed bottom nav: translucent `rgba(...)` background + `backdrop-filter: blur(...)`.

## Components

- **Cards**: gradient top border, hover lift (`translateY(-5px)` + colored box-shadow matching the section accent color).
- **Timeline items**: vertical connecting line between entries (used in `refresh.html`, `index.html` schedules).
- **Progress bars**: animated fill on load (`review.html` retrospective).
- **Chips/tags**: small rounded pill elements for affiliations/categories.
- **Toasts**: transient notification popups (`cheer.html`).
- **Pulsing dot**: `@keyframes pulse` animation used for live/active indicators (`reboot.html`).

## Interaction

- Transitions: `0.2s`–`0.3s` on hover/focus state changes.
- `scroll-behavior: smooth` site-wide.
- Fixed bottom icon-navigation bar present on all 6 pages, with the active page's icon colored to match that page's accent color.

## Responsive

- Primary breakpoint: `@media (max-width: 768px)` — collapses multi-column grids to 1–2 columns, shrinks nav and heading font sizes. Some pages add narrower breakpoints beyond this for smaller phones.
