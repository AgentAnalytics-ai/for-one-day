# For One Day Design System (Lite)

This is the lightweight system used to keep Figma explorations and Next.js implementation aligned.

## 1) Brand Direction

- Positioning: memories-first, calm, premium, human.
- Visual tone: editorial serif headlines + clean sans body.
- Interaction tone: subtle and reassuring (no aggressive motion).

## 2) Core Tokens

## Color

- Brand anchors:
  - Primary navy: `#102A43`
  - Primary depth/hover: `#0B1F33`
  - Accent amber: `#D97706`
- Neutral system:
  - Canvas: `#F8FAFC`
  - Surface: `#FFFFFF`
  - Border: `#E2E8F0`
  - Text strong: `#0F172A`
  - Text muted: `#475569`
- Recommended ratio:
  - 70% neutrals
  - 20% primary
  - 10% accent

## Typography

- `page-title`: top-level page titles
- `section-title`: in-page section titles
- `card-heading`: card and modal content titles
- `page-subtitle`: supporting page copy

## Spacing + Shape

- 8pt spacing rhythm (8, 16, 24, 32, 40, 48).
- Radius: 12-16px for most surfaces and controls.
- Cards: low-noise shadows; borders favored over heavy elevation.

## Motion

- Standard timing: 200ms.
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Use movement for clarity (state change), not decoration.

## 3) Golden Path (Design Coverage)

1. Today empty state
2. Today filled + save success
3. Memories list
4. Person timeline
5. Upgrade screen
6. Pro-gate modal for AI actions

## 4) Implementation Rules

- Build from primitives (`PremiumButton`, `PremiumCard`, `PageHeader`) before creating one-off UI.
- Prefer semantic utility classes (`page-title`, `section-title`, `modal-title`) instead of ad-hoc text styles.
- Keep copy aligned to `docs/product-language-guide.md` (memories / keepsakes phrasing).

## 5) Review Checklist

- Is the page hierarchy obvious in 3 seconds?
- Is there one primary action per section?
- Are spacing and title styles consistent with existing pages?
- Is Pro-gated behavior explicit in UI and API?
- Does the screen still look clean on mobile?
