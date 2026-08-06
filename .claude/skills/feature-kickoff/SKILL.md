---
name: feature-kickoff
description: >-
  Kick off work on an in-progress or new feature in rzume_web by gathering everything
  the rest of the chain needs in one pass: current implementation status, live
  requirements from the user, the Figma UI spec (if any), and — uniquely — a sync
  against the rzume backend repo to find out which APIs the feature actually needs
  are already built. Produces a single kickoff plan, then walks into /architect,
  /figma-feature-plan, /write-tests, and /implement with the user rather than handing
  off blind. Use this whenever picking up or resuming a feature branch, not for a
  single-file bug fix.
argument-hint: "[feature name or slug, e.g. roles]"
---

# Feature Kickoff — rzume_web

This is the **entry point** to the feature-implementation chain when a feature already has a
foothold in the codebase (a branch, some scaffolding, a half-built page) and you need to
reconstruct context before planning further work. It sits *before* `/architect`:

```
feature request
       │
       ▼
  /feature-kickoff   ← status + live requirements + Figma + backend API sync → kickoff plan
       │
       ▼
  /architect          (structural decision, using the kickoff plan as input)
       │
       ▼
  /figma-feature-plan  (only if Step 3 found a UI surface)
       │
       ▼
  /write-tests → /implement → /quality-gate → /code-review → /pre-commit-checklist → /create-pr
```

It does not replace `/architect` or `/figma-feature-plan` — it feeds them. Don't re-derive their
output templates here; call them once this skill's plan exists.

## Step 1 — Read current implementation status

Grep the codebase for the feature slug across the places a feature normally touches:

- `src/app/pages/main/<slug>/` — page component(s)
- `src/app/core/services/<slug>*.service.ts` — business logic + state service
- `src/app/core/models/{interface,constants,enums}/<slug>*` — types/constants
- `src/app/components/*<slug>*` — feature-specific dialogs/widgets
- route registration in the app's routing config

Summarize what exists vs. what's a stub vs. what's missing entirely. Don't assume — read the
actual files. If `~/Documents/rzume-web-vault/features/<slug>/` already has a `plan.md` or
`feature-spec.md` from a prior `/architect` or `/figma-feature-plan` run, note that it exists (link
it in the output) but don't treat it as the requirements source — that's Step 2.

## Step 2 — Live requirements interview

This project has no standing feature-spec doc to pull from — requirements come from the user,
live, every time this skill runs. Ask directly (don't guess):

- What's the user-facing goal of this work right now — new feature, extending existing
  scaffolding, or fixing/finishing something partially built?
- What are the concrete acceptance criteria? ("user can do X, sees Y when Z")
- Any constraints not visible in code yet (limits, validation rules, edge cases)?

If the answers are ambiguous enough that two different implementations could satisfy the same
statement, that's the `/write-tests` ambiguity trigger in `.claude/rules/human-checkpoint.md` —
flag it now rather than letting it surface later as a bad test.

## Step 3 — Figma UI surface (if any)

Ask whether this feature has a UI surface with a Figma design. If yes, get the link/node now —
don't guess which frame is relevant. Do **not** perform the Figma-to-Angular mapping here; that
whole workflow (`get_design_context`, `get_variable_defs`, component mapping, gap detection)
belongs to `/figma-feature-plan` and duplicating it here would drift out of sync with it. Just
capture the reference and note in the kickoff plan that `/figma-feature-plan <link>` runs next.

If there's no UI surface (pure backend-consuming logic, a data-layer change), say so and skip
straight past this step.

## Step 4 — Backend API sync

This is the step nothing else in the chain does. The rzume backend lives locally at:

```
~/Documents/DotNet/new_rzume/Rzume/src/Rzume.API/
```

(a .NET repo, currently on its own feature branches mirroring this frontend's — e.g. this frontend's
`feat-roles-implementation` pairs with the backend's `roles-implementation`). Read-only — this
skill never edits files in that repo.

**4a. Find the controller for this feature.**
`src/Rzume.API/Controllers/<Feature>Controller.cs` — list every action, its HTTP verb/route, and
request/response DTO (`src/Rzume.API/DTO/<Feature>/`). **Open the response DTO's actual fields, not
just its filename** — endpoint-exists is not the same as shape-matches. A controller action can be
✅ "built and wired" by route while still returning a shape the frontend doesn't expect: real
example from this project, `RolesController.GetAll()` returns `ApiResponse<RoleListResponseDto>`
(`{ count, roles }`, collection wrapped in an envelope) — the frontend originally assumed
`response.data` was the bare `Role[]` itself, passed the whole envelope object into
`RoleStateService.setRoles()`, and the roles page rendered completely blank against the real
backend (200 response, no error) despite every unit test passing, because the mocks fed the wrong
assumption back to themselves. See `roles-api-gap` memory for the full incident. The
`postman/Rzume.API.postman_collection.json` collection is a secondary cross-check if a controller is
hard to find by name.

**4b. Find what the frontend already expects.**
`src/app/core/models/constants/api.routes.ts` (the `ApiRoutes` entries for this feature) and the
feature's `*.service.ts` — list every route/method the frontend calls or has a constant for, even
if unused yet.

**4c. Produce an API availability map** — for every capability the Step 2 requirements imply,
mark one of:
- ✅ **Built & wired** — backend action exists, frontend service method calls it
- 🔶 **Built, not wired** — backend action exists, no frontend call yet (normal — that's this
  feature's remaining work)
- ⚠️ **Frontend expects it, backend doesn't have it** — a real gap. Example of this exact pattern
  found in this repo: `role.service.ts`'s `getRoleStats()` calls `ApiRoutes.roles.stats`
  (`GET api/roles/stats`), but `RolesController.cs` has no `stats` action — unlike
  `JobApplicationsController`, which does implement `GET .../stats`. Don't silently stub this out
  or invent a response shape — it's a Gap.
- ❌ **Not built on either side** — needs backend work before frontend work can complete

**Any ⚠️ or ❌ entry is a stop-and-ask per `.claude/rules/human-checkpoint.md`** — the user decides
whether to build the backend endpoint first (separate task, different repo), mock/stub it
temporarily, or descope that capability from this pass. Don't guess.

## Step 5 — Write the kickoff plan

```markdown
---
tags: [rzume-web, feature-kickoff]
status: proposed
created: YYYY-MM-DD
---

## Feature Kickoff: <feature>

### Current Status
[what's scaffolded / stubbed / missing, from Step 1 — with file paths]

### Requirements (from live interview)
- [acceptance criteria as stated by the user]

### UI Surface
[Figma link/node captured in Step 3, or "none — backend-only change"]

### Backend API Availability
| Capability | Backend action | Frontend call | Status |
|---|---|---|---|
| ... | `GET /api/<feature>` | `<feature>.service.ts#getX()` | ✅ / 🔶 / ⚠️ / ❌ |

### Gaps requiring a decision
- [any ⚠️/❌ row, plus the question asked to the user and their answer]

### Next steps
1. `/architect plan` — using this doc as input
2. `/figma-feature-plan <link>` — only if a UI surface exists
3. `/write-tests` → `/implement`
```

Save to `~/Documents/rzume-web-vault/features/<feature-slug>/kickoff-plan.md` (create the folder if
new — reuse it if `/architect` already created it for this feature). Add one line under "Features"
in `~/Documents/rzume-web-vault/_MOC.md`. Link `plan.md`/`feature-spec.md` with `[[wikilinks]]` once
those exist from the next steps.

## Step 6 — Work through implementation together

Once the kickoff plan is written and any Step 4 gaps are resolved, don't hand off silently —
walk through `/architect` → (`/figma-feature-plan`) → `/write-tests` → `/implement` in the same
session, checking in with the user between steps rather than running the whole chain unattended.
This skill's job ends once `/implement` has a green test and the loop continues into
`/quality-gate` per the normal chain.

## What this skill does NOT cover

- **The structural/architecture decision itself** → `/architect`
- **Figma-to-Angular component mapping** → `/figma-feature-plan`
- **Writing backend code** → out of scope entirely; this skill only reads the backend repo
- **Writing tests or component code** → `/write-tests`, `/implement`
