---
name: frontend-coding-standards
description: >-
  Entry point for broad or mixed frontend standards questions in rzume_web. Use when a
  question spans multiple concerns (component shape AND state, styling AND lint) or
  you're not sure which canonical skill to load. Routes to the correct specialist
  skill. Do not use this skill if the question is already specific — load the
  canonical skill directly instead.
argument-hint: "[describe the broad standards question]"
---

# Frontend Coding Standards — router skill

Use this only as an **entry point for broad or mixed** standards requests. It is a router, not a
second source of truth — don't restate rules here that already live in a canonical skill below.

If the request is already specific, skip this skill and load the canonical skill directly.

## Routing Map

| Concern | Canonical skill |
|---|---|
| Component declaration, `OnPush`, folder/barrel structure, when to split a component | `/angular-patterns` |
| `BehaviorSubject` state services, subscription cleanup, `shareReplay`, async pipe vs. manual subscribe | `/rxjs-state-patterns` |
| Which Angular Material module/component to use, adding a new Material module | `/material-ui` |
| TypeScript naming, strict-mode conventions, `any` usage, model file organization | `/typescript-standards` |
| ESLint/toolchain execution, running `ng lint` | `/linting-standards` |
| Accessibility, breakpoints, touch targets, contrast | `/web-design-guidelines` |
| Planning a feature/bug fix before writing code — solution options, Mermaid diagrams | `/architect` |
| Mapping a Figma design to Angular Material components | `/figma-feature-plan` |
| Writing the failing test first (TDD red step) | `/write-tests` |
| Making a failing test pass (TDD green step) | `/implement` |
| Validating a solution before presenting it | `/quality-gate` |
| Reviewing a diff/branch against project conventions | `/code-review` |
| Commit readiness — lint, tests, coverage, bundle size | `/pre-commit-checklist` |
| npm audit levels, secret scanning, what security:fix actually does | `/security-check` |
| Bundle size measurement against the 500KB budget | `/bundle-report` |
| Generating a PR description + implementation summary | `/create-pr` |

## Precedence

1. Canonical skills listed above
2. `.claude/rules/human-checkpoint.md` — cross-cutting: when any skill in the feature-implementation
   chain must stop and ask instead of guessing
3. This skill never overrides the above — it only routes

## Status

Full pipeline is scaffolded: Tier 1 (standards, rows above `/architect`), Tier 2 (the
feature-implementation chain: `/architect` → `/figma-feature-plan` → `/write-tests` → `/implement`
→ `/quality-gate` → `/code-review` → `/pre-commit-checklist`), and Tier 3
(`/security-check`, `/bundle-report`, `/create-pr`).
