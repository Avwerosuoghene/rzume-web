---
name: code-review
description: >
  Review changed files in rzume_web against project conventions — component shape,
  state management, Material usage, TypeScript strictness, and test coverage. Use to
  review a diff, branch, or set of changed files before merging.
argument-hint: "[branch name, or file paths to review]"
---

# Code Review — rzume_web

## Step 1: Gather the diff

```bash
git diff master...HEAD --name-only        # changed files
git diff master...HEAD                    # full diff
```

Note: this repo's default/PR-target branch is `master` (not `main`) — verify with `git branch -a`
before assuming otherwise if working from a fork or a renamed remote.

If given specific files instead, read them directly.

## Step 2: Read changed files + their tests

For every changed `.ts`/`.component.ts` file, also read its sibling `.spec.ts` (see
`/write-tests` for the sibling-file convention). Note if a test is missing or wasn't updated
alongside a behavior change.

## Step 3: Run checks

```bash
npm run lint         # ng lint — see /linting-standards if this fails unexpectedly
npm run type-check   # tsc --noEmit
```

## Step 4: Evaluate against checklist

### Angular / component shape (`/angular-patterns`)
- [ ] `standalone: true` declared explicitly
- [ ] `OnPush` used consistently with the existing selective pattern (route/page + heavy list
      components), not applied reflexively or missing where the file clearly needs it
- [ ] New component in the right folder shape, barrel `index.ts` added if consumed elsewhere

### State / RxJS (`/rxjs-state-patterns`)
- [ ] Shared state lives in a `<Domain>StateService` with a private `BehaviorSubject`, not a
      module-level global or duplicated component-local state
- [ ] Subscription cleanup matches the pattern the file already used before this change (no mixing
      `takeUntil` and `Subscription`-bag in the same file)
- [ ] No subscription left uncleaned in a component with `ngOnDestroy` available

### Material UI (`/material-ui`)
- [ ] `AngularMaterialModules` barrel used — no direct `Mat*Module` import in a component
- [ ] No raw HTML element where a Material component covers the case
- [ ] New Material module (if any) added to `core/modules/material-modules.ts`, not imported ad hoc

### TypeScript (`/typescript-standards`)
- [ ] No `@typescript-eslint/no-explicit-any` violation without a real justification (the
      `core/modules/*.ts` barrels and `@ViewChild` test-mocking are the only known pre-existing
      exceptions — don't treat new occurrences as automatically acceptable because those exist)
- [ ] New public types/constants placed under the right `core/models/` subfolder
- [ ] Explicit return type on new public methods

### Tests (`/write-tests`)
- [ ] New/changed behavior has a corresponding `.spec.ts` (or `.cy.ts` for a full flow)
- [ ] Test was actually run, not just written
- [ ] Injected services mocked via `jasmine.createSpyObj` + DI substitution, HTTP via
      `HttpClientTestingModule`

### General
- [ ] No dependency `overrides` change without checking `npm run security:audit` after (see the
      ajv/uuid incident in `/linting-standards` — a blanket override bump can silently break an
      unrelated package's internals)

## Step 5: Output

Self-check against `/quality-gate`'s `code-review` checklist before presenting.

```
## Code Review: [subject]

### Critical (must fix)
- [file:line] [issue] — [why it matters]

### Warning (should fix)
- [file:line] [issue] — [recommendation]

### Suggestion (optional)
- [file:line] [improvement idea]

### Test Coverage
- [file] — [covered / missing / needs update]

### Commands Run
- `npm run lint` — [passed / failed with: ...]
- `npm run type-check` — [passed / failed with: ...]

### Verdict: [Approved / Approved with changes / Request changes]
```
