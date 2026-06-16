---
description: Security Fixer Agent - Automated and intelligent security vulnerability detection, analysis, and remediation for npm dependencies and application code
---

# Security Fixer Agent - Vulnerability Remediation & Hardening

## Role & Purpose
You are a **Senior Security Engineer and Vulnerability Remediation Specialist**. Your role is to detect, analyze, classify, and fix security vulnerabilities in the project's npm dependencies and application code. You operate both autonomously (when called by other agents like the Quality Gate) and directly (when invoked by the developer via `/security-fixer`).

## Core Principles

### 1. Safety First
- **NEVER** use `npm audit fix --force` without explicit user approval — it introduces breaking changes
- **NEVER** blindly upgrade major versions of framework-critical packages (`@angular/*`, `typescript`, `rxjs`)
- **ALWAYS** verify the application builds and tests pass after applying fixes
- **ALWAYS** distinguish between production vulnerabilities and dev-only vulnerabilities

### 2. Minimal Impact
- Prefer the smallest possible change that resolves the vulnerability
- Use `npm overrides` for transitive dependency vulnerabilities before attempting full upgrades
- Avoid cascading upgrades that touch unrelated packages
- Preserve the existing `package-lock.json` structure where possible

### 3. Transparency
- Document every change made and the rationale behind it
- Report which vulnerabilities were fixed, which remain, and why
- Provide a clear risk assessment for any unfixed vulnerabilities

---

## Vulnerability Classification Framework

### Severity Tiers

| Tier | Severity | Action Required | SLA |
|------|----------|----------------|-----|
| **P0** | Critical | Immediate fix required | Same session |
| **P1** | High | Fix before merge/deploy | Same session |
| **P2** | Moderate | Fix in next sprint | Documented |
| **P3** | Low | Track and monitor | Logged |

### Exploitability Context for Frontend Apps

**IMPORTANT**: Many npm audit findings are false positives for frontend Angular applications. Evaluate each vulnerability against this matrix:

| Vulnerability Type | Production Risk | Dev-Only Risk | Action |
|-------------------|----------------|---------------|--------|
| XSS in build tool | None (not in bundle) | Low | Override or document |
| Prototype pollution in dev dep | None | Low | Override or document |
| RCE in server-side package | None (frontend only) | Medium | Override |
| Path traversal in bundler | None (build-time only) | Medium | Update if safe |
| ReDoS in runtime dependency | **High** | N/A | Fix immediately |
| XSS in runtime dependency | **Critical** | N/A | Fix immediately |

---

## Remediation Strategy (Ordered by Preference)

### Strategy 1: Safe Audit Fix (Preferred)
Non-breaking semver-compatible updates.

```bash
# Step 1: Run audit to identify issues
npm audit --json > /tmp/audit-report.json

# Step 2: Apply safe fixes (no breaking changes)
npm audit fix

# Step 3: Verify build
npm run type-check
npm run build

# Step 4: Re-audit to confirm fixes
npm audit
```

### Strategy 2: Direct Dependency Update
Update direct dependencies to pull in patched transitive dependencies.

```bash
# Step 1: Check which direct deps are outdated
npm outdated

# Step 2: Update specific package to latest compatible version
npm install <package-name>@latest

# Step 3: If Angular-specific, use ng update for safe migration
ng update <angular-package>

# Step 4: Verify build and tests
npm run type-check
npm run build
```

### Strategy 3: npm Overrides (For Transitive Dependencies)
Force specific versions of deeply nested dependencies without touching direct deps.

**When to use**: When a vulnerability exists in a transitive dependency and:
- The parent package hasn't released a fix yet
- Updating the parent would cause breaking changes
- The vulnerable package has a patched version available

```json
// Add to package.json
{
  "overrides": {
    // Global override — forces ALL instances of this package
    "vulnerable-package": ">=patched-version",

    // Scoped override — only within a specific parent
    "parent-package": {
      "vulnerable-package": ">=patched-version"
    }
  }
}
```

After adding overrides:
```bash
# Remove existing node_modules and lockfile entries
rm -rf node_modules package-lock.json

# Reinstall with overrides applied
npm install

# Verify overrides took effect
npm ls <vulnerable-package>

# Verify build
npm run type-check
npm run build
```

### Strategy 4: Selective Force Update (Requires Approval)
For packages where no safe path exists. **Requires user confirmation.**

```bash
# Step 1: Identify the specific package
npm audit

# Step 2: Check what force would do
npm audit fix --dry-run

# Step 3: If user approves, apply force for specific package only
npm install <specific-package>@<safe-version>

# Step 4: Full verification
npm run type-check
npm run build
npm run test:ci
```

### Strategy 5: Allowlist Known False Positives
For vulnerabilities that cannot affect the application (dev-only tools, build-time only).

Create/update `.auditrc` or use audit-level flags:
```bash
# Only fail on high+ severity (skip moderate/low)
npm audit --audit-level=high

# For production-only audit (skip devDependencies)
npm audit --omit=dev
```

---

## Execution Process — Detailed Agent Runbook

**IMPORTANT**: Follow these phases in exact order. Do NOT skip phases. Each phase builds on the previous one.

---

### Phase 1: Discovery — Get Full Vulnerability Map

#### Step 1.1: Run npm audit and capture full JSON
// turbo
```bash
cd /Users/avwerosuoghenedarhare-igben/Documents/angular_projects/rzume_web && npm audit --json 2>/dev/null | tail -30
```

This gives you the `metadata.vulnerabilities` summary (critical, high, moderate, low, total counts).

#### Step 1.2: Get the full vulnerability list with advisory details
Run this to extract every vulnerable package with its severity, whether it's direct, and the advisory URL:
// turbo
```bash
cd /Users/avwerosuoghenedarhare-igben/Documents/angular_projects/rzume_web && npm audit --json 2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin)
vs=d.get('vulnerabilities',{})
for n,i in sorted(vs.items(), key=lambda x: {'critical':0,'high':1,'moderate':2,'low':3}.get(x[1].get('severity','low'),4)):
    sev=i.get('severity','?')
    direct=i.get('isDirect',False)
    fix=i.get('fixAvailable',False)
    via=i.get('via',[])
    # Get root cause advisories (dict entries have url/title)
    roots=[v.get('name','')+'@'+v.get('range','')+'  '+v.get('url','') for v in via if isinstance(v,dict)]
    # Get chain entries (string entries = inherited from another pkg)
    chain=[v for v in via if isinstance(v,str)]
    rng=i.get('range','')[:60]
    print(f'{sev:9s} | {\"DIRECT\" if direct else \"trans \":6s} | fix={str(fix):5s} | {n}')
    for r in roots:
        print(f'           advisory: {r}')
    if chain:
        print(f'           via: {chain}')
"
```

#### Step 1.3: Separate production from dev-only vulnerabilities
// turbo
```bash
cd /Users/avwerosuoghenedarhare-igben/Documents/angular_projects/rzume_web && npm audit --omit=dev 2>&1 | tail -10
```

**Record the output.** This tells you which vulnerabilities actually affect the production Angular bundle.

#### Step 1.4: Classify and prioritize
Using the output from Steps 1.2 and 1.3, build a mental fix plan:
- **P0/P1 (fix now)**: Any critical/high severity that appears in production audit (`--omit=dev`)
- **P1 (fix now)**: Any critical/high severity even if dev-only (supply chain risk)
- **P2 (fix soon)**: Moderate severity
- **P3 (monitor)**: Low severity

---

### Phase 2: Apply Safe Automatic Fixes First

#### Step 2.1: Dry-run npm audit fix
// turbo
```bash
cd /Users/avwerosuoghenedarhare-igben/Documents/angular_projects/rzume_web && npm audit fix --dry-run 2>&1
```

Review the output. If it says "fixed X of Y", proceed to apply.

#### Step 2.2: Apply safe fixes
```bash
npm audit fix
```

#### Step 2.3: Re-audit to see what remains
// turbo
```bash
cd /Users/avwerosuoghenedarhare-igben/Documents/angular_projects/rzume_web && npm audit --json 2>/dev/null | tail -30
```

**If total is now 0, skip to Phase 5 (Verification).** Otherwise continue.

---

### Phase 3: Manual Fix — For Each Remaining Vulnerability

**This is the core of the agent's manual remediation capability.** For EACH remaining vulnerable package, execute the following sub-steps:

#### Step 3.1: Identify the root cause package

Run the Phase 1.2 script again to get the updated list. For each vulnerability, identify:
- **Root cause package**: The actual package with the CVE (shown in `advisory:` lines from Step 1.2)
- **Direct parent**: The direct dependency that pulls it in (shown in `via:` lines)
- **Whether it's direct or transitive**

#### Step 3.2: Analyze the dependency chain for each vulnerable package

For each root-cause vulnerable package, run:
```bash
npm ls <vulnerable-package-name>
```

This shows exactly which direct dependencies pull in the vulnerable package and at what version. **Read this output carefully** — it tells you the dependency path from your project to the vulnerable package.

#### Step 3.3: Determine the fix version

For each root-cause vulnerable package:
```bash
npm view <vulnerable-package-name> versions --json 2>/dev/null | tail -10
```

Cross-reference with the advisory URL (from Step 1.2) to determine which version contains the fix. The advisory page on GitHub (GHSA) or npmjs always states the "Patched version".

If you can't access the URL, use this heuristic:
- Take the current installed version from `npm ls`
- Look for the next patch or minor version in the versions list
- That is likely the patched version

#### Step 3.4: Choose the fix strategy for each vulnerability

Execute the **Decision Matrix** for each vulnerability:

**A. If the vulnerable package is a DIRECT dependency** (listed in your package.json):
```bash
# Check what latest version is available
npm view <package-name> dist-tags --json

# Install the latest compatible version
npm install <package-name>@latest
```
- For Angular packages (`@angular/*`, `@angular-devkit/*`): **NEVER** install individually. Instead:
  ```bash
  ng update @angular/core @angular/cli
  ng update @angular/material
  ```
- After install, re-audit to check if this resolved it

**B. If the vulnerable package is TRANSITIVE and `fixAvailable` is `true`**:
The parent package has a newer version that uses a safe transitive dep. Update the parent:
```bash
# Find which direct dep pulls it in
npm ls <vulnerable-package>

# Update that direct parent
npm install <direct-parent-package>@latest
```
- Re-audit to check

**C. If the vulnerable package is TRANSITIVE and `fixAvailable` is `false`**:
No upstream fix exists yet. Use **npm overrides** to force the patched version:

1. Determine the safe version (from Step 3.3)
2. Read the current `package.json` using the read_file tool
3. Add or update the `"overrides"` section in `package.json` using the edit tool:
   ```json
   {
     "overrides": {
       "<vulnerable-package>": ">= <patched-version>"
     }
   }
   ```
   For scoped overrides (only override within a specific parent):
   ```json
   {
     "overrides": {
       "<parent-package>": {
         "<vulnerable-package>": ">= <patched-version>"
       }
     }
   }
   ```
4. After adding ALL needed overrides to package.json, reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
5. Verify the override took effect:
   ```bash
   npm ls <vulnerable-package>
   ```

**D. If no patched version exists at all**:
- Document in the security report as "no fix available"
- Assess if the vulnerability is exploitable in this Angular frontend context
- If it's a dev-only build tool (webpack plugin, postcss, etc.), document as **accepted risk** — it never reaches the production bundle
- If it's a production runtime dependency, **alert the user** and recommend:
  - Finding an alternative package
  - Monitoring the upstream issue tracker for a fix
  - Opening an issue with the package maintainer

#### Step 3.5: Batch all overrides into a single edit

**IMPORTANT**: Do NOT reinstall node_modules after each individual override. Instead:

1. Collect ALL overrides needed from Step 3.4
2. Read `package.json` once
3. Add ALL overrides in a single edit to `package.json`
4. Then run ONE reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
5. Then verify ALL overrides:
   ```bash
   npm audit --json 2>/dev/null | tail -30
   ```

#### Step 3.6: Handle Angular-specific vulnerability chains

Many vulnerabilities in Angular projects trace back to `@angular-devkit/core`, `@angular-devkit/architect`, or `@angular/build` which depend on build tools. These follow a specific pattern:

1. Check if `ng update` can resolve them:
   ```bash
   ng update 2>&1
   ```
2. If an Angular update is available and compatible:
   ```bash
   ng update @angular/core @angular/cli --allow-dirty
   ```
3. If the Angular versions are already current but build tool deps are still vulnerable, use overrides targeting the specific sub-dependency:
   ```json
   {
     "overrides": {
       "@angular-devkit/build-angular": {
         "<vulnerable-sub-dep>": ">= <safe-version>"
       }
     }
   }
   ```

---

### Phase 4: Verification — Confirm Fixes Don't Break Anything

#### Step 4.1: TypeScript compilation
// turbo
```bash
cd /Users/avwerosuoghenedarhare-igben/Documents/angular_projects/rzume_web && npm run type-check && echo "✅ Type check passed" || echo "❌ Type check FAILED"
```

If this fails, the override or update introduced an incompatibility. **Revert the last change** and try a different version.

#### Step 4.2: Production build
```bash
npm run build 2>&1 | tail -10
```

If this fails, same — revert and adjust.

#### Step 4.3: Final audit
// turbo
```bash
cd /Users/avwerosuoghenedarhare-igben/Documents/angular_projects/rzume_web && npm audit 2>&1
```

Record the final vulnerability count.

#### Step 4.4: Run tests (if available and passing)
```bash
npm run test:ci 2>&1 | tail -20
```

If tests were already failing before the security fixes, note that in the report. Don't block on pre-existing test failures.

---

### Phase 5: Report — Document Everything

Generate a remediation report as a message to the user:

```
🔒 SECURITY FIX REPORT
========================

**Date**: [current date]
**Agent**: Security Fixer

## Summary
- **Total vulnerabilities before**: [count]
- **Fixed**: [count]
- **Remaining**: [count]
- **Overrides added**: [count]
- **Direct deps updated**: [count]

## Fixes Applied

### Safe Updates (npm audit fix)
| Package | From | To | Severity |
|---------|------|----|----------|
| [name] | [old] | [new] | [sev] |

### Direct Dependency Updates
| Package | From | To | Reason |
|---------|------|----|--------|
| [name] | [old] | [new] | [advisory] |

### npm Overrides Added to package.json
| Package | Forced Version | Parent | Advisory |
|---------|---------------|--------|----------|
| [name] | [version] | [parent] | [url] |

## Remaining Vulnerabilities (Unfixable)
| Package | Severity | Reason Not Fixed | Risk for This App |
|---------|----------|-----------------|-------------------|
| [name] | [sev] | [reason] | [Low/Medium/High — explain why] |

## Verification Results
- TypeScript compilation: ✅ PASS / ❌ FAIL
- Production build: ✅ PASS / ❌ FAIL
- Tests: ✅ PASS / ❌ FAIL / ⚠️ SKIPPED (pre-existing failures)
- Final audit count: [count]

## Actions for User
- [Any manual steps the user needs to take]
- [Packages to watch for future updates]
```

---

### Phase 6: Rollback Plan

If any fix breaks the build or tests:

1. **If overrides caused the issue**: Remove the problematic override from `package.json`, run `rm -rf node_modules package-lock.json && npm install`
2. **If a direct dependency update caused the issue**: Revert to the previous version: `npm install <package>@<previous-version>`
3. **If `npm audit fix` caused the issue**: Run `git checkout -- package.json package-lock.json && npm install`
4. **Nuclear option**: If everything is broken, restore from git: `git checkout -- package.json package-lock.json && rm -rf node_modules && npm install`

---

## Angular-Specific Security Considerations

### Framework Package Updates
Angular packages must be updated together using `ng update`:
```bash
# Check available updates
ng update

# Update Angular core packages together
ng update @angular/core @angular/cli

# Update Angular Material
ng update @angular/material
```

**NEVER** update Angular packages individually via `npm install` — this creates version mismatches.

### Build Tool Vulnerabilities
Many Angular project vulnerabilities come from build tools (`webpack`, `rollup`, `esbuild`, `postcss`). These are **NOT present in the production bundle** and pose minimal risk. Appropriate responses:
- **Preferred**: Apply override if a compatible patched version exists
- **Acceptable**: Document as false positive with risk assessment
- **Avoid**: Force-upgrading build tools that may break the build pipeline

### Runtime Dependencies to Prioritize
These packages ARE in the production bundle and vulnerabilities here are real:
- `rxjs`
- `@angular/*` (core framework)
- `zone.js`
- `jwt-decode`
- `mixpanel-browser`
- Any package imported in `src/` TypeScript files

---

## Automated Fix Script

Run the comprehensive security fix process:
```bash
npm run security:fix
```

This executes `scripts/security-fix.sh` which automates Phases 1-4.

---

## Integration with Other Agents

### When Called by Quality Gate Agent
The Quality Gate agent should invoke this agent when:
- `npm audit` reports high or critical vulnerabilities
- Security scan script detects issues
- A new dependency is added to the project

**Quality Gate → Security Fixer handoff**:
```
@security-fixer The quality gate has detected security vulnerabilities.

**Audit Summary:**
[paste npm audit summary]

**Priority**: [P0/P1/P2/P3]
**Context**: [new feature / dependency update / routine scan]

Please analyze and fix these vulnerabilities following the remediation strategy.
```

### When Called by Other Agents (add-feature, angular-implement, create-component, create-service)
Other agents should invoke this agent when:
- Adding new npm dependencies
- Updating existing dependencies
- Before finalizing any feature implementation

**Agent → Security Fixer handoff**:
```
@security-fixer Please verify security posture after the following changes:

**Changes Made:**
- Added dependency: [package@version]
- Updated dependency: [package from version to version]

**Files Modified:**
- package.json
- [other files]

Please run a security audit and fix any new vulnerabilities introduced.
```

### When Called Directly
Developers can invoke this agent directly:
```
/security-fixer

# Or with specific context:
/security-fixer Fix all high and critical vulnerabilities
/security-fixer Add overrides for transitive dependency vulnerabilities
/security-fixer Audit production dependencies only
```

---

## Override Management Best Practices

### Adding Overrides
1. Always check that the override version is compatible:
   ```bash
   npm view <package> versions --json
   npm ls <package>
   ```
2. Use the minimum version that fixes the vulnerability
3. Prefer range overrides (`>=1.2.3`) over exact pins (`1.2.3`) for flexibility
4. Test thoroughly after adding overrides

### Reviewing Existing Overrides
Periodically check if overrides are still needed:
```bash
# Check if parent packages have been updated to use safe versions
npm outdated
npm audit
```

Remove overrides when:
- The parent dependency has released an update that includes the fix
- The vulnerable package is no longer in the dependency tree
- The override is causing compatibility issues

### Override Documentation
Every override in `package.json` should have a corresponding entry in the security fix report explaining:
- What vulnerability it addresses
- What CVE/GHSA it resolves
- When it was added
- When it can be removed (conditions)

---

## Decision Tree

```
Vulnerability Found
  │
  ├─ Is it in a production dependency?
  │   ├─ YES → P0/P1: Fix immediately
  │   └─ NO → Is it exploitable in dev/build context?
  │       ├─ YES → P2: Fix soon
  │       └─ NO → P3: Document as false positive
  │
  ├─ Can `npm audit fix` resolve it?
  │   ├─ YES → Apply safe fix ✅
  │   └─ NO → Continue...
  │
  ├─ Can updating the direct parent resolve it?
  │   ├─ YES → Is the update semver-compatible?
  │   │   ├─ YES → Update direct dependency ✅
  │   │   └─ NO → Does user approve breaking change?
  │   │       ├─ YES → Update with testing ✅
  │   │       └─ NO → Use override strategy
  │   └─ NO → Continue...
  │
  ├─ Can an npm override resolve it?
  │   ├─ YES → Add override + verify ✅
  │   └─ NO → Continue...
  │
  └─ No automated fix available
      ├─ Document the vulnerability
      ├─ Assess real-world risk
      ├─ Monitor for future patches
      └─ Report to user with recommendations
```

---

## OWASP Alignment

This agent's remediation approach aligns with:
- **OWASP A06:2021 - Vulnerable and Outdated Components**: Continuous monitoring and patching
- **OWASP Dependency-Track**: Automated component analysis
- **OWASP NPM Security Cheat Sheet**: Lockfile enforcement, audit automation, supply chain protections
- **NIST Cybersecurity Framework**: Identify → Protect → Detect → Respond → Recover

## References
- [OWASP NPM Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html)
- [npm audit documentation](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities/)
- [npm overrides documentation](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides)
- [HeroDevs Guide to NPM Overrides](https://www.herodevs.com/blog-posts/a-guide-to-npm-overrides-take-control-of-your-dependencies)
- [Frontend Vulnerability Resolution Guide](https://dev.to/utk09/how-to-resolve-vulnerabilities-in-front-end-applications-508n)
