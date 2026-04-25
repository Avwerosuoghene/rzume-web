#!/bin/bash

# Security Fixer Agent - Automated Vulnerability Remediation Script
# This script implements the Security Fixer Agent's remediation strategy
# Usage: npm run security:fix

set -o pipefail

echo "🔒 Security Fixer Agent - Automated Vulnerability Remediation"
echo "=============================================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

FIXES_APPLIED=0
OVERRIDES_ADDED=0
REMAINING_VULNS=0
INITIAL_VULNS=0
ERRORS=0

# ============================================================
# Phase 1: Discovery & Classification
# ============================================================
echo -e "${CYAN}━━━ Phase 1: Discovery & Classification ━━━${NC}"
echo ""

echo -e "${BLUE}📊 Running npm audit for vulnerability discovery...${NC}"
AUDIT_JSON=$(npm audit --json 2>/dev/null || true)

if [ -z "$AUDIT_JSON" ] || [ "$AUDIT_JSON" = "{}" ]; then
    echo -e "${GREEN}✅ No vulnerabilities found! Project is secure.${NC}"
    exit 0
fi

# Parse vulnerability counts from metadata section
# The npm audit --json v2 format puts counts under metadata.vulnerabilities
METADATA_BLOCK=$(echo "$AUDIT_JSON" | sed -n '/"metadata"/,/^  }/p')
CRITICAL=$(echo "$METADATA_BLOCK" | grep -o '"critical": *[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
HIGH=$(echo "$METADATA_BLOCK" | grep -o '"high": *[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
MODERATE=$(echo "$METADATA_BLOCK" | grep -o '"moderate": *[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
LOW=$(echo "$METADATA_BLOCK" | grep -o '"low": *[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
TOTAL=$(echo "$METADATA_BLOCK" | grep -o '"total": *[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")

# Handle empty values
CRITICAL=${CRITICAL:-0}
HIGH=${HIGH:-0}
MODERATE=${MODERATE:-0}
LOW=${LOW:-0}
TOTAL=${TOTAL:-0}
INITIAL_VULNS=$TOTAL

echo ""
echo -e "${YELLOW}📋 Vulnerability Summary (Before Fix):${NC}"
echo "   ┌─────────────────────────────────┐"
echo "   │  Critical:  $CRITICAL"
echo "   │  High:      $HIGH"
echo "   │  Moderate:  $MODERATE"
echo "   │  Low:       $LOW"
echo "   │  ─────────────────────────────  │"
echo "   │  Total:     $TOTAL"
echo "   └─────────────────────────────────┘"
echo ""

if [ "$TOTAL" -eq 0 ]; then
    echo -e "${GREEN}✅ No vulnerabilities found! Project is secure.${NC}"
    exit 0
fi

# Classify by priority
echo -e "${BLUE}🏷️  Priority Classification:${NC}"
if [ "$CRITICAL" -gt 0 ]; then
    echo -e "   ${RED}P0 (Critical): $CRITICAL vulnerabilities - IMMEDIATE FIX REQUIRED${NC}"
fi
if [ "$HIGH" -gt 0 ]; then
    echo -e "   ${RED}P1 (High): $HIGH vulnerabilities - FIX BEFORE DEPLOY${NC}"
fi
if [ "$MODERATE" -gt 0 ]; then
    echo -e "   ${YELLOW}P2 (Moderate): $MODERATE vulnerabilities - FIX IN NEXT SPRINT${NC}"
fi
if [ "$LOW" -gt 0 ]; then
    echo -e "   ${GREEN}P3 (Low): $LOW vulnerabilities - MONITOR${NC}"
fi
echo ""

# ============================================================
# Phase 2: Production vs Dev-Only Analysis
# ============================================================
echo -e "${CYAN}━━━ Phase 2: Production vs Dev-Only Analysis ━━━${NC}"
echo ""

echo -e "${BLUE}🔍 Checking production-only vulnerabilities...${NC}"
PROD_AUDIT=$(npm audit --omit=dev --json 2>/dev/null || true)
PROD_METADATA=$(echo "$PROD_AUDIT" | sed -n '/"metadata"/,/^  }/p')
PROD_TOTAL=$(echo "$PROD_METADATA" | grep -o '"total": *[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
PROD_TOTAL=${PROD_TOTAL:-0}
DEV_ONLY=$((TOTAL - PROD_TOTAL))

echo "   Production dependencies: $PROD_TOTAL vulnerabilities"
echo "   Dev-only dependencies:   $DEV_ONLY vulnerabilities"
echo ""

if [ "$PROD_TOTAL" -gt 0 ]; then
    echo -e "   ${RED}⚠️  Production vulnerabilities detected — these affect the deployed application${NC}"
else
    echo -e "   ${GREEN}✅ No production vulnerabilities — all issues are in dev/build tools${NC}"
fi
echo ""

# ============================================================
# Phase 3: Apply Fixes (Ordered by Safety)
# ============================================================
echo -e "${CYAN}━━━ Phase 3: Apply Fixes ━━━${NC}"
echo ""

# --- Strategy 1: Safe npm audit fix ---
echo -e "${BLUE}🔧 Strategy 1: Safe npm audit fix (non-breaking)...${NC}"
echo ""

# Dry run first
DRY_RUN_OUTPUT=$(npm audit fix --dry-run 2>&1 || true)
WOULD_FIX=$(echo "$DRY_RUN_OUTPUT" | grep -c "fixed" || echo "0")

if echo "$DRY_RUN_OUTPUT" | grep -q "fixed 0 of"; then
    echo -e "   ${YELLOW}ℹ️  No safe automatic fixes available${NC}"
else
    echo -e "   ${GREEN}Applying safe fixes...${NC}"
    FIX_OUTPUT=$(npm audit fix 2>&1 || true)

    if echo "$FIX_OUTPUT" | grep -q "fixed"; then
        FIXED_COUNT=$(echo "$FIX_OUTPUT" | grep -o "fixed [0-9]*" | grep -o "[0-9]*" || echo "0")
        FIXES_APPLIED=$((FIXES_APPLIED + FIXED_COUNT))
        echo -e "   ${GREEN}✅ Applied $FIXED_COUNT safe fixes${NC}"
    else
        echo -e "   ${YELLOW}ℹ️  npm audit fix produced no changes${NC}"
    fi
fi
echo ""

# --- Strategy 2: Check for outdated direct dependencies ---
echo -e "${BLUE}🔧 Strategy 2: Checking outdated direct dependencies...${NC}"
echo ""

OUTDATED_OUTPUT=$(npm outdated --json 2>/dev/null || true)
if [ -n "$OUTDATED_OUTPUT" ] && [ "$OUTDATED_OUTPUT" != "{}" ]; then
    OUTDATED_COUNT=$(echo "$OUTDATED_OUTPUT" | grep -c '"wanted"' || echo "0")
    echo "   Found $OUTDATED_COUNT outdated packages"
    echo "   Run 'npm outdated' for details"
    echo ""
    echo -e "   ${YELLOW}ℹ️  Outdated packages may contain vulnerability fixes${NC}"
    echo "   Review with: npm outdated"
else
    echo -e "   ${GREEN}✅ All direct dependencies are up to date${NC}"
fi
echo ""

# --- Strategy 3: Identify candidates for npm overrides ---
echo -e "${BLUE}🔧 Strategy 3: Analyzing transitive dependency vulnerabilities for overrides...${NC}"
echo ""

# Re-audit after safe fixes
POST_FIX_AUDIT=$(npm audit --json 2>/dev/null || true)
POST_FIX_METADATA=$(echo "$POST_FIX_AUDIT" | sed -n '/"metadata"/,/^  }/p')
POST_FIX_TOTAL=$(echo "$POST_FIX_METADATA" | grep -o '"total": *[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
POST_FIX_TOTAL=${POST_FIX_TOTAL:-0}

if [ "$POST_FIX_TOTAL" -gt 0 ]; then
    echo -e "   ${YELLOW}$POST_FIX_TOTAL vulnerabilities remain after safe fixes${NC}"
    echo ""

    # Check if overrides already exist in package.json
    if grep -q '"overrides"' package.json 2>/dev/null; then
        echo -e "   ${BLUE}ℹ️  Existing overrides found in package.json${NC}"
    else
        echo -e "   ${YELLOW}ℹ️  No overrides section found in package.json${NC}"
        echo "   Consider adding npm overrides for transitive vulnerabilities"
    fi
    echo ""

    # List remaining vulnerable packages
    echo -e "   ${BLUE}Remaining vulnerable packages:${NC}"
    npm audit 2>/dev/null | grep -E "^[a-zA-Z@]" | head -20 | while read -r line; do
        echo "   - $line"
    done
    echo ""

    echo -e "   ${YELLOW}📝 Override Recommendations:${NC}"
    echo "   To fix remaining transitive vulnerabilities, add overrides to package.json:"
    echo ""
    echo '   "overrides": {'
    echo '     "<vulnerable-package>": ">=<patched-version>"'
    echo '   }'
    echo ""
    echo "   Then run: rm -rf node_modules package-lock.json && npm install"
else
    echo -e "   ${GREEN}✅ All vulnerabilities resolved! No overrides needed.${NC}"
fi
echo ""

# ============================================================
# Phase 4: Verification
# ============================================================
echo -e "${CYAN}━━━ Phase 4: Verification ━━━${NC}"
echo ""

# TypeScript compilation check
echo -e "${BLUE}🔍 Verifying TypeScript compilation...${NC}"
if npm run type-check 2>&1 > /dev/null; then
    echo -e "   ${GREEN}✅ TypeScript compilation: PASSED${NC}"
else
    echo -e "   ${RED}❌ TypeScript compilation: FAILED${NC}"
    echo "   Run 'npm run type-check' to see errors"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Build check
echo -e "${BLUE}🔍 Verifying production build...${NC}"
if npm run build 2>&1 > /dev/null; then
    echo -e "   ${GREEN}✅ Production build: PASSED${NC}"
else
    echo -e "   ${RED}❌ Production build: FAILED${NC}"
    echo "   Run 'npm run build' to see errors"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Final audit
echo -e "${BLUE}📊 Final vulnerability count...${NC}"
FINAL_AUDIT=$(npm audit --json 2>/dev/null || true)
FINAL_METADATA=$(echo "$FINAL_AUDIT" | sed -n '/"metadata"/,/^  }/p')
FINAL_CRITICAL=$(echo "$FINAL_METADATA" | grep -o '"critical": *[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
FINAL_HIGH=$(echo "$FINAL_METADATA" | grep -o '"high": *[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
FINAL_MODERATE=$(echo "$FINAL_METADATA" | grep -o '"moderate": *[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
FINAL_LOW=$(echo "$FINAL_METADATA" | grep -o '"low": *[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
FINAL_TOTAL=$(echo "$FINAL_METADATA" | grep -o '"total": *[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")

FINAL_CRITICAL=${FINAL_CRITICAL:-0}
FINAL_HIGH=${FINAL_HIGH:-0}
FINAL_MODERATE=${FINAL_MODERATE:-0}
FINAL_LOW=${FINAL_LOW:-0}
FINAL_TOTAL=${FINAL_TOTAL:-0}
REMAINING_VULNS=$FINAL_TOTAL

FIXED_TOTAL=$((INITIAL_VULNS - FINAL_TOTAL))
if [ "$FIXED_TOTAL" -lt 0 ]; then
    FIXED_TOTAL=0
fi

echo ""

# ============================================================
# Phase 5: Report
# ============================================================
echo -e "${CYAN}━━━ Phase 5: Security Fix Report ━━━${NC}"
echo ""
echo "=============================================================="
echo -e "${BLUE}🔒 SECURITY FIX REPORT${NC}"
echo "=============================================================="
echo ""
echo "  Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Agent: Security Fixer"
echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │  BEFORE                                  │"
echo "  │  Critical: $CRITICAL  High: $HIGH  Moderate: $MODERATE  Low: $LOW"
echo "  │  Total: $INITIAL_VULNS"
echo "  │                                          │"
echo "  │  AFTER                                   │"
echo "  │  Critical: $FINAL_CRITICAL  High: $FINAL_HIGH  Moderate: $FINAL_MODERATE  Low: $FINAL_LOW"
echo "  │  Total: $FINAL_TOTAL"
echo "  │                                          │"
echo "  │  FIXED: $FIXED_TOTAL vulnerabilities     │"
echo "  └─────────────────────────────────────────┘"
echo ""

if [ "$ERRORS" -gt 0 ]; then
    echo -e "  ${RED}⚠️  WARNING: $ERRORS verification check(s) failed${NC}"
    echo "  Please review the errors above and fix manually."
    echo ""
fi

if [ "$FINAL_TOTAL" -gt 0 ]; then
    echo -e "  ${YELLOW}📝 Remaining Vulnerabilities:${NC}"
    echo "  $FINAL_TOTAL vulnerabilities remain. Recommended actions:"
    echo ""

    if [ "$FINAL_CRITICAL" -gt 0 ] || [ "$FINAL_HIGH" -gt 0 ]; then
        echo -e "  ${RED}🚨 HIGH PRIORITY: $FINAL_CRITICAL critical + $FINAL_HIGH high vulnerabilities remain${NC}"
        echo ""
        echo "  Recommended next steps:"
        echo "  1. Use npm overrides for transitive dependencies:"
        echo '     Add to package.json: "overrides": { "<pkg>": ">=<safe-version>" }'
        echo "  2. Check if direct dependency updates resolve them:"
        echo "     npm outdated"
        echo "  3. For Angular packages, use ng update:"
        echo "     ng update @angular/core @angular/cli"
        echo "  4. Invoke the Security Fixer agent for manual analysis:"
        echo "     /security-fixer Fix remaining high and critical vulnerabilities"
    else
        echo -e "  ${YELLOW}ℹ️  Only moderate/low vulnerabilities remain${NC}"
        echo "  These are lower priority and may be dev-only false positives."
        echo "  Run: npm audit --omit=dev"
        echo "  to check if they affect production."
    fi
else
    echo -e "  ${GREEN}✅ ALL VULNERABILITIES RESOLVED!${NC}"
fi

echo ""
echo "=============================================================="

# Exit code based on remaining critical/high vulnerabilities
if [ "$FINAL_CRITICAL" -gt 0 ]; then
    echo -e "${RED}EXIT: Critical vulnerabilities remain. Manual intervention required.${NC}"
    exit 2
elif [ "$FINAL_HIGH" -gt 0 ]; then
    echo -e "${YELLOW}EXIT: High vulnerabilities remain. Review recommended.${NC}"
    exit 1
elif [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}EXIT: Verification errors detected. Build may be broken.${NC}"
    exit 1
else
    echo -e "${GREEN}EXIT: Security posture acceptable.${NC}"
    exit 0
fi
