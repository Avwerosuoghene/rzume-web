---
name: bundle-report
description: >-
  Measure and report bundle size in rzume_web against the project's 500KB initial
  budget. Use after adding a dependency, before a release, or when checking whether a
  change grew the bundle. Uses the project's own analyze-bundle build configuration and
  source-map-explorer.
argument-hint: "[nothing needed, or the dependency/change to check]"
---

# Bundle Report — rzume_web

## The budget

`angular.json`'s production build budget:

| Type | Warning | Error |
|---|---|---|
| Initial bundle | 500KB | 5MB |

The README states the same 500KB target. `scripts/quality-gate-check.sh` (run via
`npm run quality-gate:full`) also checks the main bundle against 500KB and flags it as a
warning-level issue (doesn't hard-fail the script) if exceeded.

## Measuring

```bash
npm run analyze-bundle
```

This runs `ng build --configuration=analyze-bundle` (source maps on, no output hashing, named
chunks — see the `analyze-bundle` configuration in `angular.json`) then pipes the output through
`source-map-explorer` to visualize what's actually in the bundle.

For a plain size check without the visual explorer:

```bash
npm run build:prod
find dist/rzume-web/browser -name "main*.js" -exec ls -lh {} \;
```

## Tracing a size increase to its source

```bash
npm run analyze-bundle
```

`source-map-explorer` opens a treemap — look for:
- A newly-added dependency that isn't tree-shaking well (imported as a full namespace import
  instead of a named import)
- A dependency that should be lazy-loaded (via a route-level dynamic `import()`) but is in the
  initial bundle instead

## Before adding a dependency

Check its unpacked/minified size (via `npm view <pkg> dist.unpackedSize` or bundlephobia-style
reasoning) against how much budget headroom exists — run `analyze-bundle` before and after adding
it to get a real before/after delta rather than guessing from the package's reported size alone.

## Report format

```markdown
# Bundle Report — rzume_web — <date>

## Main bundle
- Size: <X> KB
- Budget: 500KB warning / 5MB error
- Status: ✅ within budget / ⚠️ approaching / ❌ over

## What changed since last check
- <dependency/change> — <size delta>

## Recommendations
- <lazy-load candidate, tree-shaking fix, or "no action needed">
```

## What this skill does NOT cover

- **Runtime performance (rendering, RxJS)** → `/rxjs-state-patterns`, `/angular-patterns`
- **Whether a dependency change needs a security check too** → `/security-check`
