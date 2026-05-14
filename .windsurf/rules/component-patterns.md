---
trigger: glob
globs: ["**/*.component.ts", "**/*.component.html", "**/*.component.scss"]
description: Component development patterns and best practices
---

# Component Development Patterns

## Component Types

### Page Components (Smart/Container)
Located in `src/app/pages/`

**Responsibilities:**
- Route handling and navigation
- State management coordination
- Service orchestration
- Layout composition
- Child component coordination

**Pattern:**
```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [/* child components, services */],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  private service = inject(DataService);
  
  data$ = this.service.getData().pipe(
    takeUntil(this.destroy$),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Presentation Components (Dumb)
Located in `src/app/components/`

**Responsibilities:**
- Display data via @Input
- Emit events via @Output
- No service dependencies
- Reusable across features

**Pattern:**
```typescript
@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, AngularMaterialModules],
  templateUrl: './job-card.component.html',
  styleUrl: './job-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobCardComponent {
  @Input({ required: true }) job!: JobApplication;
  @Output() edit = new EventEmitter<JobApplication>();
  @Output() delete = new EventEmitter<string>();
  
  onEdit(): void {
    this.edit.emit(this.job);
  }
}
```

### Form Components
Implement `ControlValueAccessor` for reactive forms integration

**Pattern:**
```typescript
@Component({
  selector: 'app-custom-input',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CustomInputComponent),
    multi: true
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomInputComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);
  value = '';
  disabled = false;
  
  onChange = (value: any) => {};
  onTouched = () => {};
  
  writeValue(value: any): void {
    this.value = value;
    this.cdr.markForCheck();
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
```

## Template Patterns

### Modern Control Flow (Required)
```html
<!-- Conditional rendering — use ng-container to avoid extra DOM nodes -->
<section class="component-container" aria-labelledby="section-heading">
  <h2 id="section-heading" class="visually-hidden">Section Title</h2>
  @if (isLoading) {
    <app-loader />
  } @else if (hasError) {
    <app-error [message]="errorMessage" />
  } @else {
    <ng-container>
      <app-content [data]="data" />
    </ng-container>
  }
</section>

<!-- List rendering — always use ol/ul + li for lists of items -->
<ul class="item-list" aria-label="Job applications">
  @for (item of items; track item.id) {
    <li class="item-list__entry">
      <app-item-card [item]="item" />
    </li>
  } @empty {
    <li class="item-list__empty">
      <app-empty-state message="No items found" />
    </li>
  }
</ul>

<!-- Switch statements -->
@switch (status) {
  @case ('pending') {
    <span class="badge badge-warning">Pending</span>
  }
  @case ('approved') {
    <span class="badge badge-success">Approved</span>
  }
  @default {
    <span class="badge badge-default">Unknown</span>
  }
}
```

### Angular Structural Elements
```html
<!-- Use ng-container when you need a structural directive with no DOM output -->
@if (isAdmin) {
  <ng-container>
    <app-admin-panel />
    <app-admin-tools />
  </ng-container>
}

<!-- Use ng-template for reusable template fragments -->
<ng-template #loadingTpl>
  <p class="loading-message" aria-live="polite">Loading...</p>
</ng-template>

<!-- Reference ng-template via ngTemplateOutlet -->
<ng-container *ngTemplateOutlet="loadingTpl" />
```

### Class and Style Bindings
```html
<!-- Class bindings on semantic elements (NOT ngClass) -->
<article
  [class.active]="isActive"
  [class.disabled]="isDisabled"
  [class.error]="hasError">
</article>

<!-- Style bindings on semantic elements (NOT ngStyle) -->
<section
  [style.width.px]="width"
  [style.background-color]="bgColor">
</section>

<!-- Use ng-container when the binding wrapper should produce no DOM node -->
<ng-container [class.active]="isActive">
  <app-child />
</ng-container>
```

### Event Handling
```html
<!-- Always use <button> for actions, never <div (click)> -->
<button type="button" (click)="onSave()">Save</button>
<button type="submit" (click)="onSubmit()" aria-label="Submit form">Submit</button>

<!-- Use <a> for navigation, <button> for in-page actions -->
<a [routerLink]="['/dashboard']">Go to Dashboard</a>

<!-- Icon-only buttons must have aria-label -->
<button type="button" (click)="onDelete(item.id)" aria-label="Delete application">
  <mat-icon>delete</mat-icon>
</button>

<!-- Template reference variables -->
<label for="search-input">Search</label>
<input id="search-input" #searchInput (keyup)="onSearch(searchInput.value)" />
```

## Semantic HTML Anti-Patterns

### Prohibited Patterns
```html
<!-- ❌ WRONG: div used as a button -->
<div (click)="onAction()">Click me</div>

<!-- ✅ CORRECT -->
<button type="button" (click)="onAction()">Click me</button>

<!-- ❌ WRONG: div used as a list -->
<div class="list">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
</div>

<!-- ✅ CORRECT -->
<ul class="list">
  <li class="item">Item 1</li>
  <li class="item">Item 2</li>
</ul>

<!-- ❌ WRONG: extra div wrapper for structural directive -->
<div *ngIf="isVisible">
  <app-child />
</div>

<!-- ✅ CORRECT: ng-container adds no DOM node -->
@if (isVisible) {
  <ng-container>
    <app-child />
  </ng-container>
}

<!-- ❌ WRONG: generic div for page section -->
<div class="header">...</div>
<div class="main-content">...</div>
<div class="sidebar">...</div>

<!-- ✅ CORRECT -->
<header>...</header>
<main>...</main>
<aside>...</aside>

<!-- ❌ WRONG: icon button without accessible name -->
<button (click)="onEdit()">
  <mat-icon>edit</mat-icon>
</button>

<!-- ✅ CORRECT -->
<button type="button" (click)="onEdit()" aria-label="Edit application">
  <mat-icon aria-hidden="true">edit</mat-icon>
</button>
```

## SCSS Patterns

### Component Scoping
```scss
:host {
  display: block;
  padding: 1rem;
  
  &.compact {
    padding: 0.5rem;
  }
}

.component-container {
  // Component-specific styles
}
```

### Responsive Design (Mobile-First)
```scss
.card {
  padding: 1rem;
  
  // Tablet (599px+)
  @media (min-width: 599px) {
    padding: 1.5rem;
  }
  
  // Desktop (950px+)
  @media (min-width: 950px) {
    padding: 2rem;
  }
}
```

### Using Theme Variables
```scss
@import 'src/app/styles/variables';
@import 'src/app/styles/fonts';

.header {
  color: $text-primary;
  background: $background-light;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
}
```

## Lifecycle Hooks

### Initialization
```typescript
ngOnInit(): void {
  // Initialize component
  // Set up subscriptions
  // Fetch initial data
}
```

### Cleanup (Required)
```typescript
ngOnDestroy(): void {
  // Complete all subjects
  this.destroy$.next();
  this.destroy$.complete();
  
  // Clean up manual subscriptions if any
  // Remove event listeners
}
```

### Change Detection
```typescript
ngOnChanges(changes: SimpleChanges): void {
  if (changes['data'] && !changes['data'].firstChange) {
    this.processData(changes['data'].currentValue);
  }
}
```

## State Management in Components

### Local State
```typescript
export class MyComponent {
  // Simple state
  isLoading = false;
  errorMessage = '';
  
  // Complex state with signals (Angular 16+)
  count = signal(0);
  doubled = computed(() => this.count() * 2);
}
```

### Service State
```typescript
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private stateService = inject(StateService);
  
  data$ = this.stateService.getData().pipe(
    takeUntil(this.destroy$),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Performance Optimization

### OnPush Strategy (Required)
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedComponent {
  private cdr = inject(ChangeDetectorRef);
  
  updateData(newData: any): void {
    this.data = newData;
    this.cdr.markForCheck(); // Trigger change detection
  }
}
```

### TrackBy Functions
```typescript
export class ListComponent {
  trackById(index: number, item: any): any {
    return item.id;
  }
}
```

```html
@for (item of items; track trackById($index, item)) {
  <app-item [data]="item" />
}
```

## Testing Patterns

### Component Test Structure
```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let mockService: jasmine.SpyObj<DataService>;
  
  beforeEach(async () => {
    mockService = jasmine.createSpyObj('DataService', ['getData']);
    
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        { provide: DataService, useValue: mockService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should load data on init', () => {
    mockService.getData.and.returnValue(of(mockData));
    fixture.detectChanges();
    expect(component.data).toEqual(mockData);
  });
});
```

## Common Patterns

### Loading States
```typescript
export class DataComponent {
  isLoading = false;
  
  loadData(): void {
    this.isLoading = true;
    this.service.getData()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(data => this.data = data);
  }
}
```

### Error Handling
```typescript
export class DataComponent {
  errorMessage = '';
  
  loadData(): void {
    this.service.getData()
      .pipe(
        catchError(error => {
          this.errorMessage = 'Failed to load data';
          return of([]);
        })
      )
      .subscribe(data => this.data = data);
  }
}
```

### Pagination
```typescript
export class PaginatedComponent {
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadData();
  }
}
```
