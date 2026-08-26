---
trigger: always_on
description: Core Angular 18 standards and architectural patterns for rzume_web
---

# Angular 18 Core Standards

## TypeScript Standards
- **Strict Mode**: Always maintain TypeScript strict mode enabled
- **Type Safety**: Avoid `any` type; use `unknown` when type is uncertain
- **Type Inference**: Prefer type inference when obvious, explicit types for public APIs
- **Null Safety**: Use optional chaining (`?.`) and nullish coalescing (`??`)

## Angular Architecture Patterns

### Standalone Components (Required)
- **Always use standalone components** - no NgModules
- Do NOT set `standalone: true` in decorators (default in Angular 18+)
- Import dependencies directly in component metadata

### Change Detection Strategy
- **Always use `ChangeDetectionStrategy.OnPush`** for all components
- Trigger change detection manually with `ChangeDetectorRef` when needed
- Use signals or immutable data patterns

### Component Structure
```typescript
@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [/* dependencies */],
  templateUrl: './component-name.component.html',
  styleUrl: './component-name.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Dependency Injection
- **Use `inject()` function** instead of constructor injection
- Place `inject()` calls at the top of the class
- Use `providedIn: 'root'` for singleton services

### State Management
- Use **BehaviorSubject** pattern for service-based state
- Apply `shareReplay({ bufferSize: 1, refCount: true })` for performance
- Implement proper subscription cleanup with `takeUntil` pattern

### Template Syntax
- **Use modern control flow**: `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use `@for` with `track` for performance: `@for (item of items; track item.id)`
- Avoid complex logic in templates

### Semantic HTML (Required)
- **Prefer semantic elements** over generic `<div>` and `<span>` at all times
- Use `<ng-container>` when a structural wrapper is needed without adding a DOM node
- Use `<ng-template>` for reusable template fragments
- **Element selection guide**:
  - Page regions: `<main>`, `<header>`, `<footer>`, `<nav>`, `<aside>`
  - Content grouping: `<section>` (with heading), `<article>` (self-contained), `<figure>`/`<figcaption>`
  - Lists: `<ul>`/`<ol>`/`<li>` instead of `<div>`-based lists
  - Text content: `<p>`, `<h1>`–`<h6>`, `<time>`, `<address>`, `<blockquote>`
  - Interactive: `<button>` for actions (never `<div (click)>`), `<a>` for navigation
  - Forms: `<form>`, `<fieldset>`, `<legend>`, `<label>`, `<input>`, `<select>`, `<textarea>`
  - Tables: `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>`, `<caption>`
  - `<div>` / `<span>` **only** as a last resort for purely presentational wrappers with no semantic meaning

### Accessibility (Required)
- All interactive elements must have an accessible name via visible text, `aria-label`, or `aria-labelledby`
- Icon-only buttons must include `aria-label`
- Dynamic content regions use `aria-live="polite"` (or `"assertive"` for urgent updates)
- Form controls must be linked to `<label>` via `for`/`id` or `aria-labelledby`
- Use `role` only when no native semantic element exists for the purpose
- Provide `alt` text for all `<img>` elements; decorative images use `alt=""`

### Forms
- **Prefer Reactive Forms** over Template-driven forms
- Use `ControlValueAccessor` for custom form components
- Implement proper form validation with typed FormGroups

### Styling
- Use **class bindings** instead of `ngClass`
- Use **style bindings** instead of `ngStyle`
- Follow mobile-first responsive design (breakpoints: 599px, 950px)

## Subscription Management

### Required Pattern
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {});
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## File Organization
- Components: One component per file
- Services: Group related functionality
- Models: Separate interfaces, enums, and constants
- Helpers: Pure utility functions

## Naming Conventions
- Components: `component-name.component.ts`
- Services: `service-name.service.ts`
- Models: `model-name.models.ts`
- Constants: `feature-name.constants.ts`
- Enums: `feature-name.enums.ts`

## Performance Requirements
- Lazy load feature routes
- Use OnPush change detection
- Implement trackBy for *ngFor loops
- Optimize bundle size (max 500KB initial)

## Testing Requirements
- Write unit tests for all new components and services
- Use Jasmine + Karma for unit tests
- Mock services properly in tests
- Test form validation and error states
- Maintain test coverage above 80%
