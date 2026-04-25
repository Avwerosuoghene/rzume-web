#!/bin/bash

# Security and Vulnerability Scanning Script
# Used by Quality Gate Agent for security validation

set -e

echo "🔒 Starting Security & Vulnerability Scan..."
echo "=============================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SECURITY_ISSUES=0

# 1. NPM Audit
echo ""
echo "📦 Running NPM Security Audit..."
if npm audit --json > npm-audit-report.json 2>&1; then
    echo -e "${GREEN}✅ No vulnerabilities found${NC}"
else
    CRITICAL=$(cat npm-audit-report.json | grep -o '"critical":[0-9]*' | cut -d':' -f2 || echo "0")
    HIGH=$(cat npm-audit-report.json | grep -o '"high":[0-9]*' | cut -d':' -f2 || echo "0")
    MODERATE=$(cat npm-audit-report.json | grep -o '"moderate":[0-9]*' | cut -d':' -f2 || echo "0")
    
    echo -e "${YELLOW}⚠️  Vulnerabilities found:${NC}"
    echo "   Critical: $CRITICAL"
    echo "   High: $HIGH"
    echo "   Moderate: $MODERATE"
    
    if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
        SECURITY_ISSUES=1
        echo -e "${RED}❌ Critical or High vulnerabilities must be fixed${NC}"
    fi
fi

# 2. Check for hardcoded secrets
echo ""
echo "🔑 Scanning for hardcoded secrets..."
SECRET_PATTERNS=(
    "password\s*=\s*['\"][^'\"]+['\"]"
    "api[_-]?key\s*=\s*['\"][^'\"]+['\"]"
    "secret\s*=\s*['\"][^'\"]+['\"]"
    "token\s*=\s*['\"][^'\"]+['\"]"
    "private[_-]?key\s*=\s*['\"][^'\"]+['\"]"
)

SECRETS_FOUND=0
for pattern in "${SECRET_PATTERNS[@]}"; do
    MATCHES=$(grep -rE "$pattern" src/ --include="*.ts" --include="*.js" | grep -v "\.spec\.ts" | wc -l | xargs)
    if [ "$MATCHES" -gt 0 ]; then
        echo -e "${RED}⚠️  Found potential hardcoded secrets matching: $pattern${NC}"
        grep -rE "$pattern" src/ --include="*.ts" --include="*.js" | grep -v "\.spec\.ts" | head -5
        SECRETS_FOUND=$((SECRETS_FOUND + MATCHES))
        SECURITY_ISSUES=1
    fi
done

if [ "$SECRETS_FOUND" -eq 0 ]; then
    echo -e "${GREEN}✅ No hardcoded secrets detected${NC}"
fi

# 3. Check for unsafe innerHTML usage
echo ""
echo "🔍 Checking for unsafe innerHTML usage..."
INNERHTML_COUNT=$(grep -r "innerHTML" src/ --include="*.ts" --include="*.html" | wc -l | xargs)
if [ "$INNERHTML_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $INNERHTML_COUNT innerHTML usages (potential XSS risk)${NC}"
    grep -r "innerHTML" src/ --include="*.ts" --include="*.html" | head -5
    SECURITY_ISSUES=1
else
    echo -e "${GREEN}✅ No unsafe innerHTML usage found${NC}"
fi

# 4. Check for eval() usage
echo ""
echo "🔍 Checking for eval() usage..."
EVAL_COUNT=$(grep -r "eval(" src/ --include="*.ts" --include="*.js" | grep -v "\.spec\.ts" | wc -l | xargs)
if [ "$EVAL_COUNT" -gt 0 ]; then
    echo -e "${RED}❌ Found eval() usage (critical security risk)${NC}"
    grep -r "eval(" src/ --include="*.ts" --include="*.js" | grep -v "\.spec\.ts"
    SECURITY_ISSUES=1
else
    echo -e "${GREEN}✅ No eval() usage found${NC}"
fi

# 5. Check for HTTP URLs (should use HTTPS)
echo ""
echo "🔍 Checking for insecure HTTP URLs..."
HTTP_COUNT=$(grep -r "http://" src/ --include="*.ts" --include="*.html" | grep -v "localhost" | grep -v "127.0.0.1" | wc -l | xargs)
if [ "$HTTP_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $HTTP_COUNT insecure HTTP URLs${NC}"
    grep -r "http://" src/ --include="*.ts" --include="*.html" | grep -v "localhost" | grep -v "127.0.0.1" | head -5
    SECURITY_ISSUES=1
else
    echo -e "${GREEN}✅ No insecure HTTP URLs found${NC}"
fi

# 6. Check for localStorage usage without encryption
echo ""
echo "🔍 Checking localStorage usage..."
LOCALSTORAGE_COUNT=$(grep -r "localStorage\." src/ --include="*.ts" | grep -v "\.spec\.ts" | wc -l | xargs)
if [ "$LOCALSTORAGE_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $LOCALSTORAGE_COUNT localStorage usages (ensure sensitive data is encrypted)${NC}"
    grep -r "localStorage\." src/ --include="*.ts" | grep -v "\.spec\.ts" | head -5
else
    echo -e "${GREEN}✅ No direct localStorage usage found${NC}"
fi

# 7. Check for SQL injection patterns (if using raw queries)
echo ""
echo "🔍 Checking for potential SQL injection patterns..."
SQL_PATTERNS=$(grep -rE "query.*\+.*|execute.*\+.*" src/ --include="*.ts" | grep -v "\.spec\.ts" | wc -l | xargs)
if [ "$SQL_PATTERNS" -gt 0 ]; then
    echo -e "${RED}⚠️  Found potential SQL injection patterns${NC}"
    grep -rE "query.*\+.*|execute.*\+.*" src/ --include="*.ts" | grep -v "\.spec\.ts" | head -5
    SECURITY_ISSUES=1
else
    echo -e "${GREEN}✅ No SQL injection patterns detected${NC}"
fi

# 8. Check for missing input validation
echo ""
echo "🔍 Checking for input validation patterns..."
VALIDATORS_COUNT=$(grep -r "Validators\." src/ --include="*.ts" | wc -l | xargs)
FORMS_COUNT=$(grep -r "FormGroup\|FormControl" src/ --include="*.ts" | wc -l | xargs)
echo "📊 Forms: $FORMS_COUNT, Validators: $VALIDATORS_COUNT"
if [ "$FORMS_COUNT" -gt 0 ] && [ "$VALIDATORS_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Forms found without validators${NC}"
    SECURITY_ISSUES=1
else
    echo -e "${GREEN}✅ Input validation appears implemented${NC}"
fi

# 9. Check Angular security best practices
echo ""
echo "🔍 Checking Angular security best practices..."

# Check for DomSanitizer usage
SANITIZER_COUNT=$(grep -r "DomSanitizer" src/ --include="*.ts" | wc -l | xargs)
BYPASS_COUNT=$(grep -r "bypassSecurityTrust" src/ --include="*.ts" | wc -l | xargs)

if [ "$BYPASS_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $BYPASS_COUNT security bypass usages (review carefully)${NC}"
    grep -r "bypassSecurityTrust" src/ --include="*.ts" | head -5
    SECURITY_ISSUES=1
else
    echo -e "${GREEN}✅ No security bypasses found${NC}"
fi

# 10. Check for outdated dependencies
echo ""
echo "📦 Checking for outdated dependencies..."
if command -v npm-check-updates &> /dev/null; then
    ncu --jsonUpgraded > outdated-deps.json 2>&1 || true
    OUTDATED_COUNT=$(cat outdated-deps.json | grep -c "\"" || echo "0")
    if [ "$OUTDATED_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $OUTDATED_COUNT outdated dependencies${NC}"
        echo "Run 'npm-check-updates' for details"
    else
        echo -e "${GREEN}✅ All dependencies up to date${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  npm-check-updates not installed. Run: npm install -g npm-check-updates${NC}"
fi

# Summary
echo ""
echo "=============================================="
echo "🔒 Security Scan Summary"
echo "=============================================="

if [ $SECURITY_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ NO CRITICAL SECURITY ISSUES FOUND${NC}"
    exit 0
else
    echo -e "${RED}❌ SECURITY ISSUES DETECTED${NC}"
    echo "Please address the security concerns above."
    exit 1
fi
