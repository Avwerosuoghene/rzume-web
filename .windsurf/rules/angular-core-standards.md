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
