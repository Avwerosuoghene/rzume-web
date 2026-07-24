---
name: pre-commit-checklist
description: >-
  Check commit readiness in rzume_web — the final gate in the feature-implementation
  chain, after /code-review. Use before committing or pushing to verify lint, tests,
  coverage, security audit, and bundle size all pass. Documents what the actual git
  hook does vs. what npm run quality-gate:full does — they are not the same thing.
argument-hint: "[nothing needed, or 'full' to run the complete quality-gate script]"
---

# Pre-Commit Checklist — rzume_web

## ⚠️ The git hook does less than you'd expect

`.husky/pre-commit` currently only runs `npm run update-docs` (the documentation updater). Lint and
test lines exist in that file but are **commented out**:

```sh
# npm run lint
# npm run test:ci
```

**A successful `git commit` does not mean lint or tests passed.** Don't rely on the hook — run the
checks below yourself before committing, especially since `/code-review` and `/quality-gate` assume
they've actually been run, not just "would have been caught by the hook."

## Commands

```bash
npm run lint            # ng lint — see /linting-standards, now fixed and functional
npm run type-check      # tsc --noEmit
npm run test:ci         # ng test --watch=false --browsers=ChromeHeadless --code-coverage
npm run build:prod      # catches build-time errors lint/type-check might miss

# Single spec file
ng test --include='**/job-application.service.spec.ts'

# Cypress e2e
npx cypress run --spec 'cypress/e2e/<area>/<flow>.cy.ts'
```

## What `npm run quality-gate:full` actually runs

This script (`scripts/quality-gate-check.sh`) is the real, comprehensive gate — more than just lint
+ test:

1. **Type checking** (`tsc --noEmit`)
2. **Linting** (`ng lint`)
3. **Unit tests + coverage** (`test:coverage`) — checks against an **80% line coverage threshold**;
   below that is flagged, not silently passed
4. **Security audit** (`npm audit --audit-level=moderate`) — stricter than the plain
   `security:audit` script, which uses `--audit-level=high`
5. **Production build + bundle size** — builds, then checks the main bundle is **under 500KB**
   (matches the budget in `angular.json` and the README's stated target)
6. **TODO/FIXME scan** — reports count, doesn't block
7. **`console.log` scan** (excluding `.spec.ts` files) — reports count, doesn't block

`npm run quality-gate:automated` is a lighter subset: just `type-check` + `security:audit` (the
`--audit-level=high` variant, not `moderate`).

## Checklist

### Always
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `npm run test:ci` passes
- [ ] New/changed behavior has a test (`/write-tests`) — sibling `.spec.ts`, or a `.cy.ts` for a
      full flow
- [ ] No stray `console.log` left in non-spec source

### Before a larger merge / release-adjacent change
- [ ] `npm run quality-gate:full` — the complete script above, including coverage and bundle-size
      checks
- [ ] Coverage hasn't dropped below 80% on touched files
- [ ] `npm run build:prod` succeeds and the main bundle is still under 500KB

### When adding a dependency
- [ ] Added to the correct place in `package.json`
- [ ] If it needs an `overrides` entry, scope it to the specific package/path that needs it — a
      blanket override already broke `eslint` and `cypress` once (see `/linting-standards`); don't
      repeat that
- [ ] Run `npm run security:audit` after — commit the updated `package-lock.json`

### When touching Angular Material usage
- [ ] New Material module added to `core/modules/material-modules.ts`, not imported ad hoc
      (`/material-ui`)

## What this skill does NOT cover

- **What a lint/type-check failure means and how to fix the toolchain itself** → `/linting-standards`
- **The review of the actual code changes** → `/code-review`
