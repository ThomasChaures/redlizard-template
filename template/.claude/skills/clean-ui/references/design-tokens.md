# Design Tokens — Source of Truth

This file defines the visual system for every view in this project. The stack
is **Tailwind CSS v4**: tokens are declared in the `@theme` block of
`src/app/globals.css`, and Tailwind generates utilities from them
(`bg-paper`, `text-ink`, `border-line`, `text-muted`, `bg-danger-soft`, ...).
When building or changing UI, use these token utilities — never hardcode hex
values or arbitrary colors in class names.

**Theme: light, monochrome.** Ink on paper. The entire interface is a grayscale
ramp; hierarchy comes from contrast, weight, size, and spacing — never from hue.

## Color

| Token (Tailwind utility) | Value     | Use for                                |
| ------------------------ | --------- | -------------------------------------- |
| `paper`                  | `#f7f7f7` | Page background (`bg-paper`)           |
| `surface`                | `#ffffff` | Cards, inputs (`bg-surface`)           |
| `surface-2`              | `#f0f0f1` | Subtle fills, hover (`bg-surface-2`)   |
| `line`                   | `#e5e5e7` | Default borders (`border-line`)        |
| `line-strong`            | `#d6d6d9` | Input borders (`border-line-strong`)   |
| `ink`                    | `#18181b` | Primary text & buttons (`text-ink`, `bg-ink`) |
| `ink-2`                  | `#2e2e33` | Primary button hover (`hover:bg-ink-2`)|
| `muted`                  | `#5f5f66` | Secondary text (`text-muted`)          |
| `faint`                  | `#8e8e95` | Hints, placeholders (`text-faint`)     |
| `danger` (+`-soft`,`-line`)| `#b42323`| Errors only (semantic exception)       |
| `success` (+`-soft`)     | `#2f6b46` | Success feedback only (semantic exc.)  |

Rules:
- **Monochrome means monochrome.** No hue anywhere in the interface chrome.
  The "accent" is simply the darkest ink — primary buttons are dark, not colored.
- The only color permitted is **semantic state**: `--danger` for errors and
  `--success` for confirmations. They are desaturated on purpose and must never
  be used decoratively.
- Hierarchy is built with the grayscale ramp: ink → muted → muted-2 → borders.
- **Links are underlined**, not colored — in a monochrome UI, color can't be the
  affordance, so the underline is.
- Never introduce brand colors of third-party services (e.g. Supabase green).
  The stack is an implementation detail, not the product's identity.

## Typography

- Font stack: system UI (`--font`). No webfonts unless the team decides one.
- Headings: `1.35–1.45rem`, weight `650`, letter-spacing `-0.02em`.
- Body: `0.925–0.95rem`, weight `400`.
- Labels: `0.825rem`, weight `600`.
- Hints/meta: `0.78rem`, color `--muted-2`.
- Two weights in practice: regular (400) and semibold (600/650). No more.
- In monochrome, typography does the heavy lifting: weight and size changes
  replace what color would otherwise signal.

## Spacing, radius, elevation

- Radius: `--radius` (12px) for cards, `--radius-sm` (8px) for inputs/buttons.
- Shadow: `--shadow` only on raised cards. Nothing else casts shadows.
- Vertical rhythm inside forms: `1.1rem` gap between fields.
- Cards: max-width `25rem` (auth) / `28rem` (content), padding `2rem`.

## Components (already styled — reuse, don't reinvent)

Shared class strings live in `src/app/(auth)/ui.ts`:

- `inputClass` — text inputs (border, focus ring `ring-ink/10`)
- `labelClass` — field labels
- `primaryButtonClass` — the one dark/ink primary action per view
- `errorClass` — inline form errors (`role="alert"`)
- `linkClass` — underlined links (monochrome affordance)

Cards: `rounded-xl border border-line bg-surface p-8 shadow-card`.
Key/value rows: `rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm`.
Compose from these before inventing new patterns; if a new shared component is
genuinely needed, add its class string to `ui.ts` (or a colocated `ui.ts`) and
document it here.

## Interaction & accessibility (non-negotiable)

- Every async action shows a pending state (`aria-busy`, disabled, label change).
- Errors render inline next to the form, never in the URL.
- Inputs always have an associated `<label>`; focus ring is a gray
  `--accent-soft` halo — visible in grayscale by contrast, not hue.
- Respect `prefers-reduced-motion`.
- Contrast: the grayscale ramp keeps AA on `--surface`; don't lighten `--muted-2`
  further for body-size text.

## Adding a new view

1. Read `SKILL.md` (the principles) and this file (the tokens).
2. Compose from the existing components before writing new CSS.
3. Build with the token utilities (`bg-paper`, `text-ink`, ...). Do not use
   arbitrary values (`bg-[#hex]`) — if a value is missing, add it to `@theme`
   and document it here.
4. If you feel the urge to add a color, the answer is contrast or weight instead.
