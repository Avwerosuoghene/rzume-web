---
name: angular-implement
description: Comprehensive Angular feature implementation with adaptive architecture analysis and pattern discovery
tags: [angular, implementation, architecture, patterns, micro-frontends, development]
---

# Angular Implementation Workflow

This workflow provides comprehensive guidance for implementing features in Angular projects through adaptive architecture analysis and pattern discovery. It dynamically adjusts to your project's specific setup, tools, and conventions while ensuring adherence to Angular best practices.

## Overview

The Angular Implementation workflow performs intelligent analysis of your project structure to understand:
- **Project Architecture**: Monorepo vs standalone, build tools, testing frameworks
- **Pattern Discovery**: Existing conventions, coding standards, architectural decisions
- **Tool Integration**: CLI commands, package management, deployment strategies
- **Micro-Frontend Setup**: Module Federation, routing, shared dependencies
- **Development Workflow**: Build processes, testing strategies, CI/CD integration

## Phase 1: Project Architecture Analysis

### Step 1: Structural Analysis

#### 1.1 Project Type Identification
**Analyze project structure to determine:**
- **Monorepo Detection**: Check for `nx.json`, `angular.json` with multiple projects, `pnpm-workspace.yaml`, `lerna.json` 
- **Standalone Project**: Single `angular.json` with one project, standard Angular CLI structure
- **Custom Setup**: Non-standard organization, custom build configurations

**Analysis Commands:**
```bash
# Check for monorepo indicators
find . -name "nx.json" -o -name "lerna.json" -o -name "pnpm-workspace.yaml" -o -name "rush.json"

# Analyze angular.json structure
cat angular.json | jq '.projects | keys' 2>/dev/null || cat angular.json

# Check package manager
ls package.json pnpm-lock.yaml yarn.lock package-lock.json 2>/dev/null

# Examine workspace structure
find . -maxdepth 2 -type d -name "projects" -o -name "apps" -o -name "libs"
```

#### 1.2 Build System Analysis
**Identify build tools and configurations:**
- **Angular CLI**: Standard `@angular-devkit/build-angular` 
- **Webpack Custom**: Custom webpack configurations
- **Vite Integration**: Vite-based Angular builds
- **Custom Builders**: Third-party or custom build builders

**Configuration Analysis:**
```typescript
// Check angular.json builders
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser", // Standard
    "builder": "@angular-devkit/build-angular:application", // v17+
    "builder": "@nx/angular:webpack-browser", // Nx
    "builder": "custom-builder:build" // Custom
  }
}

// Check for custom webpack
"options": {
  "customWebpackConfig": { "path": "./webpack.config.js" }
}

// Check for Vite
"build": {
  "builder": "@angular-devkit/build-angular:browser-esbuild"
}
```

#### 1.3 Testing Framework Analysis
**Identify testing setup:**
- **Jasmine + Karma**: Traditional Angular testing
- **Jest**: Modern JavaScript testing
- **Vitest**: Fast unit testing
- **Playwright**: E2E testing
- **Cypress**: E2E testing

**Testing Configuration Detection:**
```json
// package.json scripts
"test": "ng test",                    // CLI default
"test": "jest",                       // Jest
"test": "vitest",                     // Vitest
"e2e": "ng e2e",                      // Protractor/Cypress
"e2e": "playwright test"              // Playwright

// Test configuration files
karma.conf.js, jest.config.js, vitest.config.ts, playwright.config.ts
```

#### 1.4 Micro-Frontend Architecture Analysis
**Identify micro-frontend approach:**
- **Module Federation**: Webpack-based micro-frontends
- **Single-SPA**: Application coordination
- **Web Components**: Component-based sharing
- **iFrames**: Isolated applications

**Module Federation Detection:**
```typescript
// webpack.config.js or extra-webpack.config.js
const ModuleFederationPlugin = require('@angular-architects/module-federation/webpack');

// Check for remotes configuration
remotes: {
  "mfe1": "mfe1@http://localhost:3001/remoteEntry.js",
  "mfe2": "mfe2@http://localhost:3002/remoteEntry.js"
}

// Check for shared dependencies
shared: {
  "@angular/core": { singleton: true, strictVersion: true },
  "@angular/common": { singleton: true, strictVersion: true },
  "rxjs": { singleton: true, strictVersion: true }
}
```

### Step 2: Technology Stack Analysis

#### 2.1 Angular Version and Features
**Analyze Angular version and available features:**
```bash
# Check Angular version
ng version

# Analyze angular.json for feature flags
"enableIvy": true,                    // Ivy compiler
"strictTemplates": true,              // Strict template checking
"standalone": true,                   // Standalone components
"experimentalZoneless": true          // Zoneless applications
```

#### 2.2 State Management Analysis
**Identify state management approach:**
- **Services + Subjects**: RxJS-based state management
- **NgRx**: Redux-style state management
- **NGXS**: Simple state management
- **Signals**: Angular's new reactive primitive
- **Custom Solutions**: Project-specific implementations

**State Management Detection:**
```typescript
// NgRx detection
import { Store } from '@ngrx/store';
import { createAction, props } from '@ngrx/store';

// NGXS detection
import { State, Action, StateContext } from '@ngxs/store';

// Signals detection
import { signal, computed } from '@angular/core';

// Custom service detection
@Injectable({ providedIn: 'root' })
export class StateService {
  private state$ = new BehaviorSubject<State>(initialState);
}
```

#### 2.3 Styling Architecture Analysis
**Identify styling approach:**
- **CSS**: Standard CSS files
- **SCSS/SASS**: Preprocessor styling
- **CSS Modules**: Scoped styling
- **Tailwind CSS**: Utility-first CSS
- **Material Design**: Angular Material components
- **Bootstrap**: Bootstrap framework
- **Styled Components**: CSS-in-JS

**Styling Detection:**
```json
// angular.json styling configuration
"styles": [
  "src/styles.css",
  "src/theme.scss",
  "node_modules/@angular/material/prebuilt-themes/indigo-pink.css",
  "node_modules/bootstrap/dist/css/bootstrap.min.css"
]

// package.json dependencies
"tailwindcss", "bootstrap", "@angular/material", "styled-components"
```

#### 2.4 API Integration Analysis
**Identify API integration patterns:**
- **HttpClient**: Angular's HTTP client
- **Apollo GraphQL**: GraphQL client
- **Fetch API**: Native fetch
- **Axios**: Third-party HTTP client
- **Custom SDK**: Project-specific API clients

**API Detection:**
```typescript
// HttpClient detection
import { HttpClient } from '@angular/common/http';

// Apollo detection
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

// Custom SDK detection
import { ApiClient } from '@project/sdk';
```

## Phase 2: Pattern Discovery and Analysis

### Step 3: Code Pattern Analysis

#### 3.1 Component Pattern Discovery
**Analyze existing component patterns:**
```bash
# Find component files
find . -name "*.component.ts" -type f | head -5

# Analyze component structure patterns
grep -r "export.*Component" --include="*.ts" . | head -5
```

**Pattern Analysis Checklist:**
- **Standalone vs NgModule**: Check for `standalone: true` vs `@NgModule` 
- **Change Detection**: OnPush vs Default strategy
- **View Encapsulation**: Emulated, ShadowDom, None
- **Lifecycle Hooks**: Which hooks are commonly used
- **Input/Output Patterns**: Property and event binding conventions

**Component Pattern Examples:**
```typescript
// Standalone Component Pattern
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {
  @Input() data: DataModel;
  @Output() event = new EventEmitter<EventData>();
}

// NgModule Pattern
@Component({
  selector: 'app-example',
  template: `...` 
})
export class ExampleComponent implements OnInit, OnDestroy {
  constructor(private service: ExampleService) {}
}
```

#### 3.2 Service Pattern Discovery
**Analyze existing service patterns:**
```bash
# Find service files
find . -name "*.service.ts" -type f | head -5

# Analyze service patterns
grep -r "Injectable" --include="*.ts" . | head -5
```

**Service Pattern Analysis:**
- **Dependency Injection**: providedIn vs module providers
- **HTTP Services**: API integration patterns
- **State Services**: State management approaches
- **Utility Services**: Helper function organization
- **Singleton vs Instance**: Service lifetime patterns

**Service Pattern Examples:**
```typescript
// Root Singleton Pattern
@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient) {}
}

// Module-Scoped Pattern
@Injectable()
export class FeatureService {
  constructor(@Inject(SERVICE_TOKEN) private config: Config) {}
}

// Factory Pattern
export function serviceFactory(http: HttpClient): DataService {
  return new DataService(http);
}

providers: [
  {
    provide: DataService,
    useFactory: serviceFactory,
    deps: [HttpClient]
  }
]
```

#### 3.3 Routing Pattern Discovery
**Analyze routing patterns:**
```bash
# Find routing files
find . -name "*routing*.ts" -o -name "*routes*.ts" | head -5

# Analyze router configuration
grep -r "RouterModule" --include="*.ts" . | head -5
```

**Routing Pattern Analysis:**
- **Route Configuration**: Route definitions and structure
- **Guard Implementation**: Authentication and authorization guards
- **Lazy Loading**: Module and component lazy loading
- **Route Parameters**: Parameter handling patterns
- **Nested Routes**: Child route configurations

#### 3.4 Testing Pattern Discovery
**Analyze testing patterns:**
```bash
# Find test files
find . -name "*.spec.ts" -o -name "*.test.ts" | head -5

# Analyze testing patterns
grep -r "describe\|it\|expect" --include="*.ts" . | head -5
```

**Testing Pattern Analysis:**
- **Test Setup**: TestBed configuration patterns
- **Mock Creation**: Service and component mocking
- **Async Testing**: Observable and promise testing
- **Component Testing**: Shallow vs deep rendering
- **Integration Testing**: Multi-component testing

### Step 4: Architecture Pattern Analysis

#### 4.1 Module Organization Analysis
**Analyze module organization:**
```bash
# Find module files
find . -name "*.module.ts" -type f | head -5

# Analyze module structure
grep -r "NgModule" --include="*.ts" . | head -5
```

**Module Organization Patterns:**
- **Feature Modules**: Domain-specific module organization
- **Shared Modules**: Common functionality sharing
- **Core Modules**: Singleton services providers
- **Domain Modules**: Business domain organization

#### 4.2 Directory Structure Analysis
**Analyze project organization:**
```
# Common Angular directory patterns
src/
├── app/
│   ├── core/              # Singleton services
│   ├── shared/            # Shared components/pipes
│   ├── features/          # Feature modules
│   │   ├── feature-a/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── feature-a.module.ts
│   ├── models/            # Data models
│   ├── utils/             # Utility functions
│   └── interceptors/      # HTTP interceptors

# Alternative patterns
src/
├── components/            # All components
├── services/              # All services
├── models/                # All models
└── pages/                 # Page components
```

## Phase 3: Implementation Strategy

### Step 5: Adaptive Implementation Planning

#### 5.1 Feature Classification
**Classify the feature based on project analysis:**

| Feature Type | Implementation Approach | File Locations |
|--------------|----------------------|----------------|
| **Component Feature** | Component-first or service-first | `features/*/components/` or `src/components/` |
| **Service Feature** | Service with supporting components | `features/*/services/` or `src/services/` |
| **Shared Feature** | Shared module or library | `shared/` or `libs/` |
| **Core Feature** | Core service with global scope | `core/` or `src/core/` |
| **Micro-Frontend** | Remote module or standalone app | Separate app or remote module |

#### 5.2 Implementation Templates

**Component Implementation Templates:**

**Standalone Component Template:**
```typescript
@Component({
  selector: 'app-[feature-name]',
  standalone: true,
  imports: [
    // Discovered common imports
    CommonModule,
    // Add discovered UI library imports
  ],
  template: `
    <div class="[feature-name]-container">
      <!-- Template structure based on project patterns -->
    </div>
  `,
  styleUrls: ['./[feature-name].component.scss'], // Adjust based on styling approach
  changeDetection: ChangeDetectionStrategy.OnPush // Based on project patterns
})
export class [FeatureName]Component implements OnInit, OnDestroy {
  // Properties based on discovered patterns
  private destroy$ = new DestroySubject();
  
  constructor(
    // Dependencies based on project DI patterns
    private [service]: [ServiceType]
  ) {}

  ngOnInit(): void {
    // Initialization pattern based on project
  }

  ngOnDestroy(): void {
    // Cleanup pattern based on project
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**NgModule Component Template:**
```typescript
@Component({
  selector: 'app-[feature-name]',
  template: `...`,
  styleUrls: ['./[feature-name].component.scss']
})
export class [FeatureName]Component implements OnInit {
  constructor(
    private [service]: [ServiceType],
    private [cdr]: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Component initialization
  }
}

@NgModule({
  declarations: [[FeatureName]Component],
  imports: [
    // Common imports based on project
    CommonModule,
    // Feature-specific modules
  ],
  exports: [[FeatureName]Component],
  providers: [
    // Feature-specific providers
  ]
})
export class [FeatureName]Module {}
```

**Service Implementation Templates:**

**HTTP Service Template:**
```typescript
@Injectable({ providedIn: 'root' }) // Adjust based on project patterns
export class [FeatureName]Service {
  private readonly apiUrl = '[api-endpoint]'; // Based on API patterns
  
  constructor(
    private http: HttpClient, // Adjust based on HTTP client choice
    private [logger]: LoggerService // Based on logging patterns
  ) {}

  get[Resource](): Observable<[ResourceType]> {
    return this.http.get<[ResourceType]>(this.apiUrl).pipe(
      // Error handling based on project patterns
      catchError(error => this.handleError(error))
    );
  }

  create[Resource](data: Create[Resource]Dto): Observable<[ResourceType]> {
    return this.http.post<[ResourceType]>(this.apiUrl, data).pipe(
      // Response handling based on project patterns
    );
  }

  private handleError(error: any): Observable<never> {
    // Error handling pattern based on project
    this.logger.error('Service error', error);
    return throwError(() => error);
  }
}
```

**State Management Service Template:**
```typescript
@Injectable({ providedIn: 'root' })
export class [FeatureName]StateService {
  private readonly state$ = new BehaviorSubject<[StateType]>(initialState);
  private readonly store = signal<[StateType]>(initialState); // If using signals

  readonly state = this.state$.asObservable();
  readonly [computedValue] = computed(() => this.store().[property]); // If using signals

  constructor(
    private [service]: [ServiceType]
  ) {}

  update[State](updates: Partial<[StateType]>): void {
    const currentState = this.state$.value;
    const newState = { ...currentState, ...updates };
    this.state$.next(newState);
    this.store.set(newState); // If using signals
  }

  reset[State](): void {
    this.state$.next(initialState);
    this.store.set(initialState); // If using signals
  }
}
```

### Step 6: Anti-Pattern Detection and Prevention

#### 6.1 Common Angular Anti-Patterns

**Component Anti-Patterns:**

**Anti-Pattern 1: Direct DOM Manipulation**
```typescript
// ❌ WRONG: Direct DOM manipulation bypasses Angular
export class BadComponent {
  constructor() {
    document.getElementById('element').innerHTML = 'content';
  }
}

// ✅ CORRECT: Use Renderer2 or template references
export class GoodComponent {
  constructor(private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {}
  
  updateContent(elementRef: ElementRef, content: string): void {
    this.renderer.setProperty(elementRef.nativeElement, 'innerHTML', content);
  }
}
```

**Anti-Pattern 2: Manual Change Detection Triggering**
```typescript
// ❌ WRONG: Manual change detection
export class BadComponent {
  constructor(private cdr: ChangeDetectorRef) {}
  
  updateData(): void {
    this.data = newData;
    this.cdr.detectChanges(); // Unnecessary manual triggering
  }
}

// ✅ CORRECT: Use OnPush strategy with immutable updates
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoodComponent {
  data$ = new BehaviorSubject<Data>(initialData);
  
  updateData(): void {
    this.data$.next(newData);
  }
}
```

**Anti-Pattern 3: Using ngClass/ngStyle Instead of Direct Bindings**
```typescript
// ❌ WRONG: Using directives for simple bindings
@Component({
  template: `
    <div [ngClass]="{admin: isAdmin, dense: density === 'high'}">
    <div [ngStyle]="{'color': textColor, 'background-color': backgroundColor}"></div>
  `
})

// ✅ CORRECT: Use direct class and style bindings (better performance)
@Component({
  template: `
    <div [class.admin]="isAdmin" [class.dense]="density === 'high'">
    <div [style.color]="textColor" [style.background-color]="backgroundColor">
  `
})
```

**Anti-Pattern 4: Constructor Injection vs inject() Function**
```typescript
// ❌ OUTDATED: Constructor parameter injection (still works but verbose)
export class OldComponent {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
}

// ✅ MODERN: Use inject() function (Angular 14+, recommended in 2025)
export class ModernComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  
  // More readable, better type inference, easier to add comments
}
```

**Anti-Pattern 5: Public Template Members**
```typescript
// ❌ WRONG: Public members expose unnecessary API
@Component({
  template: `<p>{{ fullName() }}</p>` 
})
export class BadComponent {
  firstName = input();
  lastName = input();
  
  // This becomes part of public API but only used in template
  fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
}

// ✅ CORRECT: Use protected for template-only members
@Component({
  template: `<p>{{ fullName() }}</p>` 
})
export class GoodComponent {
  firstName = input();
  lastName = input();
  
  // Protected: used in template but not part of public API
  protected fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
}
```

**Service Anti-Patterns:**

**Anti-Pattern 1: Storing Component State in Services**
```typescript
// ❌ WRONG: Service with state that should be in component
@Injectable({ providedIn: 'root' })
export class BadService {
  formData = {}; // This belongs in component state
  
  updateField(field: string, value: any): void {
    this.formData[field] = value;
  }
}

// ✅ CORRECT: Service for data operations only
@Injectable({ providedIn: 'root' })
export class GoodService {
  saveData(data: FormData): Observable<SaveResult> {
    return this.http.post<SaveResult>('/api/data', data);
  }
}
```

**Anti-Pattern 2: Unmanaged Subscriptions in Services**
```typescript
// ❌ WRONG: Long-running operations without cleanup
@Injectable({ providedIn: 'root' })
export class BadService {
  constructor() {
    interval(1000).subscribe(() => {
      // This will cause memory leaks
    });
  }
}

// ✅ CORRECT: Use takeUntilDestroyed (Angular 16+)
@Injectable({ providedIn: 'root' })
export class GoodService {
  private destroyRef = inject(DestroyRef);
  
  constructor() {
    interval(1000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      // Automatically cleaned up when service is destroyed
    });
  }
}

// ✅ ALTERNATIVE: Manual cleanup with Subject
@Injectable({ providedIn: 'root' })
export class AlternativeService implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  constructor() {
    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Safe interval
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**RxJS and Subscription Anti-Patterns:**

**Anti-Pattern 1: Nested Subscriptions (Callback Hell)**
```typescript
// ❌ WRONG: Nested subscriptions create callback hell
export class BadComponent {
  loadData(): void {
    this.userService.getUser().subscribe(user => {
      this.orderService.getOrders(user.id).subscribe(orders => {
        this.productService.getProducts(orders[0].id).subscribe(products => {
          // Deeply nested, hard to maintain
        });
      });
    });
  }
}

// ✅ CORRECT: Flatten with RxJS operators
export class GoodComponent {
  loadData(): void {
    this.userService.getUser().pipe(
      switchMap(user => this.orderService.getOrders(user.id)),
      switchMap(orders => this.productService.getProducts(orders[0].id))
    ).subscribe(products => {
      // Clean, flat, maintainable
    });
  }
}
```

**Anti-Pattern 2: Manual Subscription Management**
```typescript
// ❌ WRONG: Manual subscription tracking
export class BadComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];
  
  ngOnInit(): void {
    this.subscriptions.push(
      this.service.getData().subscribe(data => {})
    );
    this.subscriptions.push(
      this.service.getMore().subscribe(data => {})
    );
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

// ✅ CORRECT: Use AsyncPipe in templates
@Component({
  template: `
    <div *ngFor="let item of data$ | async">{{ item }}</div>
    <div *ngFor="let item of moreData$ | async">{{ item }}</div>
  `
})
export class GoodComponent {
  data$ = this.service.getData();
  moreData$ = this.service.getMore();
  // AsyncPipe handles subscriptions automatically
}

// ✅ ALTERNATIVE: Use takeUntilDestroyed (Angular 16+)
export class AlternativeComponent {
  private destroyRef = inject(DestroyRef);
  
  ngOnInit(): void {
    this.service.getData().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {});
    
    this.service.getMore().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {});
  }
}
```

**Anti-Pattern 3: Not Using Flattening Operators**
```typescript
// ❌ WRONG: Nested subscriptions in route guards
export class BadGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.auth.isAuthenticated$.pipe(
      switchMap(isAuth => {
        return this.user.getUser().pipe(
          map(user => {
            return user.hasPermission; // Unnecessary nesting
          })
        );
      })
    );
  }
}

// ✅ CORRECT: Flat observable chain
export class GoodGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.auth.isAuthenticated$.pipe(
      switchMap(isAuth => isAuth ? this.user.getUser() : of(null)),
      map(user => user?.hasPermission ?? false)
    );
  }
}
```

**Anti-Pattern 4: Using subscribe() When Not Needed**
```typescript
// ❌ WRONG: Subscribing to transform data
export class BadComponent {
  users: User[] = [];
  
  ngOnInit(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users.filter(u => u.active);
    });
  }
}

// ✅ CORRECT: Use operators and AsyncPipe
@Component({
  template: `<div *ngFor="let user of activeUsers$ | async">{{ user.name }}</div>` 
})
export class GoodComponent {
  activeUsers$ = this.userService.getUsers().pipe(
    map(users => users.filter(u => u.active))
  );
}
```

#### 6.2 Performance Anti-Patterns

**Performance Anti-Pattern 1: Functions in Templates**
```typescript
// ❌ WRONG: Functions called in templates (runs on every change detection)
@Component({
  template: `
    <div>{{ calculateExpensiveValue() }}</div>
    <div>{{ formatDate(date) }}</div>
    <div>{{ getFullName(user) }}</div>
  `
})
export class BadComponent {
  calculateExpensiveValue(): number {
    // This runs on EVERY change detection cycle!
    return expensiveCalculation();
  }
  
  formatDate(date: Date): string {
    // Called repeatedly, even if date hasn't changed
    return date.toLocaleDateString();
  }
}

// ✅ CORRECT: Use signals with computed (Angular 16+)
@Component({
  template: `
    <div>{{ expensiveValue() }}</div>
    <div>{{ formattedDate() }}</div>
    <div>{{ fullName() }}</div>
  `
})
export class GoodComponent {
  date = signal(new Date());
  user = signal({ firstName: 'John', lastName: 'Doe' });
  
  // Computed signals only recalculate when dependencies change
  expensiveValue = computed(() => expensiveCalculation());
  formattedDate = computed(() => this.date().toLocaleDateString());
  fullName = computed(() => `${this.user().firstName} ${this.user().lastName}`);
}

// ✅ ALTERNATIVE: Use pipes for transformations
@Component({
  template: `
    <div>{{ date | customDatePipe }}</div>
  `
})
export class PipeComponent {
  date = new Date();
}
```

**Performance Anti-Pattern 2: Not Using OnPush Change Detection**
```typescript
// ❌ WRONG: Default change detection (checks entire tree)
@Component({
  selector: 'app-user-list',
  template: `
    <div *ngFor="let user of users">{{ user.name }}</div>
  `
  // Default change detection strategy
})
export class BadComponent {
  @Input() users: User[];
}

// ✅ CORRECT: Use OnPush for better performance
@Component({
  selector: 'app-user-list',
  template: `
    <div *ngFor="let user of users">{{ user.name }}</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoodComponent {
  @Input() users: User[]; // Only checks when input reference changes
}
```

**Performance Anti-Pattern 3: Mutating Input Objects**
```typescript
// ❌ WRONG: Mutating objects breaks OnPush detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParentComponent {
  user = { name: 'John', age: 30 };
  
  updateUser(): void {
    this.user.age = 31; // Mutation - OnPush won't detect this!
  }
}

// ✅ CORRECT: Create new object references
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoodParentComponent {
  user = { name: 'John', age: 30 };
  
  updateUser(): void {
    this.user = { ...this.user, age: 31 }; // New reference - OnPush detects this
  }
}

// ✅ BEST: Use signals for reactive state
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BestParentComponent {
  user = signal({ name: 'John', age: 30 });
  
  updateUser(): void {
    this.user.update(u => ({ ...u, age: 31 })); // Signals handle reactivity
  }
}
```

**Performance Anti-Pattern 4: Large Bundle Sizes**
```typescript
// ❌ WRONG: Importing entire libraries
import * as _ from 'lodash';
import * as moment from 'moment';

export class BadComponent {
  formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }
}

// ✅ CORRECT: Import only what you need
import { format } from 'date-fns';

export class GoodComponent {
  formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }
}

// ✅ BEST: Use native JavaScript when possible
export class BestComponent {
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
```

#### 6.3 Angular Signals Anti-Patterns and Best Practices

**Signals Anti-Pattern 1: Side Effects in Computed Signals**
```typescript
// ❌ WRONG: Side effects in computed signals
export class BadComponent {
  data = signal<Data[]>([]);
  
  // Computed signals should be PURE functions
  processedData = computed(() => {
    const data = this.data();
    this.logService.log(data); // Side effect! Don't do this!
    localStorage.setItem('data', JSON.stringify(data)); // Side effect!
    return data.map(item => item.processed);
  });
}

// ✅ CORRECT: Use effects for side effects
export class GoodComponent {
  data = signal<Data[]>([]);
  
  // Computed signals are pure
  processedData = computed(() => 
    this.data().map(item => item.processed)
  );
  
  constructor() {
    // Effects handle side effects
    effect(() => {
      const data = this.data();
      this.logService.log(data);
      localStorage.setItem('data', JSON.stringify(data));
    });
  }
}
```

**Signals Anti-Pattern 2: Over-Granular Signals**
```typescript
// ❌ WRONG: Too many individual signals
export class BadComponent {
  firstName = signal('');
  lastName = signal('');
  email = signal('');
  phone = signal('');
  address = signal('');
  city = signal('');
  state = signal('');
  zip = signal('');
  // Too granular, hard to manage
}

// ✅ CORRECT: Group related state
export class GoodComponent {
  user = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  address = signal({
    street: '',
    city: '',
    state: '',
    zip: ''
  });
  
  // Easier to manage, update, and reason about
  updateUser(updates: Partial<User>): void {
    this.user.update(current => ({ ...current, ...updates }));
  }
}
```

**Signals Anti-Pattern 3: Not Using untracked() Appropriately**
```typescript
// ❌ WRONG: Creating unnecessary dependencies
export class BadComponent {
  count = signal(0);
  debugMode = signal(false);
  
  // This effect will run when debugMode changes, even though we don't want it to
  constructor() {
    effect(() => {
      const currentCount = this.count();
      if (this.debugMode()) { // Creates dependency on debugMode
        console.log('Count:', currentCount);
      }
    });
  }
}

// ✅ CORRECT: Use untracked() to avoid unnecessary dependencies
import { untracked } from '@angular/core';

export class GoodComponent {
  count = signal(0);
  debugMode = signal(false);
  
  constructor() {
    effect(() => {
      const currentCount = this.count();
      // Only reacts to count changes, not debugMode changes
      if (untracked(() => this.debugMode())) {
        console.log('Count:', currentCount);
      }
    });
  }
}
```

**Signals Best Practice: Combining Signals with RxJS**
```typescript
// ✅ BEST PRACTICE: Bridge signals and observables
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

export class SearchComponent {
  searchTerm = signal('');
  private searchService = inject(SearchService);
  
  // Convert signal to observable for RxJS operators
  searchResults = toSignal(
    toObservable(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.searchService.search(term))
    ),
    { initialValue: [] }
  );
  
  onSearch(term: string): void {
    this.searchTerm.set(term);
  }
}
```

#### 6.4 Modern Angular Standards (2025)

**Standard 1: File Naming Conventions**
```bash
# ✅ CORRECT: Hyphen-separated file names
user-profile.component.ts
user-profile.component.html
user-profile.component.scss
user-profile.component.spec.ts
user-profile.service.ts
user-profile.model.ts

# ❌ WRONG: Other naming conventions
UserProfile.component.ts  # PascalCase
user_profile.component.ts # Underscore
userProfile.component.ts  # camelCase
```

**Standard 2: Component Selector Naming**
```typescript
// ✅ CORRECT: Use application prefix
@Component({
  selector: 'app-user-profile',  // app- prefix
  selector: 'myapp-user-list',   // myapp- prefix
})

// ❌ WRONG: No prefix or generic names
@Component({
  selector: 'user-profile',  # No prefix
  selector: 'profile',       # Too generic
})
```

**Standard 3: Use readonly for Angular-Initialized Properties**
```typescript
// ✅ CORRECT: Mark inputs, outputs, and queries as readonly
@Component({})
export class GoodComponent {
  readonly userId = input<string>();
  readonly userSaved = output<void>();
  readonly userName = model<string>();
  
  @ViewChild('template') readonly template?: TemplateRef<any>;
  @ViewChildren(ChildComponent) readonly children?: QueryList<ChildComponent>;
}

// ❌ WRONG: Mutable Angular-initialized properties
@Component({})
export class BadComponent {
  userId = input<string>();  // Should be readonly
  userSaved = output<void>(); // Should be readonly
}
```

**Standard 4: Organize Component Members**
```typescript
// ✅ CORRECT: Group Angular-specific properties before methods
@Component({})
export class WellOrganizedComponent {
  // 1. Injected dependencies
  private userService = inject(UserService);
  private router = inject(Router);
  
  // 2. Inputs
  readonly userId = input<string>();
  readonly config = input<Config>();
  
  // 3. Outputs
  readonly userUpdated = output<User>();
  
  // 4. Queries
  @ViewChild('form') readonly form?: ElementRef;
  
  // 5. Signals and state
  user = signal<User | null>(null);
  loading = signal(false);
  
  // 6. Computed values
  protected fullName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });
  
  // 7. Lifecycle hooks
  ngOnInit(): void {}
  
  // 8. Public methods
  saveUser(): void {}
  
  // 9. Protected/private methods
  protected validateUser(): boolean {}
  private fetchUser(): void {}
}
```

**Standard 5: Prefer inject() Over Constructor Injection**
```typescript
// ✅ CORRECT: Use inject() function (modern, recommended)
export class ModernComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  
  // Easy to add comments
  private logger = inject(LoggerService); // For debugging only
}

// ❌ OUTDATED: Constructor injection (still works but verbose)
export class OldComponent {
  constructor(
    private userService: UserService,
    private router: Router,
    private logger: LoggerService
  ) {}
}
```

#### 6.5 RxJS Best Practices

**Best Practice 1: Always Use AsyncPipe in Templates**
```typescript
// ✅ CORRECT: AsyncPipe handles subscriptions
@Component({
  template: `
    <div *ngFor="let user of users$ | async">{{ user.name }}</div>
    <div *ngIf="loading$ | async">Loading...</div>
  `
})
export class GoodComponent {
  users$ = this.userService.getUsers();
  loading$ = this.userService.loading$;
}

// ❌ WRONG: Manual subscription management
export class BadComponent implements OnInit, OnDestroy {
  users: User[] = [];
  private subscription?: Subscription;
  
  ngOnInit(): void {
    this.subscription = this.userService.getUsers().subscribe(
      users => this.users = users
    );
  }
  
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
```

**Best Practice 2: Use Flattening Operators**
```typescript
// ✅ CORRECT: Use switchMap, mergeMap, concatMap, exhaustMap
export class GoodComponent {
  searchResults$ = this.searchTerm$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => this.searchService.search(term)) // Flattens inner observable
  );
}

// Operator guide:
// - switchMap: Cancel previous, use latest (search, autocomplete)
// - mergeMap: Run all concurrently (independent requests)
// - concatMap: Run sequentially (order matters)
// - exhaustMap: Ignore new until current completes (button clicks)
```

**Best Practice 3: Combine Streams Declaratively**
```typescript
// ✅ CORRECT: Use combineLatest, forkJoin, zip
import { combineLatest, forkJoin } from 'rxjs';

export class GoodComponent {
  // combineLatest: Emit when ANY source emits
  viewModel$ = combineLatest([
    this.userService.getUser(),
    this.settingsService.getSettings()
  ]).pipe(
    map(([user, settings]) => ({ user, settings }))
  );
  
  // forkJoin: Wait for ALL to complete (like Promise.all)
  initialData$ = forkJoin([
    this.userService.getUser(),
    this.configService.getConfig()
  ]);
}
```

**Best Practice 4: Error Handling with catchError and retry**
```typescript
// ✅ CORRECT: Proper error handling
import { catchError, retry, of } from 'rxjs';

export class GoodComponent {
  users$ = this.userService.getUsers().pipe(
    retry(3), // Retry failed requests 3 times
    catchError(error => {
      this.logger.error('Failed to load users', error);
      return of([]); // Return fallback value
    })
  );
}
```

**Best Practice 5: Use takeUntilDestroyed for Cleanup**
```typescript
// ✅ CORRECT: Use takeUntilDestroyed (Angular 16+)
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class ModernComponent {
  private destroyRef = inject(DestroyRef);
  
  ngOnInit(): void {
    this.userService.getUsers().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(users => {
      // Automatically unsubscribed on component destroy
    });
  }
}
```

## Phase 4: Implementation Execution

### Step 7: File Generation Strategy

#### 7.1 Angular CLI Commands
**Generate files using discovered CLI patterns:**
```bash
# Standard Angular CLI
ng generate component components/[feature-name]
ng generate service services/[feature-name]
ng generate module modules/[feature-name]

# Nx CLI (if detected)
nx generate @nx/angular:component [feature-name] --project=[project-name]
nx generate @nx/angular:service [feature-name] --project=[project-name]

# Custom schematics (if detected)
ng generate @project-schematics:component [feature-name]
```

#### 7.2 File Structure Templates
**Create files based on discovered project structure:**

**Feature Module Structure:**
```
[feature-directory]/
├── components/
│   ├── [feature-name].component.ts
│   ├── [feature-name].component.html
│   ├── [feature-name].component.scss/.css
│   └── [feature-name].component.spec.ts
├── services/
│   ├── [feature-name].service.ts
│   └── [feature-name].service.spec.ts
├── models/
│   ├── [feature-name].model.ts
│   └── [feature-name].dto.ts
├── pipes/
│   └── [feature-name].pipe.ts
├── [feature-name].routing.ts
├── [feature-name].module.ts
└── index.ts
```

**Standalone Component Structure:**
```
[feature-directory]/
├── [feature-name].component.ts
├── [feature-name].component.html
├── [feature-name].component.scss/.css
├── [feature-name].component.spec.ts
├── services/
│   └── [feature-name].service.ts
└── models/
    └── [feature-name].model.ts
```

### Step 8: Code Implementation

#### 8.1 Implementation Checklist

**Pre-Implementation Checklist:**
- [ ] Project architecture analyzed and documented
- [ ] Existing patterns discovered and understood
- [ ] File structure determined based on project organization
- [ ] Dependencies identified and available
- [ ] Naming conventions confirmed
- [ ] Testing patterns understood

**Implementation Checklist:**
- [ ] Files generated using appropriate CLI commands
- [ ] Components follow discovered patterns (standalone/NgModule)
- [ ] Services follow dependency injection patterns
- [ ] Imports follow project conventions
- [ ] Styling uses project's approach (CSS/SCSS/Tailwind)
- [ ] Error handling follows project patterns
- [ ] Change detection strategy appropriate
- [ ] RxJS patterns consistent with project
- [ ] Tests follow discovered testing patterns

**Post-Implementation Checklist:**
- [ ] Code compiles without errors
- [ ] Tests pass successfully
- [ ] Linting passes project rules
- [ ] Build process completes successfully
- [ ] Integration with existing code verified
- [ ] Performance impact assessed
- [ ] Documentation updated if required

### Step 9: Testing Implementation

#### 9.1 Test Generation Templates

**Component Test Template:**
```typescript
describe('[FeatureName]Component', () => {
  let component: [FeatureName]Component;
  let fixture: ComponentFixture<[FeatureName]Component>;
  let [service]Mock: jasmine.SpyObj<[ServiceType]>;

  beforeEach(async () => {
    [service]Mock = jasmine.createSpyObj('[ServiceType]', ['[methodName]']);
    
    await TestBed.configureTestingModule({
      // Adjust based on testing framework and patterns
      imports: [
        // Component imports or testing module
      ],
      declarations: [[FeatureName]Component], // Remove if standalone
      providers: [
        { provide: [ServiceType], useValue: [service]Mock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent([FeatureName]Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should [expected behavior]', () => {
    // Test implementation based on component behavior
  });
});
```

**Service Test Template:**
```typescript
describe('[FeatureName]Service', () => {
  let service: [FeatureName]Service;
  let httpMock: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpMock = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
    
    TestBed.configureTestingModule({
      providers: [
        [FeatureName]Service,
        { provide: HttpClient, useValue: httpMock }
      ]
    });
    service = TestBed.inject([FeatureName]Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get[Resource]', () => {
    it('should return [resource] data', () => {
      const mockData = { /* mock data */ };
      httpMock.get.and.returnValue(of(mockData));

      service.get[Resource]().subscribe(data => {
        expect(data).toEqual(mockData);
      });

      expect(httpMock.get).toHaveBeenCalledWith('[expected-url]');
    });
  });
});
```

### Step 10: Integration and Verification

#### 10.1 Build and Test Commands
**Run commands based on discovered tools:**
```bash
# Build commands
[build-tool] build                    # ng build, nx build, etc.
[build-tool] build --configuration=production

# Test commands
[test-runner] test                    # ng test, jest, vitest, etc.
[test-runner] test --coverage
[test-runner] test --watch

# Lint commands
[lint-tool] lint                      # ng lint, nx lint, eslint, etc.

# E2E commands
[e2e-tool] e2e                        # ng e2e, playwright test, cypress run, etc.
```

#### 10.2 Integration Verification
**Verify implementation integration:**
- **Module Imports**: Ensure new modules are properly imported
- **Routing Integration**: Verify routes are configured correctly
- **Dependency Injection**: Check services are provided correctly
- **Micro-Frontend Integration**: Verify remote loading if applicable
- **API Integration**: Test API communication
- **State Integration**: Verify state management integration

## Phase 5: Quality Assurance

### Step 11: Code Quality Verification

#### 11.1 Static Analysis
**Run static analysis based on project tools:**
```bash
# TypeScript compilation
npx tsc --noEmit

# ESLint (if configured)
npx eslint src/

# Prettier check (if configured)
npx prettier --check src/

# Angular specific checks
ng build --aot
```

#### 11.2 Performance Analysis
**Check performance implications:**
- **Bundle Size Impact**: Analyze bundle size changes
- **Change Detection**: Verify optimal change detection strategies
- **Memory Usage**: Check for potential memory leaks
- **Load Performance**: Assess initial load impact

#### 11.3 Security Verification
**Perform security checks:**
- **Input Validation**: Verify proper input sanitization
- **XSS Prevention**: Check for XSS vulnerabilities
- **Authentication**: Verify proper authentication checks
- **Authorization**: Ensure proper authorization controls

### Step 12: Documentation and Knowledge Transfer

#### 12.1 Code Documentation
**Generate appropriate documentation:**
- **JSDoc Comments**: Add comprehensive JSDoc comments
- **README Updates**: Update relevant README files
- **API Documentation**: Document new API endpoints
- **Component Documentation**: Document component usage

#### 12.2 Pattern Documentation
**Document discovered and implemented patterns:**
- **Architecture Decisions**: Document architectural choices
- **Pattern Usage**: Document pattern applications
- **Integration Points**: Document integration requirements
- **Migration Notes**: Document any migration requirements

## Usage Examples

### Example 1: Component Feature Implementation
```
@angular-implement

Implement a user profile component with:
- Display user information
- Edit user details
- Profile picture upload
- Form validation
- Integration with existing user service
```

### Example 2: Service Feature Implementation
```
@angular-implement

Create a notification service with:
- Real-time notifications
- Push notification support
- Notification preferences
- WebSocket integration
- Browser notification API
```

### Example 3: Micro-Frontend Feature
```
@angular-implement

Implement a checkout micro-frontend with:
- Cart integration
- Payment processing
- Shipping options
- Order summary
- Module Federation setup
```

### Example 4: Shared Feature Implementation
```
@angular-implement

Create a shared data table component with:
- Sorting and filtering
- Pagination
- Column configuration
- Row selection
- Responsive design
```

## Integration with Development Workflow

### Pre-Development Integration
- **Project Analysis**: Automatic project structure analysis
- **Pattern Discovery**: Existing pattern identification
- **Tool Detection**: Development tool identification
- **Architecture Planning**: Implementation strategy planning

### During Development
- **Real-time Guidance**: Context-aware implementation suggestions
- **Pattern Enforcement**: Consistency with existing patterns
- **Quality Checks**: Continuous quality verification
- **Integration Validation**: Real-time integration testing

### Post-Development
- **Automated Testing**: Comprehensive test generation
- **Quality Analysis**: Code quality assessment
- **Performance Analysis**: Performance impact evaluation
- **Documentation Generation**: Automatic documentation creation

## Expected Outcomes

### Successful Implementation Indicators
- ✅ Code follows project's established patterns
- ✅ Integration with existing architecture seamless
- ✅ Tests pass and provide good coverage
- ✅ Build process completes successfully
- ✅ Performance impact minimal
- ✅ Security best practices followed
- ✅ Documentation comprehensive and accurate

### Quality Metrics
- **Code Consistency**: 95%+ adherence to project patterns
- **Test Coverage**: 80%+ coverage for new code
- **Build Success**: 100% successful builds
- **Performance**: <5% bundle size increase
- **Security**: No critical security vulnerabilities

---

## Quality Gate Checkpoint

Before finalizing implementation, submit for quality gate review:

### Pre-Submission Checklist
1. **Run automated validation**
   ```bash
   npm run quality-gate:automated
   ```

2. **Document implementation**
   - Architecture decisions made
   - Patterns followed
   - Integration points
   - Performance considerations

3. **Request quality gate review**
   ```
   @quality-gate Please review my Angular implementation
   
   **Feature**: [Feature description]
   
   **Changes Made:**
   - Components: [list]
   - Services: [list]
   - Models: [list]
   - Routes: [list]
   
   **Architecture Decisions:**
   - [Decision 1 and rationale]
   - [Decision 2 and rationale]
   
   **Testing:**
   - Unit test coverage: [%]
   - E2E tests: [scenarios]
   - Performance impact: [bundle size change]
   
   **Concerns:**
   - [Any edge cases or concerns]
   ```

4. **Address quality gate feedback**
   - Implement required changes
   - Resubmit if rejected
   - Get approval before merge

---

## Implementation Instructions

After creating this workflow file:

1. **Test Workflow**: Try using `@angular-implement` commands with various feature requests
2. **Customize Patterns**: Adapt pattern discovery to your specific project conventions
3. **Update Templates**: Modify implementation templates based on your project's specific needs
4. **Integrate with Tools**: Ensure integration with your specific build and testing tools
5. **Train Team**: Share workflow usage guidelines with development team
6. **Monitor Usage**: Track workflow effectiveness and gather feedback
7. **Continuous Improvement**: Update workflow based on usage patterns and feedback

This workflow provides comprehensive, adaptive Angular implementation guidance that automatically adjusts to your project's specific architecture, tools, and conventions while ensuring high-quality, maintainable code implementation.
