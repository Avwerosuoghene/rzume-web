---
name: linting-standards
description: >-
  Resolve lint/toolchain issues in rzume_web — running ESLint via the Angular CLI,
  interpreting failures, and the ajv/override conflict pattern that broke it once
  before. Use when `npm run lint`/`ng lint` fails, before trusting a "lint passed"
  result, or when configuring a new lint rule. For the rule content itself (naming,
  typing) use /typescript-standards or /angular-patterns; this skill covers toolchain
  execution and known issues.
argument-hint: "[describe the lint error or toolchain question]"
---

# Linting Standards — rzume_web

## Toolchain

| Concern | Tool / version |
|---|---|
| Linting | ESLint 8.57.0 via `@angular-eslint/builder@18.3.0`, config in root `.eslintrc.json` |
| Rules | `eslint:recommended` + `@typescript-eslint/recommended` (`@typescript-eslint@7.16.0`), plus `no-explicit-any: error` and `no-unused-vars: error` |
| Command | `npm run lint` → `ng lint` |
| Type checking | `npm run type-check` → `tsc --noEmit` (separate from lint — run both) |

`.eslintrc.json` currently has a single override block for `*.ts` files. There's no visible
template-linting override wired in despite `@angular-eslint/eslint-plugin-template` being a
devDependency — check the actual config before assuming `.html` template lint rules are active.

## Fixed: `ng lint` was broken, now works (three stacked pre-existing bugs)

`ng lint` used to fail immediately before ever reaching a real file. It took three separate fixes,
each masking the next, to get a clean run:

**1. `ajv` version conflict.** `package.json`'s `overrides` block (added for `npm audit`/
`security:fix` reasons) force-bumped `ajv` to `>=8.18.0` project-wide. Both `eslint`'s own core
(`eslint/lib/shared/ajv.js`) and its `@eslint/eslintrc` dependency need `ajv@^6.12.4` internally —
ajv 8 removed files (like `ajv/lib/refs/json-schema-draft-04.json`) that eslint's own code requires
directly. Fixed with scoped override exceptions carving out just eslint's own ajv need, leaving the
blanket bump intact for everything else:

```json
"overrides": {
  "ajv": ">=8.18.0",
  "@eslint/eslintrc": { "ajv": "^6.12.4" },
  "eslint": { "ajv": "^6.12.4" }
}
```

Both entries were needed — `@eslint/eslintrc` and `eslint` core each declare their own direct `ajv`
dependency, and npm's override resolution didn't reliably nest a fix for one from the other's
declaration. Verified via `npm run security:audit` that `ajv@6.12.4`+ isn't a vulnerable version
(the historical ajv prototype-pollution advisory was fixed at 6.12.3) and doesn't reappear in the
audit output.

**2. `.eslintrc.json` config typo.** `extends` referenced `"@typescript-eslint/recommended"`
without the required `"plugin:"` prefix for a plugin-supplied shareable config — legacy ESLint
config format needs `"plugin:@typescript-eslint/recommended"`. This was invisible until fix #1
landed, since the ajv crash always happened first.

**3. Missing template-linting override.** `.eslintrc.json` had no override routing `*.html` files
to `@angular-eslint/template-parser`, so every component template failed with `Parsing error:
Unexpected token <` (being parsed as JavaScript). Added:

```json
{
  "files": ["*.html"],
  "extends": ["plugin:@angular-eslint/template/recommended"]
}
```

`src/index.html` (the root shell, not a component template) is excluded via `ignorePatterns` rather
than linted against Angular template rules.

**A similar `uuid` override conflict was also found and fixed** (unrelated to lint, but discovered
during the same repair): the blanket `"uuid": ">=11.1.0"` override broke `cypress`'s postinstall
(`@cypress/request` needs the CJS-compatible `uuid@^8.3.2`; uuid 11 is ESM-only). Fixed the same way
— a scoped exception: `"cypress": { "@cypress/request": { "uuid": "^8.3.2" } }`.

**If a future dependency bump reintroduces a similar conflict**, the pattern to reach for is a
scoped override exception on the specific package that needs the older API, not reverting the
blanket bump (which exists for real `npm audit` reasons).

`ng lint` now runs to completion and reports genuine pre-existing violations (unused imports, `any`
usage) — real code debt, not a tooling failure. Don't be surprised by a nonzero error count; that's
expected until someone works through it deliberately.

## Running lint (once the above is fixed)

```bash
npm run lint          # ng lint — whole project
npx ng lint --fix      # auto-fix safe violations
```

## Type checking

```bash
npm run type-check    # tsc --noEmit — catches type errors independent of ESLint
```

Since `ng lint` is broken, `type-check` is currently the more reliable automated correctness gate
— don't treat a clean `type-check` run as equivalent to a clean lint run; they check different
things (types vs. style/rule violations).

## Nx / module boundaries

This is a single Angular CLI project, not an Nx monorepo — there's no
`@nx/enforce-module-boundaries` equivalent here. Don't apply Nx-style cross-package import rules;
they don't exist in this codebase.

## What this skill does NOT cover

- **What the rules mean (naming, `any`, strict mode)** → `/typescript-standards`
- **Component-shape conventions** → `/angular-patterns`
