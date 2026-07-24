---
name: security-check
description: >-
  Run and interpret the security audit tooling in rzume_web — npm audit at different
  strictness levels, the security-scan.sh secret-detection script, and what
  security-fix.sh actually does (recommends, doesn't auto-write, override fixes). Use
  before a release, after adding a dependency, or when npm audit reports vulnerabilities.
argument-hint: "[nothing needed, or describe what triggered the check]"
---

# Security Check — rzume_web

## The four related npm scripts (they check different things)

| Script | Command | Strictness |
|---|---|---|
| `npm run security:audit` | `npm audit --audit-level=high` | Blocks on high/critical only |
| `npm run security:audit-prod` | `npm audit --omit=dev` | Like above, but skips devDependencies entirely |
| `npm run security:scan` | `scripts/security-scan.sh` | Runs `npm audit` (any level) **plus** a hardcoded-secrets scan |
| `npm run security:fix` | `scripts/security-fix.sh` | Attempts automated remediation — see below |

`npm run quality-gate:full`'s own audit step uses `--audit-level=moderate` — stricter than the
plain `security:audit` script. Don't treat "security:audit passed" as equivalent to "quality-gate's
audit step would pass" — moderate-severity findings can fail one and not the other.

## ⚠️ `security:fix` recommends overrides — it doesn't safely auto-scope them

`scripts/security-fix.sh`'s "Strategy 3" prints a suggested `overrides` block for transitive
vulnerabilities, e.g.:

```
"overrides": {
  "<pkg>": ">=<safe-version>"
}
```

**This is exactly the pattern that broke `ng lint` and Cypress once already** (see
`/linting-standards`): a blanket, unscoped version bump applied project-wide, with no check for
whether some other package internally needs the older major version's API. `package.json`'s
current `overrides` block (including the now-fixed `ajv`/`uuid` entries) most likely originated
from someone pasting this script's suggestion directly.

**If you add a new override based on this script's output:**
1. Check whether the bumped package is a *direct* dependency of anything else in the tree that
   might need its old API (`npm ls <package>` after adding the override — look for `invalid` or
   crashes when the consuming tool actually runs, not just a clean `npm ls` reporting the version).
2. If something breaks, scope the override to just that dependency's path rather than reverting the
   security fix — see the exact worked example in `/linting-standards` (`"eslint": {"ajv": "..."}`
   pattern).
3. Re-run `npm run security:audit` after to confirm the vulnerability the override targeted is
   actually still resolved for the scoped exception, not just the blanket case.

## Secret scanning

`security:scan` also checks for hardcoded secrets in source. If it flags something, treat it as a
real finding — don't suppress the check. This is separate from `.gitignore`/`.npmrc`-based secret
hygiene; it's a source-code grep-based check.

## Workflow

```bash
npm run security:audit         # quick check, high+ only — good for a fast pre-commit sanity check
npm run security:scan          # audit + secrets — good before a release
npm run security:fix           # see remediation output, but review before applying overrides
npm run security:audit-prod    # what actually ships — devDependency vulnerabilities don't matter here
```

After any dependency change (new package, version bump, new override): run `security:audit` at
minimum, and confirm `ng lint`/`ng build` still work — don't assume a clean audit means nothing
else broke (see the ajv/uuid incident).

## What this skill does NOT cover

- **Fixing a lint/build breakage caused by an override** → `/linting-standards`
- **Bundle size** → `/bundle-report`
