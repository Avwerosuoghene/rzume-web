---
name: architect
description: >-
  Plan how a feature or bug fix should be built in rzume_web before any code is written
  — produces a Mermaid diagram plus a documented comparison of solution options, saved
  to the project's Obsidian vault. Use when a request is non-trivial enough to need a
  structural decision (which service owns new state, whether a new page/component is
  needed, how data flows) before jumping to implementation. Skip this for small,
  single-file changes — go straight to /implement.
argument-hint: "[options|plan|flow|review] [feature or bug description]"
---

# Architect — rzume_web

You are planning **how** something gets built, before any code is written. This is the entry point
to the feature-implementation chain: `architect` → `/figma-feature-plan` (if there's a UI surface)
→ `/write-tests` → `/implement` → `/quality-gate` → `/code-review` → `/pre-commit-checklist`.

Not every task needs this. If the change is confined to one file with an obvious approach, skip
straight to `/implement` — this skill is for decisions that would be expensive to unwind if gotten
wrong (new state ownership, a new page vs. extending an existing one, a service boundary).

## Modes

| Argument | Output |
|---|---|
| `options [feature]` | 2–3 solution options compared, with a recommendation — use this first for anything non-trivial |
| `plan [feature]` | The chosen approach: affected files/services/components + a Mermaid diagram |
| `flow [feature]` | A Mermaid sequence diagram of the runtime interaction |
| `review [approach]` | Reviews an existing approach or PR against Tier 1 conventions |

## Domain context

```
pages/
  authentication/   login, signup, onboard, password-reset, request-password-reset, email-confirmation
  main/             dashboard, jobs, roles, profile-management, header, side-bar
  empty/            not-found

core/
  services/         business logic + state (see /rxjs-state-patterns for the BehaviorSubject pattern)
  models/           interface/ types/ constants/ enums/ (see /typescript-standards)
  guards/, interceptors/, modules/ (see /material-ui for the Material barrel)
```

Job applications are the central domain object (`JobApplicationItem`, `JobApplicationStateService`).
Most feature work touches `pages/main/*` and `core/services/*`.

## Constraints every plan must respect

- New state → a `<Domain>StateService` with a private `BehaviorSubject`, not component-local state
  if it needs to be shared (`/rxjs-state-patterns`)
- New UI → standalone components using `AngularMaterialModules` where Material already covers the
  need (`/angular-patterns`, `/material-ui`)
- Cross-cutting concerns (auth, routing) go through existing guards/interceptors in `core/`, not a
  new parallel mechanism
- No Nx/monorepo module-boundary concept applies here — this is a single Angular CLI app

## `options` mode — output template

Write this to the vault (see "Where output goes" below):

```markdown
---
tags: [rzume-web, feature-plan]
status: proposed
created: YYYY-MM-DD
---

## Architecture Options: <feature>

### Problem
[what needs to be built/fixed and why, 1-2 sentences]

### Diagram
​```mermaid
graph TD
  A[Trigger/Component] --> B[Service]
  B --> C[State update]
  C --> D[Consumer components]
​```

### Option A: <name>
- Approach: ...
- Pros: ...
- Cons: ...
- Effort: S/M/L | Risk: low/med/high

### Option B: <name>
[same shape]

### Recommendation
<Option X> — reasoning tied to existing patterns in this repo, not generic best practice

### Open Questions
- [ ] <anything with no clear default answer>
```

**If there's no clear winner between options, or Open Questions is non-empty** — stop and ask the
user per `.claude/rules/human-checkpoint.md`. Don't pick one silently and move on.

## `plan` mode — output template

```markdown
## Architectural Plan: <feature>

### Affected Files
- src/app/pages/main/<x>/...: [what changes]
- src/app/core/services/<x>.service.ts: [new/modified, what it owns]

### New Components/Services
- <Name>: [purpose, where it lives]

### State Ownership
- <StateService>: [what state, who reads/writes it]

### Data Flow
​```mermaid
graph TD
  ...
​```

### Risks & Considerations
- ...

### UI Surface Note
[If this plan includes any new/changed UI: "Use /figma-feature-plan next if there's a Figma design
to work from, otherwise proceed to /write-tests." If no UI surface: omit this section.]
```

## Where output goes

Write plan/options docs to `~/Documents/rzume-web-vault/features/<feature-slug>/plan.md` (create the
folder if new). Add one line to `~/Documents/rzume-web-vault/_MOC.md` under "Features" linking to it.
This vault is local-only — it won't be visible in a PR, so `/pre-commit-checklist`'s eventual summary
still needs the short version inline, not just a link.

## What this skill does NOT cover

- **Figma-to-component mapping for the UI layer** → `/figma-feature-plan`
- **Component/state/styling conventions themselves** → `/angular-patterns`, `/rxjs-state-patterns`,
  `/material-ui`, `/typescript-standards`, `/web-design-guidelines`
- **Writing any code** → `/implement`
