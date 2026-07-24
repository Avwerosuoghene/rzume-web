---
name: quality-gate
description: >
  Validate and approve or revise a solution before presenting it to the user. A
  critic/QA checkpoint invoked after /implement, /architect, /write-tests, or
  /code-review work in rzume_web.
argument-hint: "[origin: implement|architect|write-tests|code-review]"
---

# Quality Gate — rzume_web

Validate a solution produced by another skill before presenting it to the user. Route it through
the checklist matching its origin below; if blockers are found, revise before presenting.

## Origin: `implement`

**Completeness**
- [ ] The originally-failing test now passes; no other test broke
- [ ] All aspects of the request are addressed — no obviously skipped edge case

**Conventions**
- [ ] `AngularMaterialModules` barrel used, not a direct `Mat*Module` import (`/material-ui`)
- [ ] No raw HTML element used where a Material component covers the case
- [ ] State ownership follows the `StateService`/`BehaviorSubject` pattern if shared
      (`/rxjs-state-patterns`)
- [ ] Subscription cleanup matches the pattern already used in the file being edited
- [ ] No `any` without a real justification (`/typescript-standards`)
- [ ] `OnPush` decision matches the existing selective-usage pattern, not applied reflexively
      (`/angular-patterns`)

**Tooling**
- [ ] `npm run lint` passes (or any failures are pre-existing, not caused by this change —
      cross-check against `/linting-standards` before assuming a failure is new)
- [ ] `npm run type-check` passes

## Origin: `architect`

- [ ] Output mode matches what was asked (`options`/`plan`/`flow`/`review`)
- [ ] `options` mode: a Mermaid diagram is present, and either a clear recommendation exists or
      Open Questions are listed (not silently resolved)
- [ ] State ownership and UI-surface decisions are consistent with `/rxjs-state-patterns` and
      `/angular-patterns`
- [ ] Output was written to the vault (`~/Documents/rzume-web-vault/features/<slug>/`), not left
      only in chat

## Origin: `write-tests`

- [ ] The test was actually run and confirmed to fail for the right reason before handoff
- [ ] Correct test type chosen (unit vs. Cypress e2e — see `/write-tests`)
- [ ] File location matches convention (sibling `.spec.ts`, or `cypress/e2e/<area>/*.cy.ts`)
- [ ] Test name follows `'should <behavior> when <condition>'`
- [ ] Injected services mocked via `jasmine.createSpyObj` + DI, not left un-mocked or hand-rolled

## Origin: `code-review`

- [ ] All changed files are covered in the report
- [ ] Every Critical finding cites a `file:line`
- [ ] Verdict matches findings — no "Approved" alongside an unresolved Critical
- [ ] Test coverage assessed for every changed file, not just source files

## Severity

| Severity | Meaning |
|---|---|
| **BLOCKER** | Convention violation that would need to be undone later (wrong state pattern, raw HTML where Material exists, `any` without justification, a test that doesn't actually fail before handoff) |
| **WARNING** | Should fix, not a hard failure |
| **NOTE** | Style/optional polish |

## If a BLOCKER survives a second revision attempt

Per `.claude/rules/human-checkpoint.md` — stop and present the best available solution with the
blocker listed for the user to decide, rather than looping indefinitely or silently shipping it.

## Output format

```
QUALITY GATE: APPROVED
[Origin: <skill>]

<solution>

Quality Notes:
- <WARNINGs/NOTEs — omit if none>
```
