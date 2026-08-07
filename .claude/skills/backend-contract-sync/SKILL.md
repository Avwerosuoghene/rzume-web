---
name: backend-contract-sync
description: >-
  Given a backend API contract change — a changelog, PR description, or endpoint
  diff pasted by the user — cross-reference it against this app's actual frontend
  code (models, services, components) to determine what needs updating. Diagnoses
  silent-breakage risks (a field the frontend still sends that the backend now
  silently ignores — no compile error, no runtime error, just a lost capability)
  before any fix is written. Complements /feature-kickoff's Step 4 (which checks
  the backend FOR a frontend task); this skill runs the other direction — someone
  hands you a backend change and you work out its frontend blast radius.
argument-hint: "[pasted backend changelog / contract diff / PR description]"
---

# Backend Contract Sync — diagnose frontend impact of a backend API change

You're handed a description of what changed on the backend — not asked to go find it. Your job is
to work out, with file:line evidence, exactly what in `rzume_web` needs to change (or doesn't) —
before any fix is written. This is the mirror image of `/feature-kickoff`'s backend-sync step: that
one starts from a frontend task and checks the backend; this one starts from a backend change and
checks the frontend.

## Hard rules

- **Every claim needs a file:line citation.** "This probably needs updating" isn't a diagnosis —
  find the actual frontend code that sends/receives/declares the changed field, or state plainly
  that nothing does.
- **Silent breakage is the thing to hunt for, not just compile errors.** A backend field rename,
  removal, or type change often doesn't produce a TypeScript error on the frontend at all — HTTP
  payloads are just JSON, and (per this project's real incidents) frameworks like System.Text.Json
  silently drop unrecognized request fields rather than rejecting them. A field the frontend still
  sends that the backend now ignores costs nothing to build, fails no test, and just quietly stops
  doing what it used to. Actively search for this category, don't wait for `tsc`/`ng lint` to catch
  it — they won't.
- **Distinguish "must fix" from "could fix."** A removed/renamed field the frontend actively
  depends on today is a real, confirmed break — that's must-fix. A newly *added* optional field the
  frontend doesn't yet consume is an opportunity, not a requirement — don't silently expand scope
  to build UI/wiring for it without asking, and don't silently skip it either; surface it as a
  choice.
- **Pre-existing dead/half-wired code adjacent to the change is worth surfacing, not silently
  fixing or silently ignoring.** If investigating the change turns up frontend scaffolding that was
  never wired up (a type declared but never sent, a constant never referenced) — that's exactly the
  kind of thing this skill's cross-referencing is well-positioned to catch. Report it distinctly
  from the actual contract change; don't conflate "this predates your change" with "your change
  caused this."

## Workflow

**Step 1 — Parse the change list into discrete, endpoint-scoped items.** One row per
field/behavior change, not one row per endpoint — a single endpoint can have multiple independent
changes (a field added to the request, a different field removed from the response).

**Step 2 — For each item, find every frontend touchpoint.** Search, don't assume:
- The TypeScript interface(s) declaring the request/response shape (`core/models/interface/*.ts`)
- The `*.service.ts` method(s) that call the endpoint — does it construct/send the changed field?
- Any component consuming the changed field for display or building the request (forms, dialogs)
- The corresponding `.spec.ts` files — a test asserting the old shape is itself evidence of current
  frontend behavior, and needs updating alongside any real fix

**Step 3 — Classify each item's frontend impact:**
1. **No frontend impact** — nothing sends/reads this field today; note it and move on
2. **Type declaration gap** — the frontend doesn't declare a field that now exists on the wire
   (new response field, changed nullability); not breaking, a type-accuracy question
3. **Confirmed silent break** — the frontend currently sends/expects something the backend no
   longer provides or now ignores; this is the must-fix category
4. **Validation/UI logic to remove** — the frontend enforces a constraint (a required field, a
   closed enum) the backend no longer needs or supports

**Step 4 — Flag decisions, don't make them silently.** Per `.claude/rules/human-checkpoint.md`:
any "could fix" item (type gap, dead scaffolding, an optional new field with no consumer yet) is a
scope question for the user, not something to bundle into the fix unasked or skip unasked.

**Step 5 — Write the diagnosis.** A table or list, one row per change, each with: what changed,
every frontend file it touches (file:line), classification, and — for confirmed breaks —
what the fix looks like at a glance. Present before writing any code.

**Step 6 — Hand off.** Confirmed breaks go through the normal `/write-tests` → `/implement` cycle
like any other bug fix. Optional items only proceed if the user says so.

## What this skill does NOT cover

- **Discovering that a backend change happened** — that's on the user or `/feature-kickoff`'s own
  Step 4 for a specific frontend task; this skill starts from a change already in hand
- **Writing the actual fix** → `/write-tests`, `/implement`
- **A UI/design mismatch with no backend contract change involved** → `/ui-parity-fix`
