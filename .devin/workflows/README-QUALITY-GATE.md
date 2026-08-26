# Quality Gate Agent - Quick Reference

## What is the Quality Gate Agent?

A senior architect validation checkpoint that reviews and approves/rejects solutions from other agents before implementation.

## When to Use

**All agents should request quality gate review before completing their tasks.**

## How to Request Review

```
@quality-gate Please review my [feature/fix description]

**Changes Made:**
- File 1: Description
- File 2: Description

**Testing Done:**
- Unit tests: [coverage %]
- E2E tests: [scenarios]
- Manual testing: [devices]

**Potential Concerns:**
- [Any concerns or edge cases]
```

## Quick Commands

### Run Full Quality Gate Check
```bash
npm run quality-gate:full
```

### Run Quick Automated Validation
```bash
npm run quality-gate:automated
```

### Run Security Scan
```bash
npm run security:scan
```

### Individual Checks
```bash
npm run type-check        # TypeScript validation
npm run lint              # ESLint
npm run test:coverage     # Tests with coverage
npm run security:audit    # NPM security audit
```

## Possible Outcomes

### ✅ APPROVED
- All criteria met
- Ready for implementation
- Proceed with merge

### ⚠️ APPROVED WITH CONDITIONS
- Minor improvements needed
- Implement conditions before merge
- Non-blocking issues

### ❌ REJECTED
- Critical issues found
- Rework required
- Resubmit after fixes

## What Gets Checked

### Automated
- TypeScript type checking
- ESLint validation
- Unit test coverage (>80%)
- Security vulnerabilities
- Bundle size (<500KB)
- Code patterns (console.log, any types)
- Subscription cleanup

### Manual
- Architecture alignment
- Edge case handling
- Security review
- Performance impact
- Accessibility
- Documentation

## Integration in Workflows

All workflows include quality gate checkpoints:
- `/add-feature` - Before feature completion
- `/angular-implement` - Before finalization
- `/tester` - After test implementation
- `/create-component` - Before component approval
- `/create-service` - Before service approval

## Files and Documentation

- **Main Workflow**: `.windsurf/workflows/quality-gate.md`
- **Checklist**: `.windsurf/workflows/quality-gate-checklist.md`
- **Documentation**: `docs/QUALITY-GATE-SYSTEM.md`
- **Scripts**: `scripts/quality-gate-check.sh`, `scripts/security-scan.sh`

## Best Practices

### Before Submitting
1. Run local automated checks
2. Fix obvious issues
3. Document all changes
4. Test thoroughly
5. Identify edge cases yourself

### During Review
1. Respond to feedback promptly
2. Ask clarifying questions
3. Implement required changes
4. Resubmit if rejected

### After Approval
1. Proceed with implementation
2. Create PR with approval note
3. Final team code review

## Common Rejection Reasons

1. **Security Issues**
   - Hardcoded secrets
   - No input validation
   - Vulnerable dependencies

2. **Architecture Violations**
   - Not using OnPush
   - Missing subscription cleanup
   - Using deprecated patterns

3. **Insufficient Testing**
   - Coverage <80%
   - Missing edge cases
   - No E2E tests

4. **Performance Problems**
   - Bundle size too large
   - Memory leaks
   - Inefficient operations

5. **Edge Cases Not Handled**
   - Null/undefined scenarios
   - Network failures
   - Concurrent operations

## Tips for Success

- **Run automated checks first** - Fix issues before review
- **Document thoroughly** - Explain your decisions
- **Test edge cases** - Think about failure scenarios
- **Be proactive** - Address concerns before they're raised
- **Ask questions** - If unsure about something, ask

## Example Review Request

```
@quality-gate Please review my user authentication refactor

**Changes Made:**
- auth.service.ts: Refactored token handling with refresh logic
- auth.guard.ts: Added role-based access control
- login.component.ts: Improved error handling
- auth.service.spec.ts: Added comprehensive tests (92% coverage)

**Testing Done:**
- Unit tests: 92% coverage
- E2E tests: Login, logout, token refresh flows
- Manual testing: Mobile (iOS/Android), Desktop (Chrome/Firefox/Safari)
- Security: Tested XSS, CSRF protection

**Architecture Decisions:**
- Used BehaviorSubject for auth state (follows project pattern)
- Implemented automatic token refresh (prevents session expiration)
- Added role-based guards (supports future RBAC requirements)

**Edge Cases Handled:**
- Token expiration during API call (auto-refresh)
- Concurrent login attempts (debounced)
- Network failures (retry with exponential backoff)
- Invalid credentials (user-friendly error messages)

**Potential Concerns:**
- Token refresh logic adds complexity - please review for edge cases
- RBAC implementation is basic - may need enhancement for complex permissions
```

## Need Help?

- Read full documentation: `docs/QUALITY-GATE-SYSTEM.md`
- Check workflow: `.windsurf/workflows/quality-gate.md`
- Review checklist: `.windsurf/workflows/quality-gate-checklist.md`
