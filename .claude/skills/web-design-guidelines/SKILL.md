---
name: web-design-guidelines
description: >-
  Review or implement UI in rzume_web for accessibility, responsive breakpoints, and
  interaction quality. Use when auditing a component for accessibility, implementing
  responsive behavior, checking keyboard operability, or verifying touch target sizes.
  Use for design/accessibility requirements — for which Material component to use see
  /material-ui, for component structure see /angular-patterns.
argument-hint: "[component name or describe the design/a11y question]"
---

# Web Design Guidelines — rzume_web

## Breakpoints

There's no dedicated breakpoint token/mixin file — `src/styles.scss` uses raw `@media (min-width:
...)` queries directly, mobile-first. The values actually in use:

| Breakpoint | Usage |
|---|---|
| `600px` | Most common — tablet-and-up threshold (README describes this as "599px tablet" — same threshold, expressed as a max vs. min boundary) |
| `768px` | Used in some sections — a secondary breakpoint, not universal |
| `950px` | Desktop threshold |

When adding responsive styles, match the existing `min-width` mobile-first pattern and reuse
`600px`/`950px` as the primary two breakpoints unless the component you're editing already
establishes a `768px` tier. Don't invent a fourth breakpoint value without a reason.

## Accessibility

Angular Material components (`MatFormField`, `MatInput`, `MatCheckbox`, etc. — see `/material-ui`)
carry a lot of accessibility behavior for free (labelling association, ARIA roles, keyboard
handling). When building on top of them or writing custom interactive elements:

- Every form field needs a real `<mat-label>` or equivalent — not placeholder-only text.
- Custom clickable elements use `<button>` (styled how you like), not a `<div>`/`<span>` with a
  click handler — this repo doesn't have an established custom-interactive-`div` pattern to match,
  so don't introduce one.
- Validation errors render inline via `<mat-error>`, adjacent to the field.
- Dialogs (`MatDialogModule` — `confirm-delete-modal`, `info-dialog`, `policy-dialog`,
  `feedback-dialog`) should trap focus and return it to the trigger on close; check
  `CdkTrapFocus`/Material's built-in dialog focus handling before hand-rolling this.

## Touch targets

No explicit touch-target sizing convention was found enforced in code — apply the standard 44×44px
minimum for tappable controls on mobile as a general web-accessibility baseline, not because it's
already codified here. If you find an existing established size in a component you're editing,
match that instead.

## Color and contrast

The app uses Angular Material's prebuilt `azure-blue` theme (see `/material-ui`) — there's no
custom token layer to verify contrast against programmatically. Use Material's own components and
palette rather than hardcoded hex colors for anything new; if a custom color is unavoidable, check
it against WCAG AA (4.5:1 body text, 3:1 large text/UI components) manually.

## Reduced motion

`src/styles.scss` already includes a `@media (prefers-reduced-motion: reduce)` block — respect this
for any new animation/transition work rather than adding motion that ignores it.

## Findings format (when auditing existing UI)

```
### Critical
- src/app/components/<name>/<name>.component.html:12
  <description of the accessibility or breakpoint issue>

### Warning
- ...

### Suggestion
- ...
```

## What this skill does NOT cover

- **Which Material component/module to reach for** → `/material-ui`
- **Component class structure, OnPush, folder layout** → `/angular-patterns`
