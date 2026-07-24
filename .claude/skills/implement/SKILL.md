---
name: implement
description: >-
  Make a failing test pass in rzume_web (TDD green step) — implement a feature, fix a
  bug, or add functionality. Use after /write-tests has produced a failing test, never
  before. Reads existing similar files first, then writes the minimal change that
  makes the test pass while following the app's established conventions.
argument-hint: "[failing test path, or feature/bug description]"
---

# Implement — TDD green step, rzume_web

You make a failing test (from `/write-tests`) pass. Before writing any code, **discover before
writing**: read the failing test to understand exactly what's expected, then read 1-2 existing
similar files in the same area to match current patterns — don't introduce a new pattern for
something the codebase already does a different way.

If you were invoked without a failing test already in hand, stop and run `/write-tests` first —
this skill assumes red-before-green, it doesn't skip it.

## UI Detection Gate

**Before writing any `.component.ts`/`.html` code**, check whether the task involves a UI surface:
new/changed template, a form, dialog, page, or anything visual.

- **No UI surface** → proceed normally with the workflow table below.
- **UI surface, and a Figma design exists for it** → check whether `/figma-feature-plan` has
  already produced a `feature-spec.md` for this feature in the vault. If not, and a Figma
  link/node was given, run it first — don't eyeball a screenshot and guess the component mapping.
- **UI surface, no Figma design** → proceed directly using `/material-ui` and `/angular-patterns`.

## Workflow

| Task | Steps |
|---|---|
| Fix a bug | Read the failing test → read the implementation it targets → make the minimal change that satisfies the test → verify no other test broke |
| Add a service method | Read an existing service in the same file/area → follow the `BehaviorSubject` state pattern if it's shared state (`/rxjs-state-patterns`) → explicit return type (`/typescript-standards`) |
| Add a component | → **UI Detection Gate above** → standalone, `AngularMaterialModules` import, `OnPush` only if it's a route/page or heavy list component (`/angular-patterns`) |
| Add a page/route | Check `core/models/constants/app.routes.ts` and the relevant `*.routes.ts` file for the existing routing pattern before adding a new route |

## Architectural constraints (non-negotiable)

1. **Match the existing state pattern** — new shared state is a `<Domain>StateService` with a
   private `BehaviorSubject`, never a module-level mutable global (`/rxjs-state-patterns`).
2. **Match the existing subscription-cleanup pattern for the file you're in** — `takeUntil` +
   `Subject<void>` for new files (the dominant pattern); if the file you're editing already uses
   the `Subscription`-bag pattern, keep using that one rather than mixing both in one file.
3. **Angular Material via the barrel** — `AngularMaterialModules` from `core/modules`, never a
   direct `Mat*Module` import in a component, never a raw HTML element where a Material component
   covers the case (`/material-ui`).
4. **No `any`** — `@typescript-eslint/no-explicit-any` is a real, enforced error (`/linting-standards`
   confirms `ng lint` actually works now). Use `unknown` + narrowing instead.
5. **Strict mode compliance** — every code path returns, no `switch` fallthrough, `override` on
   overridden methods (`/typescript-standards`).

## Anti-patterns

```ts
// ❌ Module-level mutable state
let currentFilter = {};
// ✅ State in a StateService
export class JobApplicationStateService { private state$ = new BehaviorSubject(...); }

// ❌ Raw Material import
import { MatButtonModule } from '@angular/material/button';
// ✅ Grouped barrel
import { AngularMaterialModules } from '../../core/modules';

// ❌ Silent any
const result: any = await fetchData();
// ✅ Unknown + narrowing
const result: unknown = await fetchData();

// ❌ Mixed cleanup patterns in one file
private destroy$ = new Subject<void>();
private subscriptions = new Subscription();
// ✅ Pick the one the file already uses (takeUntil for new files)
```

## If the test can't pass without breaking a convention

Per `.claude/rules/human-checkpoint.md` — stop and ask, don't silently violate a Tier 1 convention
and don't silently rewrite the test to dodge the conflict. This is a real fork in the road, not a
default to resolve alone.

## Pre-submit checklist

- [ ] The originally-failing test now passes
- [ ] `npx ng test` — no other test broke
- [ ] `npm run lint` passes (see `/linting-standards` if it doesn't — check whether it's your
      change or a pre-existing violation before assuming you broke it)
- [ ] `npm run type-check` passes
- [ ] New shared state follows the `StateService` pattern; new UI follows `/material-ui`

Before presenting the final solution, self-check against `/quality-gate`'s `implement` checklist.

## What this skill does NOT cover

- **Writing the test itself** → `/write-tests`
- **Figma-to-component mapping** → `/figma-feature-plan`
- **The architectural decision behind a non-trivial change** → `/architect`
