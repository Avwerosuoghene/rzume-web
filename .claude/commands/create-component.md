# Create Angular Component

Generate a complete Angular component following Rzume project standards.

## Step 1 — Determine type

Ask (or infer from context):
- **Page component** (smart/container) → `src/app/pages/<feature>/`
  - Handles routing, orchestrates services, owns state
- **Presentation component** (dumb) → `src/app/components/<name>/`
  - Pure UI: @Input/@Output only, no service dependencies

## Step 2 — Generate the four files

### `component-name.component.ts`
```typescript
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-component-name',
  imports: [/* add dependencies */],
  templateUrl: './component-name.component.html',
  styleUrl: './component-name.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentNameComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  // private someService = inject(SomeService);

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**For presentation components**, add `@Input` / `@Output` instead of service injection:
```typescript
@Input({ required: true }) data!: DataType;
@Output() action = new EventEmitter<DataType>();
```

**For form components** (`ControlValueAccessor`):
```typescript
providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomInputComponent), multi: true }]
```

### `component-name.component.html`
```html
<!-- Use semantic HTML — never <div> for buttons, lists, or page regions -->
<section class="component-container" aria-labelledby="component-heading">
  <h2 id="component-heading" class="visually-hidden">Section Title</h2>

  @if (isLoading) {
    <p aria-live="polite">Loading...</p>
  } @else if (hasError) {
    <p role="alert">{{ errorMessage }}</p>
  } @else {
    <ng-container>
      <!-- content here -->
    </ng-container>
  }
</section>
```

Rules:
- `@if` / `@for` / `@switch` — never `*ngIf` / `*ngFor`
- `@for` always includes `track item.id`
- Lists → `<ul>` + `<li>`, never `<div>` lists
- Actions → `<button type="button">`, never `<div (click)>`
- Icon-only buttons → `aria-label="..."` + `<mat-icon aria-hidden="true">`
- `<ng-container>` for structural wrappers that add no DOM node

### `component-name.component.scss`
```scss
@import 'src/app/styles/variables';
@import 'src/app/styles/fonts';

:host {
  display: block;
  padding: $spacing-md;
}

.component-container {
  // Mobile (default)

  @media (min-width: 599px) {
    // Tablet
  }

  @media (min-width: 950px) {
    // Desktop
  }
}
```

### `component-name.component.spec.ts`
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentNameComponent } from './component-name.component';

describe('ComponentNameComponent', () => {
  let component: ComponentNameComponent;
  let fixture: ComponentFixture<ComponentNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentNameComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentNameComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should cleanup subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    component.ngOnDestroy();
    expect(component['destroy$'].next).toHaveBeenCalled();
  });
});
```

## Step 3 — Barrel export

Add the component to the nearest `index.ts`:
```typescript
export { ComponentNameComponent } from './component-name/component-name.component';
```

## Completion Checklist
- [ ] Standalone (no NgModule)
- [ ] `ChangeDetectionStrategy.OnPush`
- [ ] `ngOnDestroy` with `destroy$.next()` + `destroy$.complete()`
- [ ] Modern control flow (`@if`, `@for`, `@switch`)
- [ ] Semantic HTML — no `<div>` for buttons, lists, or regions
- [ ] `<ng-container>` for structural wrappers
- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs linked to `<label>`
- [ ] Mobile-first SCSS using theme variables
- [ ] Unit tests created
- [ ] Exported via `index.ts`
