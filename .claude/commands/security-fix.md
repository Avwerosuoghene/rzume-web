# Security Fix — Vulnerability Remediation

Act as a **Senior Security Engineer** to detect, classify, and fix npm security vulnerabilities in the Rzume Web project. Follow all phases in order.

## Core Principles

- **NEVER** run `npm audit fix --force` without explicit approval — it introduces breaking changes
- **NEVER** update Angular packages individually — always use `ng update`
- Prefer the smallest possible change that resolves the vulnerability
- Distinguish production vulnerabilities from dev-only build-tool vulnerabilities

## Phase 1 — Discovery

### 1.1 Get the full vulnerability map
```bash
npm audit --json 2>/dev/null | tail -30
```

### 1.2 List all vulnerabilities with severity and advisory
```bash
npm audit --json 2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin)
vs=d.get('vulnerabilities',{})
for n,i in sorted(vs.items(), key=lambda x: {'critical':0,'high':1,'moderate':2,'low':3}.get(x[1].get('severity','low'),4)):
    sev=i.get('severity','?')
    direct=i.get('isDirect',False)
    fix=i.get('fixAvailable',False)
    via=i.get('via',[])
    roots=[v.get('name','')+'@'+v.get('range','')+'  '+v.get('url','') for v in via if isinstance(v,dict)]
    chain=[v for v in via if isinstance(v,str)]
    print(f'{sev:9s} | {\"DIRECT\" if direct else \"trans \":6s} | fix={str(fix):5s} | {n}')
    for r in roots: print(f'           advisory: {r}')
    if chain: print(f'           via: {chain}')
"
```

### 1.3 Separate production from dev-only
```bash
npm audit --omit=dev 2>&1 | tail -10
```

### 1.4 Priority classification
- **P0/P1** — Critical/High in production audit → fix now
- **P1** — Critical/High dev-only → fix now (supply chain risk)
- **P2** — Moderate → fix soon
- **P3** — Low → monitor

## Phase 2 — Apply Safe Fixes First

```bash
npm audit fix --dry-run  # preview changes
npm audit fix            # apply safe semver-compatible fixes
npm audit --json 2>/dev/null | tail -30  # check what remains
```

If total is now 0, jump to Phase 4 (Verification).

## Phase 3 — Manual Remediation (for remaining issues)

For each remaining vulnerability, choose a strategy:

**A. Direct dependency** — install latest compatible version:
```bash
npm install <package>@latest
```
For Angular packages, NEVER do this individually. Use:
```bash
ng update @angular/core @angular/cli
ng update @angular/material
```

**B. Transitive dependency with fix available** — update the parent:
```bash
npm ls <vulnerable-package>       # find the parent
npm install <parent-package>@latest
```

**C. Transitive dependency, no upstream fix** — use npm overrides:
1. Add to `package.json`:
```json
{
  "overrides": {
    "vulnerable-package": ">=patched-version"
  }
}
```
2. Reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm ls <vulnerable-package>    # verify override applied
```

**D. No fix available** — document as accepted risk (especially for build-tool-only packages that never reach the production bundle).

### Angular-specific guidance
Build tool vulnerabilities (`webpack`, `rollup`, `esbuild`, `postcss`) are **NOT** in the production bundle — they are typically acceptable P3/documentation items, not emergency fixes.

Production runtime dependencies that ARE in the bundle:
`rxjs`, `@angular/*`, `zone.js`, `jwt-decode`, `mixpanel-browser`, any package imported in `src/`

## Phase 4 — Verification

```bash
npm run type-check        # TypeScript must pass
npm run build             # Production build must pass
npm audit 2>&1            # Final count
npm run test:ci           # Unit tests
```

If any of these fail, revert the last change and try a different strategy.

### Rollback options
```bash
# Revert package.json overrides manually, then:
rm -rf node_modules package-lock.json && npm install

# Or restore from git entirely:
git checkout -- package.json package-lock.json
rm -rf node_modules && npm install
```

## Phase 5 — Report

Produce a remediation report:

```
🔒 SECURITY FIX REPORT
========================
Date: [date]

Summary:
- Vulnerabilities before: [n]
- Fixed: [n]
- Remaining: [n]
- Overrides added: [n]

Fixes Applied:
[table of packages, from/to versions, severity]

Overrides Added to package.json:
[table of package, forced version, advisory URL]

Remaining Vulnerabilities (Unfixable):
[package | severity | reason | risk for this Angular app]

Verification:
- TypeScript: ✅/❌
- Build: ✅/❌
- Tests: ✅/❌
- Final audit count: [n]
```
