---
name: typescript-standards
description: >-
  TypeScript naming, strict-mode conventions, and model organization for rzume_web. Use
  when deciding how to name a type/function/file, where a new interface or constant
  should live, whether `any` is acceptable, or what return type a method needs. Use for
  language-level TypeScript decisions — for component shape use /angular-patterns, for
  lint enforcement/toolchain use /linting-standards.
argument-hint: "[naming|typing|models — describe the decision]"
---

# TypeScript Standards — rzume_web

## Strict mode is fully on — write code that satisfies it, don't work around it

`tsconfig.json` has `strict: true` plus: `noImplicitOverride`, `noPropertyAccessFromIndexSignature`,
`noImplicitReturns`, `noFallthroughCasesInSwitch`. Angular-specific: `strictInjectionParameters`,
`strictInputAccessModifiers`, `strictTemplates`. This means, concretely:

- Every code path in a function with a declared return type must return (`noImplicitReturns`) —
  no implicit `undefined` fall-through.
- `switch` statements need explicit `break`/`return` in every case (`noFallthroughCasesInSwitch`).
- Overriding a base class method requires the `override` keyword.
- Indexed access on a typed object (`obj['key']`) isn't allowed where a declared property access
  would work — this pushes toward proper interfaces over loose index signatures.

## `any` is an ESLint error, not a style preference

`@typescript-eslint/no-explicit-any` is set to `"error"` in `.eslintrc.json` — this isn't
optional. Use `unknown` and narrow it, or a specific type/cast, instead:

```ts
// ❌ Silent any
const result: any = await fetchData();

// ✅ Unknown + narrowing
const result: unknown = await fetchData();
if (isJobApplication(result)) { ... }
```

**Known pre-existing exception**: `core/modules/*.ts` (the Material/Core/Router module barrels,
see `/material-ui`) type their exported arrays as `readonly any[]`. That predates this rule and
isn't something to silently "fix" while doing unrelated work — but don't extend the `any` pattern
into new files.

`@typescript-eslint/no-unused-vars` is also `"error"` — no dead imports or unused locals.

## No `Readonly<T>` convention here

Unlike some other codebases, this repo does **not** wrap service params or component props in
`Readonly<T>` — none of the existing services or components do this. Don't introduce it as a new
per-file convention; write plain typed parameters matching the existing style.

## Naming

| What | Convention | Example |
|---|---|---|
| Classes (components, services) | PascalCase + role suffix | `JobListToolbarComponent`, `JobApplicationStateService` |
| Interfaces/types | PascalCase | `JobApplicationItem`, `PaginatedItem<T>` |
| Methods/variables | camelCase | `handleFilterChange`, `updateApplications` |
| Files | kebab-case, suffixed by role | `job-list-toolbar.component.ts`, `job-application-state.service.ts` |
| Constants | SCREAMING_SNAKE_CASE for module-level fixed values | `JOB_FILTER_OPTIONS`, `PAGINATION_DEFAULTS`, `MOBILE_BREAKPOINT` |

## Model organization

Types, interfaces, constants, and enums live under `core/models/`, split by kind:

```
core/models/
  interface/     ← JobApplicationItem, JobApplicationFilter, etc.
  types/
  constants/     ← JOB_FILTER_OPTIONS, PAGINATION_DEFAULTS, MOBILE_BREAKPOINT
  enums/         ← ApplicationStatus, BorderRadius, etc.
```

Imported through the `core/models` barrel (`import { PaginatedItem } from '../models'`) rather than
deep-pathing into the specific subfolder file, when the barrel already re-exports it.

## Explicit return types

Existing code is inconsistent here — some methods declare `: void` explicitly, others don't
(`onSearch(searchTerm: string) { ... }` has no declared return type). Prefer adding an explicit
return type on new public methods, especially anything returning a value, but don't treat its
absence in existing code as something to fix opportunistically.

## What this skill does NOT cover

- **Component/service shape and structure** → `/angular-patterns`
- **How lint is actually run, and the toolchain's current state** → `/linting-standards`
- **RxJS types and observable shapes** → `/rxjs-state-patterns`
