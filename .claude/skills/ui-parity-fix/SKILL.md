---
name: ui-parity-fix
description: >-
  Diagnose why an EXISTING component in rzume_web doesn't visually or behaviorally
  match its Figma design and/or a named working reference elsewhere in the app —
  "this doesn't look like Figma", "this doesn't look like the other X dropdown/modal".
  Produces a file:line-cited diagnosis before any fix is written, then hands off to
  /write-tests → /implement. Not for brand-new UI with no prior implementation (that's
  /figma-feature-plan) — this is specifically for implementations that have drifted.
argument-hint: "[component path] [reference component/pattern to compare against] [optional Figma link/node]"
---

# UI Parity Fix — diagnose drift between an existing component and its design/reference

You investigate **why** something already built looks or behaves wrong, before anyone writes a
fix. This is a diagnosis-first workflow — comes before `/write-tests` for the reported bug, and
exists because these bugs are easy to mis-diagnose from a screenshot alone (guessing at CSS tweaks)
when the real cause is usually a structural difference a few lines away.

## When to use

- An existing component's UI doesn't match its Figma design, and/or doesn't match a named
  reference component elsewhere in the app that solves the same problem correctly.
- **Not** for brand-new UI with no prior implementation — that's `/figma-feature-plan` → `/implement`.
- **Not** for a component that's simply unbuilt/unstyled by design (that's just `/implement`) — this
  is specifically for "it was built, and it's wrong."

## Hard rules

- **Every claim in the diagnosis needs a file:line citation.** "This looks off" isn't a diagnosis —
  read the actual template/SCSS/TS and point at the specific line.
- **Never fix shared/reused infrastructure as a drive-by.** If the root cause lives in a directive,
  a shared component's core behavior, or global styles rather than the reported component itself,
  its blast radius is bigger than the one bug report — flag it as a
  `.claude/rules/human-checkpoint.md` decision (fix now with full regression testing across every
  consumer, or scope this pass to the reported component and defer the shared fix) rather than
  silently changing shared code while looking at one symptom.
- **No reference named and no Figma link** → ask which one before diagnosing. Don't guess which
  pattern is "correct" between two components that both do something similar.

## Workflow

**Step 1 — Read the reported component's actual code.** Template, SCSS, and the TS file that
builds any config objects it passes to shared components. Don't diagnose from the screenshot alone.

**Step 2 — If a reference was named, read it too, and diff structurally.** Compare: wrapper
classes, which shared directives/components each one uses, what config objects get passed to
shared components, CSS class names used vs. actually defined. A missing wrapper `<div>` class is a
far more common real cause than "the CSS needs different values" — real example: `add-role-dialog`
was missing the `.form-input-container` wrapper class that `job-add-dialog` had, which silently
disabled an entire CSS block (`.form-select` in `src/styles.scss`) meant to override the browser's
native `<select>` appearance. One missing class explained most of the reported visual bug.

**Step 3 — Verify every CSS class the broken template uses is actually defined somewhere.** Grep
for each class name across component SCSS files and `src/styles.scss`/`src/app/styles/`. Don't
assume a class "should" be styled — confirm it is. A class referenced only in the one template that
uses it, nowhere else in the codebase, means that markup is unstyled raw HTML. Real example: an
entire custom multiselect dropdown (`add-role-dialog`'s document picker) had zero CSS anywhere —
the class names existed only in the template.

**Step 4 — If a Figma link/node was given, cross-check against it too — but keep the two
comparisons separate.** A Figma-fidelity gap and a reference-component-parity gap are different
bugs with different fixes; don't conflate "doesn't match Figma" with "doesn't match the other
dropdown" as if they're the same finding.

**Step 5 — Trace shared infrastructure for logic bugs, not just missing styling.** If a shared
directive or helper computes state (e.g. "does this field have a value") incorrectly, that's a real
bug independent of any styling gap — find it, but per the hard rule above, don't fix it inline if
it's used elsewhere; flag it.

**Step 6 — Write the diagnosis.** One finding per bullet, each with a file:line citation and what
it explains. Present it to the user before writing any fix — this is naturally a good moment for a
scope question if a finding turns out to be shared infrastructure (see Step 5 / hard rules).

**Step 7 — Hand off.** `/write-tests` for whatever's actually testable (DOM structure, class
presence, config object shape — not pixel-perfect CSS positioning, Jasmine/Karma can't assert
that), then `/implement`.

## What this skill does NOT cover

- **Writing the actual fix** → `/write-tests`, `/implement`
- **Brand-new UI with no existing prior implementation** → `/figma-feature-plan`
- **The structural/architecture decision behind a larger change** → `/architect`
