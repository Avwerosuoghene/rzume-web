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
| ESLint/toolchain execution, the current `ng lint` broken state | `/linting-standards` |
| Accessibility, breakpoints, touch targets, contrast | `/web-design-guidelines` |

## Precedence

1. Canonical skills listed above
2. This skill never overrides the above — it only routes

## Status

This is Tier 1 of a larger planned pipeline (architecture planning, Figma-driven UI implementation,
TDD workflow, code review, pre-commit gating). Those skills don't exist yet — this table will grow
as they're built. Don't reference a skill here that isn't in the table above; that's a deliberate
choice to avoid a router pointing at something that doesn't exist yet.
