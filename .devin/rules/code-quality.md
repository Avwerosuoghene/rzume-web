---
trigger: model_decision
description: Code quality standards, anti-patterns to avoid, and best practices
---

# Code Quality Standards

## Anti-Patterns to Avoid

### TypeScript
- ❌ Never use `any` type
- ❌ No implicit returns in functions
- ❌ No unused variables or imports
- ❌ No `console.log` in production code
- ❌ No hardcoded values (use constants)

### Angular
- ❌ No default change detection (always use OnPush)
- ❌ No memory leaks (always unsubscribe)
- ❌ No direct DOM manipulation (use Renderer2)
- ❌ No business logic in templates
- ❌ No NgModules (use standalone components)
- ❌ No `@HostBinding`/`@HostListener` decorators (use `host` object)
- ❌ No `<div (click)="...">` — always use `<button>` for actions
- ❌ No `<div>` or `<span>` when a semantic element exists (`<section>`, `<article>`, `<ul>`, `<nav>`, `<header>`, `<main>`, etc.)
- ❌ No bare `<div>` wrappers for structural directives — use `<ng-container>` instead
- ❌ No icon-only buttons without `aria-label`
- ❌ No form inputs without an associated `<label>`

### Component Design
- ❌ No components over 300 lines
- ❌ No deeply nested components (max 3 levels)
- ❌ No tight coupling between components
- ❌ No duplicate code (DRY principle)

### State Management
- ❌ No shared mutable state
- ❌ No direct state mutation (use immutable patterns)
- ❌ No unmanaged subscriptions

## Required Practices

### Code Organization
- ✅ Single Responsibility Principle
- ✅ Separation of concerns
- ✅ Feature-based folder structure
- ✅ Barrel exports for clean imports

### Error Handling
- ✅ Try-catch blocks for async operations
- ✅ User-friendly error messages
- ✅ Proper error logging
- ✅ Graceful degradation

### Performance
- ✅ OnPush change detection
- ✅ Lazy loading for routes
- ✅ trackBy functions for lists
- ✅ Debounce user inputs
- ✅ Optimize images and assets

### Accessibility
- ✅ Semantic HTML elements over generic `<div>`/`<span>` at all times
- ✅ All interactive elements have accessible names (visible text, `aria-label`, or `aria-labelledby`)
- ✅ Icon-only buttons include `aria-label`; icons are `aria-hidden="true"`
- ✅ Dynamic content regions use `aria-live="polite"` (or `"assertive"` for critical updates)
- ✅ Form controls linked to `<label>` via `for`/`id` or `aria-labelledby`
- ✅ Use `role` only when no native HTML element serves the purpose
- ✅ All `<img>` elements have `alt` text; decorative images use `alt=""`
- ✅ Keyboard navigation support
- ✅ Color contrast compliance (WCAG AA)
- ✅ Focus management for modals and dynamic content

### Security
- ✅ Sanitize user inputs
- ✅ No sensitive data in localStorage
- ✅ HTTPS only in production
- ✅ Content Security Policy headers
- ✅ XSS prevention

## Code Review Checklist

### Before Committing
1. All tests pass
2. No TypeScript errors
3. No linting errors
4. Code is formatted
5. No commented-out code
6. Documentation updated
7. Bundle size checked

### Component Checklist
- [ ] Uses OnPush change detection
- [ ] Implements OnDestroy with cleanup
- [ ] Has unit tests
- [ ] Follows naming conventions
- [ ] No magic numbers/strings
- [ ] Proper error handling
- [ ] Uses semantic HTML elements (no `<div>` for semantic content)
- [ ] No `<div (click)>` — uses `<button>` for actions, `<a>` for navigation
- [ ] `<ng-container>` used instead of wrapper `<div>` for structural directives
- [ ] All interactive elements have accessible names
- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs linked to `<label>` elements

### Service Checklist
- [ ] Single responsibility
- [ ] Proper dependency injection
- [ ] Error handling implemented
- [ ] Observable cleanup handled
- [ ] Unit tests written
- [ ] No side effects in constructors

## Documentation Standards

### Component Documentation
```typescript
/**
 * Displays job application statistics with filtering capabilities.
 * 
 * @example
 * <app-job-stats [stats]="statistics" (filterChange)="onFilter($event)"></app-job-stats>
 */
```

### Service Documentation
```typescript
/**
 * Manages job application state across the application.
 * Uses BehaviorSubject pattern for reactive state updates.
 */
```

### Complex Logic
- Add inline comments for non-obvious code
- Explain "why" not "what"
- Document edge cases

## Import Organization

### Order
1. Angular core imports
2. Angular common imports
3. Third-party libraries
4. Application core imports
5. Application feature imports
6. Relative imports

### Example
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { AngularMaterialModules } from '@core/modules';
import { AuthenticationService } from '@core/services';
import { UserProfile } from './models';
```

## Variable Naming

### Conventions
- **Components**: PascalCase (e.g., `DashboardComponent`)
- **Services**: PascalCase with Service suffix (e.g., `ApiService`)
- **Variables**: camelCase (e.g., `userData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Interfaces**: PascalCase with descriptive name (e.g., `JobApplication`)
- **Enums**: PascalCase (e.g., `ApplicationStatus`)
- **Observables**: Suffix with `$` (e.g., `user$`)
- **Private members**: Prefix with `_` or use `private` keyword

### Boolean Variables
- Prefix with `is`, `has`, `should`, `can`
- Examples: `isLoading`, `hasError`, `shouldDisplay`, `canEdit`

## Function Design

### Best Practices
- Keep functions small (max 20 lines)
- Single responsibility
- Descriptive names (verb + noun)
- Max 3 parameters (use object for more)
- Return early for error conditions
- Pure functions when possible

### Example
```typescript
// Good
getUserById(id: string): Observable<User> {
  if (!id) {
    return throwError(() => new Error('User ID is required'));
  }
  return this.api.get<User>(`/users/${id}`);
}

// Bad
getUser(id: string, includeProfile?: boolean, includeJobs?: boolean, format?: string) {
  // Too many parameters, unclear purpose
}
```

## Comments

### When to Comment
- Complex algorithms
- Business logic requirements
- Workarounds for bugs
- Performance optimizations
- Non-obvious decisions

### When NOT to Comment
- Obvious code
- Redundant information
- Outdated comments
- Commented-out code (delete it)
