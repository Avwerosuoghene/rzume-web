# Code Review — Security & Quality Analysis

Perform an enterprise-grade code review of the specified files or the current diff. Focus on security vulnerabilities, bugs, performance, and Angular best practices.

## Review Scope

Ask (or infer from context) what to review:
- Specific files/components
- Current branch diff (`git diff main...HEAD`)
- A specific PR

## Phase 1 — Security Analysis (OWASP Top 10)

### A03 — Injection / XSS
- [ ] No `[innerHTML]` binding without `DomSanitizer.sanitize(SecurityContext.HTML, ...)`
- [ ] No `bypassSecurityTrust*` without explicit documented justification
- [ ] No direct DOM manipulation (`element.innerHTML = ...`) — use `Renderer2`
- [ ] Template interpolation `{{ value }}` used for user content (auto-escaped)

### A02 — Cryptographic / Data Exposure
- [ ] No sensitive data in `localStorage` (tokens → `sessionStorage`)
- [ ] No hardcoded API keys, secrets, or credentials
- [ ] No passwords or tokens in console logs

### A01 — Access Control
- [ ] Route guards applied to all protected routes
- [ ] No client-side-only authorization decisions (server must validate too)

### A07 — Authentication
- [ ] JWT tokens not exposed beyond what is needed
- [ ] Session timeout handled

### A06 — Vulnerable Dependencies
Run: `npm audit` — flag any high/critical vulnerabilities in production deps.

## Phase 2 — Bug Detection

### Null / Undefined Handling
```typescript
// ❌ BAD
return user.profile.name;
// ✅ GOOD
return user?.profile?.name ?? 'Unknown';
```

### Subscription Leaks
- [ ] Every `subscribe()` is paired with `takeUntil(this.destroy$)` or uses `async` pipe
- [ ] `ngOnDestroy` calls `destroy$.next()` and `destroy$.complete()`

### Race Conditions
- [ ] Search inputs use `switchMap` + `debounceTime`, not plain `subscribe`
- [ ] Concurrent requests handled correctly

### Error Handling
- [ ] All HTTP calls have `catchError`
- [ ] Async operations have try/catch or `.pipe(catchError(...))`

## Phase 3 — Angular Patterns

- [ ] Standalone components (no NgModules)
- [ ] `ChangeDetectionStrategy.OnPush` on every component
- [ ] `inject()` — not constructor injection
- [ ] `@if` / `@for` / `@switch` — not `*ngIf` / `*ngFor`
- [ ] `@for` has `track item.id`
- [ ] No `@HostBinding` / `@HostListener` (use `host` object)

## Phase 4 — Semantic HTML & Accessibility

```html
<!-- ❌ BAD -->
<div (click)="onEdit()">Edit</div>
<div class="list"><div *ngFor="let i of items">{{ i }}</div></div>

<!-- ✅ GOOD -->
<button type="button" (click)="onEdit()">Edit</button>
<ul><li *ngFor="let i of items">{{ i }}</li></ul>

<!-- ❌ BAD: icon button missing aria-label -->
<button (click)="onDelete()"><mat-icon>delete</mat-icon></button>

<!-- ✅ GOOD -->
<button type="button" (click)="onDelete()" aria-label="Delete item">
  <mat-icon aria-hidden="true">delete</mat-icon>
</button>
```

- [ ] No `<div (click)>` — always `<button>` for actions
- [ ] No `<div>` lists — always `<ul>/<ol>` + `<li>`
- [ ] No `<div class="header/nav/footer">` — use semantic tags
- [ ] `<ng-container>` used for structural wrappers without DOM output
- [ ] All icon-only buttons have `aria-label`
- [ ] All form inputs linked to `<label>`
- [ ] Dynamic regions use `aria-live`

## Phase 5 — Performance

- [ ] No function calls in templates (use computed properties or pipes)
- [ ] `shareReplay({ bufferSize: 1, refCount: true })` on shared observables
- [ ] No default change detection
- [ ] `track` in every `@for`
- [ ] Lazy loading on routes

## Phase 6 — Code Quality

- [ ] No `any` types
- [ ] Functions ≤ 20 lines, classes ≤ 300 lines
- [ ] No deep nesting (> 3 levels — use early returns)
- [ ] Named constants for magic values
- [ ] No duplicate code (DRY)
- [ ] No commented-out code blocks

## Report Format

```markdown
# Code Review Report

## Status: ✅ Approved / ⚠️ Approved with Comments / ❌ Changes Required

## Critical Issues (must fix)
### 🔒 SECURITY: [Severity] — [Title]
- **File**: `path/to/file.ts:42`
- **Issue**: [Description]
- **Risk**: [Impact]
- **Fix**:
  ```typescript
  // recommended code
  ```

## High Priority (should fix)
### 🐛 BUG: [Title]
- **File**: `path/to/file.ts:87`
- **Issue**: [Description]
- **Fix**: [Code or description]

### ⚡ PERFORMANCE: [Title]
- [Issue and fix]

## Low Priority (nice to have)
### 📝 CODE QUALITY: [Title]
- [Issue and suggestion]

## Positive Observations
- ✅ [What was done well]

## Security Checklist
- [ ] No XSS vectors
- [ ] No hardcoded secrets
- [ ] Auth guards in place
- [ ] No sensitive data in localStorage
- [ ] Dependencies audited
```
