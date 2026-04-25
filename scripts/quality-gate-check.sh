#!/bin/bash

# Quality Gate Automated Validation Script
# This script runs all automated quality checks for the quality gate agent

set -e  # Exit on error

echo "🚀 Starting Quality Gate Automated Checks..."
echo "=============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
OVERALL_STATUS=0

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2 PASSED${NC}"
    else
        echo -e "${RED}❌ $2 FAILED${NC}"
        OVERALL_STATUS=1
    fi
}

# 1. TypeScript Type Checking
echo ""
echo "📝 Running TypeScript Type Checking..."
if npm run type-check 2>&1; then
    print_status 0 "Type Checking"
else
    print_status 1 "Type Checking"
fi

# 2. Linting
echo ""
echo "🔍 Running ESLint..."
if npm run lint 2>&1; then
    print_status 0 "Linting"
else
    print_status 1 "Linting"
fi

# 3. Unit Tests with Coverage
echo ""
echo "🧪 Running Unit Tests with Coverage..."
if npm run test:coverage -- --watch=false --browsers=ChromeHeadless 2>&1; then
    print_status 0 "Unit Tests"
    
    # Check coverage threshold (80%)
    echo "📊 Checking Code Coverage Threshold..."
    COVERAGE_FILE="coverage/rzume-web/coverage-summary.json"
    if [ -f "$COVERAGE_FILE" ]; then
        COVERAGE=$(node -pe "JSON.parse(require('fs').readFileSync('$COVERAGE_FILE')).total.lines.pct")
        if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
            echo -e "${GREEN}✅ Coverage: $COVERAGE% (Threshold: 80%)${NC}"
        else
            echo -e "${YELLOW}⚠️  Coverage: $COVERAGE% (Below 80% threshold)${NC}"
            OVERALL_STATUS=1
        fi
    else
        echo -e "${YELLOW}⚠️  Coverage file not found${NC}"
    fi
else
    print_status 1 "Unit Tests"
fi

# 4. Security Audit
echo ""
echo "🔒 Running Security Audit..."
if npm audit --audit-level=moderate 2>&1; then
    print_status 0 "Security Audit"
else
    echo -e "${YELLOW}⚠️  Security vulnerabilities found. Review npm audit output.${NC}"
    OVERALL_STATUS=1
fi

# 5. Bundle Size Check
echo ""
echo "📦 Checking Bundle Size..."
if npm run build:prod 2>&1; then
    print_status 0 "Production Build"
    
    # Check main bundle size (should be < 500KB)
    MAIN_BUNDLE=$(find dist/rzume-web/browser -name "main*.js" -exec ls -lh {} \; | awk '{print $5}')
    echo "📊 Main Bundle Size: $MAIN_BUNDLE"
    
    # Get size in KB
    BUNDLE_SIZE_KB=$(find dist/rzume-web/browser -name "main*.js" -exec stat -f%z {} \; | awk '{print int($1/1024)}')
    if [ "$BUNDLE_SIZE_KB" -lt 500 ]; then
        echo -e "${GREEN}✅ Bundle size within limits (<500KB)${NC}"
    else
        echo -e "${YELLOW}⚠️  Bundle size exceeds 500KB threshold${NC}"
        OVERALL_STATUS=1
    fi
else
    print_status 1 "Production Build"
fi

# 6. Check for TODO/FIXME comments
echo ""
echo "📝 Checking for TODO/FIXME comments..."
TODO_COUNT=$(grep -r "TODO\|FIXME" src/ --include="*.ts" --include="*.html" --include="*.scss" | wc -l | xargs)
if [ "$TODO_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $TODO_COUNT TODO/FIXME comments${NC}"
    grep -r "TODO\|FIXME" src/ --include="*.ts" --include="*.html" --include="*.scss" | head -10
else
    echo -e "${GREEN}✅ No TODO/FIXME comments found${NC}"
fi

# 7. Check for console.log statements
echo ""
echo "🔍 Checking for console.log statements..."
CONSOLE_COUNT=$(grep -r "console\.log" src/ --include="*.ts" | grep -v "\.spec\.ts" | wc -l | xargs)
if [ "$CONSOLE_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $CONSOLE_COUNT console.log statements${NC}"
    grep -r "console\.log" src/ --include="*.ts" | grep -v "\.spec\.ts" | head -10
    OVERALL_STATUS=1
else
    echo -e "${GREEN}✅ No console.log statements found${NC}"
fi

# 8. Check for 'any' type usage
echo ""
echo "🔍 Checking for 'any' type usage..."
ANY_COUNT=$(grep -r ": any" src/ --include="*.ts" | grep -v "\.spec\.ts" | wc -l | xargs)
if [ "$ANY_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $ANY_COUNT 'any' type usages${NC}"
    grep -r ": any" src/ --include="*.ts" | grep -v "\.spec\.ts" | head -10
    OVERALL_STATUS=1
else
    echo -e "${GREEN}✅ No 'any' type usages found${NC}"
fi

# 9. Check for proper OnPush change detection
echo ""
echo "🔍 Checking OnPush change detection strategy..."
COMPONENTS_WITHOUT_ONPUSH=$(grep -r "@Component" src/ --include="*.ts" -A 5 | grep -v "changeDetection: ChangeDetectionStrategy.OnPush" | grep "@Component" | wc -l | xargs)
if [ "$COMPONENTS_WITHOUT_ONPUSH" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found components without OnPush strategy${NC}"
    OVERALL_STATUS=1
else
    echo -e "${GREEN}✅ All components use OnPush change detection${NC}"
fi

# 10. Check for proper subscription cleanup
echo ""
echo "🔍 Checking for proper subscription cleanup..."
COMPONENTS_WITH_SUBSCRIBE=$(grep -r "\.subscribe(" src/ --include="*.ts" | grep -v "\.spec\.ts" | wc -l | xargs)
COMPONENTS_WITH_TAKEUNTIL=$(grep -r "takeUntil" src/ --include="*.ts" | grep -v "\.spec\.ts" | wc -l | xargs)
echo "📊 Subscriptions: $COMPONENTS_WITH_SUBSCRIBE, TakeUntil usage: $COMPONENTS_WITH_TAKEUNTIL"
if [ "$COMPONENTS_WITH_SUBSCRIBE" -gt "$COMPONENTS_WITH_TAKEUNTIL" ]; then
    echo -e "${YELLOW}⚠️  Potential missing subscription cleanup${NC}"
else
    echo -e "${GREEN}✅ Subscription cleanup appears proper${NC}"
fi

# Summary
echo ""
echo "=============================================="
echo "📊 Quality Gate Check Summary"
echo "=============================================="

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo "Solution is ready for manual review."
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    echo "Please address the issues above before proceeding."
    exit 1
fi
