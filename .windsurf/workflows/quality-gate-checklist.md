---
description: Quality Gate Review Checklist Template
---

# Quality Gate Review Checklist

Use this checklist when conducting quality gate reviews.

## Submission Information

**Feature/Fix**: [Description]  
**Agent**: [Agent name that created the solution]  
**Date**: [Date]  
**Files Changed**: [List of files]

---

## 1. Automated Checks ✅

Run automated validation first:
```bash
npm run quality-gate:automated
```

- [ ] TypeScript type checking passes
- [ ] ESLint passes with no errors
- [ ] Unit tests pass with >80% coverage
- [ ] Security audit shows no critical/high vulnerabilities
- [ ] Production build succeeds
- [ ] Bundle size <500KB

**Automated Check Result**: ✅ PASS / ❌ FAIL

---

## 2. Architecture Review 🏗️

### Angular 18 Standards
- [ ] Uses standalone components (no NgModules)
- [ ] Uses `ChangeDetectionStrategy.OnPush`
- [ ] Uses `inject()` instead of constructor injection
- [ ] Uses modern control flow (`@if`, `@for`, `@switch`)
- [ ] No deprecated Angular patterns
- [ ] Follows service-based state management

### Component Structure
- [ ] Proper component classification (page/presentation/pure)
- [ ] Single responsibility principle
- [ ] Proper separation of concerns
- [ ] Reusable components where appropriate

### State Management
- [ ] Uses BehaviorSubject pattern correctly
- [ ] Implements `shareReplay` for performance
- [ ] Proper observable composition
- [ ] No unnecessary state duplication

**Architecture Score**: ⭐⭐⭐⭐⭐ (1-5 stars)

---

## 3. Code Quality Review 📝

### TypeScript Standards
- [ ] No `any` types used
- [ ] Strict mode compliance
- [ ] Proper type inference
- [ ] Null safety with `?.` and `??`
- [ ] Proper error typing

### Code Patterns
- [ ] No code duplication
- [ ] Proper abstraction levels
- [ ] Clear naming conventions
- [ ] Proper use of constants/enums
- [ ] No magic numbers/strings

### Memory Management
- [ ] Proper subscription cleanup (takeUntil pattern)
- [ ] `ngOnDestroy` implemented where needed
- [ ] No memory leaks
- [ ] Proper cleanup of timers/intervals
- [ ] Event listener cleanup

**Code Quality Score**: ⭐⭐⭐⭐⭐ (1-5 stars)

---

## 4. Security Review 🔒

### Input Validation
- [ ] All user inputs validated
- [ ] Form validators implemented
- [ ] Sanitization where needed
- [ ] No XSS vulnerabilities

### Authentication/Authorization
- [ ] Proper route guards
- [ ] Token handling secure
- [ ] No hardcoded credentials
- [ ] Proper session management

### Data Security
- [ ] No sensitive data in localStorage
- [ ] Proper encryption for sensitive data
- [ ] Secure API communication (HTTPS)
- [ ] No SQL injection risks

### Dependencies
- [ ] No vulnerable dependencies
- [ ] Dependencies up to date
- [ ] No unnecessary dependencies

**Security Score**: ⭐⭐⭐⭐⭐ (1-5 stars)

---

## 5. Performance Review ⚡

### Optimization
- [ ] Lazy loading implemented
- [ ] OnPush change detection used
- [ ] `trackBy` for `@for` loops
- [ ] Efficient RxJS operators
- [ ] No unnecessary re-renders

### Bundle Size
- [ ] Initial bundle <500KB
- [ ] Code splitting implemented
- [ ] Tree shaking effective
- [ ] No duplicate dependencies

### Runtime Performance
- [ ] No blocking operations
- [ ] Async operations handled properly
- [ ] Debouncing/throttling where needed
- [ ] Virtual scrolling for large lists

**Performance Score**: ⭐⭐⭐⭐⭐ (1-5 stars)

---

## 6. Testing Review 🧪

### Unit Tests
- [ ] All new code has unit tests
- [ ] Coverage >80%
- [ ] Tests are meaningful (not just coverage)
- [ ] Proper mocking
- [ ] Edge cases covered

### Integration Tests
- [ ] Service integration tested
- [ ] Component integration tested
- [ ] API integration tested

### E2E Tests
- [ ] Critical user flows tested
- [ ] Happy path covered
- [ ] Error scenarios covered

**Testing Score**: ⭐⭐⭐⭐⭐ (1-5 stars)

---

## 7. Edge Case Analysis 🎯

### Data Edge Cases
- [ ] Null/undefined handling
- [ ] Empty arrays/objects
- [ ] Large datasets (1000+ items)
- [ ] Special characters in strings
- [ ] Invalid data formats

### Network Edge Cases
- [ ] API failure handling
- [ ] Timeout handling
- [ ] Retry logic
- [ ] Offline scenarios
- [ ] Slow connections

### User Interaction Edge Cases
- [ ] Rapid clicking/double submission
- [ ] Concurrent operations
- [ ] Navigation during operations
- [ ] Browser back/forward
- [ ] Page refresh during operation

### Browser/Device Edge Cases
- [ ] Mobile responsiveness
- [ ] Touch interactions
- [ ] Different screen sizes
- [ ] Browser compatibility
- [ ] Accessibility (keyboard, screen readers)

**Edge Case Coverage**: ⭐⭐⭐⭐⭐ (1-5 stars)

---

## 8. Accessibility Review ♿

### WCAG 2.1 AA Compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Proper ARIA labels
- [ ] Sufficient color contrast
- [ ] Focus indicators visible
- [ ] No keyboard traps

### Semantic HTML
- [ ] Proper heading hierarchy
- [ ] Semantic elements used
- [ ] Form labels present
- [ ] Alt text for images

**Accessibility Score**: ⭐⭐⭐⭐⭐ (1-5 stars)

---

## 9. Documentation Review 📚

### Code Documentation
- [ ] Complex logic commented
- [ ] JSDoc for public APIs
- [ ] README updated if needed
- [ ] No outdated comments

### Architecture Documentation
- [ ] ADRs created for major decisions
- [ ] Component documentation
- [ ] Service documentation
- [ ] API documentation

**Documentation Score**: ⭐⭐⭐⭐⭐ (1-5 stars)

---

## 10. Devil's Advocate Questions 😈

Ask these critical questions:

1. **What happens if this fails?**
   - Answer: 

2. **What's the worst-case scenario?**
   - Answer: 

3. **How will this scale?**
   - Answer: 

4. **What assumptions are being made?**
   - Answer: 

5. **What could a malicious user do?**
   - Answer: 

6. **What if the API changes?**
   - Answer: 

7. **What if this runs on a slow device?**
   - Answer: 

8. **What if the user has a disability?**
   - Answer: 

9. **What technical debt is being introduced?**
   - Answer: 

10. **What will maintenance look like in 6 months?**
    - Answer: 

---

## Final Decision

### Overall Score
**Total Score**: ___/50 stars

**Grade**:
- 45-50 stars: Excellent ✅
- 40-44 stars: Good (minor improvements) ⚠️
- 35-39 stars: Acceptable (conditions apply) ⚠️
- <35 stars: Needs rework ❌

### Critical Issues Found
1. 
2. 
3. 

### Recommended Improvements
1. 
2. 
3. 

### Decision

**[ ] ✅ APPROVED**
- All criteria met
- No critical issues
- Ready for implementation

**[ ] ⚠️ APPROVED WITH CONDITIONS**
- Minor issues identified
- Conditions listed above
- Implement conditions before merge

**[ ] ❌ REJECTED**
- Critical issues found
- Rework required
- Resubmit after fixes

---

## Reviewer Notes

**Reviewer**: [Quality Gate Agent]  
**Review Date**: [Date]  
**Time Spent**: [Duration]

**Additional Comments**:


---

## Next Steps

**For Approved Solutions**:
1. Proceed with implementation
2. Create PR with quality gate approval
3. Final code review by team

**For Conditional Approvals**:
1. Implement required changes
2. Update documentation
3. Notify quality gate agent when ready

**For Rejected Solutions**:
1. Review critical issues
2. Rework solution
3. Resubmit for quality gate review
4. Schedule follow-up review
