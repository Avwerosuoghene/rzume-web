# CLAUDE.md

Guidance for Claude Code sessions working in this repo. For what the app itself does, see
`README.md` — this file is about how to work on it, not what it is.

## Quick facts

- Angular 18.2, standalone components, RxJS/`BehaviorSubject` state services, Angular Material
  (`azure-blue` prebuilt theme). Unit tests: Jasmine/Karma. E2E: Cypress (Playwright is installed
  but unused/dormant — don't add Playwright specs).
- Default/PR-target branch is **`master`**, not `main`.
- `ng lint` works (it didn't for a while — see `/linting-standards` if it ever regresses).
- A companion Obsidian vault at `~/Documents/rzume-web-vault/` holds feature plans, Figma specs, and
  implementation summaries — see `_MOC.md` there for the index. It's local-only; PR descriptions
  still need the short version inline.
- Figma is connected via the remote MCP server (`.mcp.json`, project-local scope) — read-only
  design tools are available (`get_design_context`, `get_variable_defs`, etc.).

## There is a full skill package here — use it

This repo has a purpose-built set of skills under `.claude/skills/` covering standards, a
Figma-driven TDD implementation pipeline, and release tooling. **Don't improvise conventions or
workflow steps this package already covers** — load the relevant skill instead.

### Start here for a broad/unclear question
`/frontend-coding-standards` — routes to the right canonical skill. If you already know which
concern you're dealing with, skip straight to it instead.

### The feature-implementation chain

```
feature/bug request
       │
       ▼
  /feature-kickoff       (resuming/picking up a feature — status + live requirements + Figma
       │                  + backend-repo API sync; skip for a brand-new feature or a small fix)
       ▼
  /architect            (skip for small, single-file changes — go straight to /implement)
       │  Mermaid diagram + solution options, written to the vault
       │  stop-and-ask if there's no clear winner (.claude/rules/human-checkpoint.md)
       ▼
  /figma-feature-plan    (only if there's a UI surface with a Figma design)
       │  Figma → Angular Material / existing-component mapping, read-only
       ▼
  /write-tests           (TDD red step — write the failing test FIRST, always)
       ▼
  /implement             (TDD green step — make it pass, minimal change)
       ▼
  /quality-gate          (self-check before presenting)
       ▼
  /code-review           (review the diff against conventions)
       ▼
  /pre-commit-checklist  (lint, type-check, tests — the git hook does NOT enforce these)
       ▼
  /create-pr             (PR description + implementation-summary.md in the vault)
```

For a trivial change, it's fine to jump straight to `/implement` (which still expects
`/write-tests` to have run first) and `/pre-commit-checklist` before committing — the full chain is
for anything non-trivial enough to benefit from a plan.

### Standards skills (referenced throughout the chain, not just at the start)

`/angular-patterns` · `/rxjs-state-patterns` · `/material-ui` · `/typescript-standards` ·
`/linting-standards` · `/web-design-guidelines`

### Release tooling

`/security-check` · `/bundle-report` — reach for these around a release or after a dependency
change, not on every feature.

### The one rule that cuts across everything

`.claude/rules/human-checkpoint.md` — every skill above stops and asks instead of guessing at a
short list of specific fork-in-the-road moments (no clear architecture winner, an unmapped Figma
element, a test that can't pass without breaking a convention, a BLOCKER that survives a second
fix attempt, anything destructive/irreversible). It is not a blanket "ask before every step" rule.

## Known project quirks worth knowing before you dig for them yourself

- `package.json`'s `overrides` block has scoped exceptions for `ajv` (under `eslint`/
  `@eslint/eslintrc`) and `uuid` (under `cypress`/`@cypress/request`) — don't remove these, they fix
  real conflicts with the blanket version bumps. See `/linting-standards` for the full story.
- `scripts/security-fix.sh` only *prints* a suggested `overrides` snippet — it doesn't write
  `package.json` itself. If you're tempted to paste its suggestion in, scope it first (see
  `/security-check`) rather than repeating the mistake that broke lint once already.
- A truly clean `rm -rf node_modules package-lock.json && npm install` currently fails:
  `@abacritt/angularx-social-login@^2.3.0` resolves fresh to a version needing Angular ≥21. Don't
  wipe the lockfile without expecting to deal with this.
