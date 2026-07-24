---
name: figma-feature-plan
description: >-
  Map a Figma design to Angular Material components and app conventions for rzume_web,
  before any UI code is written. Use when a feature request includes a Figma link/node
  and involves building or changing UI. Reads the Figma design via the connected Figma
  MCP server and produces a feature spec — it never writes UI code itself. Requires the
  Figma MCP connection (see the mcp-figma-connection memory / .mcp.json) to be active.
argument-hint: "[Figma link or node, or feature name if a plan.md already references one]"
---

# Figma Feature Plan — design-to-spec for rzume_web

You read a Figma design and produce a **feature spec** that `/write-tests` and `/implement` execute
against with zero guessing about what a Figma element maps to in this codebase. You never write
component code here — that's `/implement`'s job. This is the read-only, design-to-code half of the
Figma integration — it never calls `use_figma`, `generate_figma_design`, or other write-to-Figma
tools; those are for the opposite direction (code-to-design) and out of scope here.

Comes after `/architect` (which decides the structural approach) and before `/write-tests`.

## Hard rules

- **Never guess a component mapping.** If nothing in Angular Material or this app's existing
  components matches a Figma element, it's a Gap — flag it per
  `.claude/rules/human-checkpoint.md`, don't invent a new custom component silently.
- **Never guess a token/color/spacing value.** Pull the actual variable via `get_variable_defs` —
  this app has no custom design-token layer (see `/material-ui`), so most values will map to
  Angular Material's prebuilt `azure-blue` theme or to one of the three real breakpoints documented
  in `/web-design-guidelines` (`600px`/`768px`/`950px`) — not to a value invented from the
  screenshot.
- **Missing the Figma link/node** → ask which one, don't guess which frame is relevant.
- **Scope is one feature/frame per run** — don't try to spec an entire page hierarchy in one pass.

## Workflow

**Step 1 — Get the design context.**

```
get_design_context   (the node/frame — layout, structure, text content)
get_screenshot        (visual reference)
get_metadata          (node tree, if get_design_context needs disambiguation on a complex frame)
```

**Step 2 — Check for existing Code Connect mappings first.**

```
get_code_connect_map              (existing Figma-component -> codebase-component mappings, if any exist)
get_code_connect_suggestions      (candidate matches if no map exists yet)
```

This project has no Code Connect mappings configured yet, so expect these to come back empty — that's
expected, not an error. If they ever do return matches, prefer them over manual mapping below.

**Step 3 — Resolve variables/tokens.**

```
get_variable_defs
```

Match each color/spacing/typography value against Angular Material's theme and this app's real
breakpoints (`/web-design-guidelines`) — don't invent a value that isn't backed by one of these.

**Step 4 — Map Figma elements → Angular.**

For each element in the frame, one of three outcomes:
1. **Existing Angular Material component** (`/material-ui` — check `AngularMaterialModules` first)
2. **Existing app component** (check `src/app/components/` and the relevant `pages/main/*` folder
   for something already doing this — see `/angular-patterns` on barrel/folder conventions)
3. **Gap** — nothing matches; requires human input on whether to build new or approximate

**Step 5 — Write the feature spec.**

Save alongside the `architect` plan for the same feature:
`~/Documents/rzume-web-vault/features/<feature-slug>/feature-spec.md`

```markdown
---
tags: [rzume-web, feature-spec]
status: proposed
created: YYYY-MM-DD
---

## Feature Spec: <name>

Plan: [[plan]]

### Figma Source
<link/node reference>

### Component Mapping
| Figma element | Angular equivalent | Notes |
|---|---|---|
| Primary button | `MatButtonModule` (`AngularMaterialModules`) | already in barrel, no change needed |
| Status pill | existing `job-stats` carousel item shape? | verify before reusing |

### Token/Style Mapping
| Figma value | App equivalent | Notes |
|---|---|---|
| #<hex> | Material `azure-blue` primary / closest existing usage | verify via get_variable_defs, don't guess |
| <breakpoint> | 600px / 768px / 950px (see /web-design-guidelines) | |

### States to Implement (drives the test list for /write-tests)
- Default / loading / empty / error — from Figma variant frames if present

### Acceptance Criteria → Tests
- [ ] <criterion> → test: "should <behavior> when <condition>"

### Gaps (human input needed)
- <Figma element with no existing equivalent>
```

## What this skill does NOT cover

- **Which Angular Material module a mapped element actually needs wired up** → `/material-ui`
- **Writing the component/test code** → `/write-tests`, `/implement`
- **The architectural decision this spec builds on** → `/architect`
