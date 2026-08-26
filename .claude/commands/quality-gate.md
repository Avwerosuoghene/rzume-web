# Quality Gate — Solution Validation

Act as a **Senior Angular Architect** performing a critical quality gate review. Challenge the implementation, identify edge cases, and produce a clear APPROVED / APPROVED WITH CONDITIONS / REJECTED verdict.

## Step 1 — Run Automated Checks

```bash
npm run quality-gate:automated
```

This runs TypeScript compilation + security audit. Also run individually as needed:

```bash
npm run lint            # ESLint
npx tsc --noEmit        # Type checking
npm run test:ci         # Unit tests with coverage
npm run security:audit  # npm audit
npm run analyze-bundle  # Bundle size
```

## Step 2 — Architecture Review

Read each changed file and verify:

- [ ] Standalone components only (no NgModules)
- [ ] `ChangeDetectionStrategy.OnPush` on every component
- [ ] `takeUntil(this.destroy$)` on every subscription
- [ ] Modern syntax: `inject()`, `@if`, `@for`, `@switch`
- [ ] State management via BehaviorSubject services
- [ ] No `any` types, no `console.log` in production code
- [ ] Semantic HTML (no `<div (click)>`, no `<div>` lists)
- [ ] `<ng-container>` used for structural wrappers
- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs linked to `<label>`
- [ ] Lazy loading on routes

## Step 3 — Security Review

- [ ] No hardcoded secrets or API keys
- [ ] No sensitive data in `localStorage` (use `sessionStorage`)
- [ ] No unsafe `[innerHTML]` without `DomSanitizer`
- [ ] No `bypassSecurityTrust*` without explicit justification
- [ ] `HttpClient` used for all requests (auto XSRF protection)
- [ ] Input validation on all user-controlled data
- [ ] No verbose error details exposed to UI

## Step 4 — Performance Review

- [ ] No function calls in templates (use computed properties / pipes)
- [ ] `track` in every `@for`
- [ ] `shareReplay({ bufferSize: 1, refCount: true })` on shared observables
- [ ] Initial bundle target: < 500KB
- [ ] Lazy loading implemented

## Step 5 — Testing Review

- [ ] Unit tests ≥ 80% coverage
- [ ] Error scenarios tested
- [ ] Edge cases: null/undefined, empty arrays, large datasets
- [ ] Accessibility assertions (semantic elements, ARIA, keyboard)
- [ ] E2E tests for critical user paths

## Step 6 — Edge Case Analysis

Challenge the solution with:
- **Null/undefined**: What happens if API returns null?
- **Network failure**: Is the error handled gracefully?
- **Race conditions**: Are concurrent requests handled with `switchMap`?
- **Mobile**: Does it work on small screens / touch devices?
- **Large datasets**: 1000+ items — does performance hold?
- **Accessibility**: Usable with keyboard only? Screen reader friendly?

## Step 7 — Verdict

### ✅ APPROVED
All checks pass, architecture is sound, edge cases handled, tests comprehensive.

```
✅ QUALITY GATE: APPROVED

Strengths:
- [List]

Minor suggestions (non-blocking):
- [List]

Next steps: Proceed with implementation / PR.
```

### ⚠️ APPROVED WITH CONDITIONS
Acceptable but needs minor fixes before merge.

```
⚠️ QUALITY GATE: APPROVED WITH CONDITIONS

Required changes before merge:
1. [Specific change]
2. [Specific change]

Rationale: [Why these are required]
```

### ❌ REJECTED
Critical issues that must be reworked before proceeding.

```
❌ QUALITY GATE: REJECTED

Critical issues:
1. [Issue — severity — impact]
2. [Issue — severity — impact]

Edge cases not handled:
- [Edge case]

Required rework:
1. [Specific fix]
2. [Specific fix]

Next steps: Rework and resubmit for review.
```

## Quality Gate Mindset

Always ask:
1. What could go wrong? (think like a tester)
2. What did they miss? (look for gaps)
3. Will this scale? (100 users → 10,000 users)
4. Is this maintainable in 6 months?
5. Is this secure? (assume malicious input)
6. Is this accessible? (keyboard, screen reader, contrast)
7. Is this performant? (measure, don't guess)
