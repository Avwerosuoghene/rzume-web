# Rzume Web — Claude Code Instructions

## Project Overview

**Rzume** is a job application tracking and resume management platform.

- **Framework**: Angular 18.2.0 (standalone components)
- **UI Library**: Angular Material 18.2.0
- **State Management**: Service-based with RxJS BehaviorSubjects (no NgRx)
- **Authentication**: Google OAuth + JWT tokens
- **Backend API**: REST API at `localhost:7103` (development)
- **Deployment**: Docker + Google Cloud Run (port 8080)
- **Analytics**: Mixpanel + Google Tag Manager

### Routing Structure
```
/ → /auth (redirect)
/auth — login, register, onboard, reset-password, request-pass-reset, email-confirmation
/main  — dashboard, profile-management  (protected by AuthGuardService)
```

### Key Services
`AuthenticationService`, `ApiService`, `StorageService`, `GoogleAuthService`, `JobApplicationService`, `JobApplicationStateService`, `SearchStateService`, `ScreenManagerService`, `LoaderService`, `AnalyticsService`

---

## Angular 18 Core Standards (Always Apply)

### Standalone Components — Required
- **Always use standalone components** — no NgModules, ever
- Do NOT explicitly set `standalone: true` (it is the default in Angular 18+)
- Import all dependencies directly in the component's `imports` array

### Change Detection — Required
- **Always use `ChangeDetectionStrategy.OnPush`** on every component
- Use `ChangeDetectorRef.markForCheck()` when triggering manual detection

### Dependency Injection — Required
- **Use `inject()` function**, not constructor injection
- Place all `inject()` calls at the top of the class body
- Services use `providedIn: 'root'` for singletons

### Template Syntax — Required
- **Modern control flow only**: `@if`, `@for`, `@switch` — never `*ngIf`, `*ngFor`, `*ngSwitch`
- Always include `track` in `@for`: `@for (item of items; track item.id)`
- Keep templates free of complex logic

### Semantic HTML — Required
| Need | Use |
|------|-----|
| Page regions | `<main>`, `<header>`, `<footer>`, `<nav>`, `<aside>` |
| Content groups | `<section>` (with heading), `<article>` (self-contained) |
| Lists | `<ul>` / `<ol>` + `<li>` — never `<div>` lists |
| Text content | `<p>`, `<h1>`–`<h6>`, `<time>`, `<address>` |
| Actions | `<button type="button">` — **never** `<div (click)>` |
| Navigation | `<a [routerLink]>` |
| Structural wrappers (no DOM) | `<ng-container>` |
| Reusable template fragments | `<ng-template #ref>` |
| Last resort only | `<div>` / `<span>` for purely presentational wrappers |

### Accessibility — Required
- All interactive elements must have an accessible name (visible text, `aria-label`, or `aria-labelledby`)
- Icon-only buttons **must** have `aria-label`; icons use `aria-hidden="true"`
- Dynamic regions use `aria-live="polite"` (or `"assertive"` for urgent updates)
- Form controls linked to `<label>` via `for`/`id` or `aria-labelledby`
- All `<img>` elements have `alt`; decorative images use `alt=""`
- Use `role` only when no native semantic element exists

### Subscription Management — Required
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { /* ... */ });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### Standard Component Shell
```typescript
@Component({
  selector: 'app-component-name',
  imports: [/* dependencies */],
  templateUrl: './component-name.component.html',
  styleUrl: './component-name.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentNameComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private someService = inject(SomeService);

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### State Management Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class FeatureStateService {
  private stateSubject = new BehaviorSubject<State>(initialState);
  state$ = this.stateSubject.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  get currentState(): State { return this.stateSubject.value; }
  updateState(patch: Partial<State>): void {
    this.stateSubject.next({ ...this.currentState, ...patch });
  }
}
```

---

## Code Quality Rules (Always Apply)

### TypeScript
- **No `any` type** — use `unknown` when type is uncertain
- Avoid implicit returns; no unused variables or imports
- No `console.log` in production code
- No hardcoded magic values — use named constants

### Angular Anti-Patterns (Prohibited)
- ❌ Default change detection
- ❌ Memory leaks (always unsubscribe)
- ❌ Direct DOM manipulation (use `Renderer2`)
- ❌ Business logic in templates
- ❌ NgModules
- ❌ `@HostBinding` / `@HostListener` (use the `host` object)
- ❌ `<div (click)>` for actions
- ❌ `<div>` / `<span>` where a semantic element exists
- ❌ Bare `<div>` wrappers for structural directives (use `<ng-container>`)
- ❌ Icon-only buttons without `aria-label`
- ❌ Form inputs without a linked `<label>`

### Component Design
- Max 300 lines per component file
- Max 3 levels of component nesting
- No tight coupling between components
- No duplicate code (DRY)

### Import Order
1. Angular core (`@angular/core`, `@angular/common`, etc.)
2. Angular common utilities
3. Third-party libraries
4. App core (`@core/...`)
5. App features
6. Relative imports

---

## Styling System

### SCSS Architecture
```
src/app/styles/
├── variables.scss   — colors, spacing, borders
├── fonts.scss       — font sizes, weights, typography mixins
└── mixins.scss      — responsive and utility mixins
```

Always `@import` variables and fonts at the top of component SCSS files.

### Responsive Breakpoints (Mobile-First)
```scss
/* Mobile default: 0–598px */
/* Tablet: */  @media (min-width: 599px) { }
/* Desktop: */ @media (min-width: 950px) { }
```

### Key Variables
```scss
// Colors
$primary-green: #4CAF50;  $error-color: #f44336;
$text-primary: #333333;   $text-secondary: #666666;
$background-white: #FFFFFF; $border-color: #E0E0E0;

// Spacing: $spacing-xs (4px) → $spacing-2xl (48px)
// Font sizes: $font-size-xs (10px) → $font-size-6xl (48px)
// Font weights: $font-weight-light (300) → $font-weight-extrabold (800)
```

### Component Style Pattern
```scss
@import 'src/app/styles/variables';
@import 'src/app/styles/fonts';

:host { display: block; padding: $spacing-md; }

.component-container { /* ... */ }
```

---

## Testing Requirements

- **Unit tests**: Jasmine + Karma — all components and services
- **E2E tests**: Cypress for flows, Playwright for cross-browser
- **Coverage target**: ≥ 80% (statements, branches, functions, lines)
- Mock all external dependencies with `jasmine.createSpyObj`
- Use `HttpClientTestingModule` for HTTP services
- Use `NoopAnimationsModule` to avoid animation timing issues
- Test inputs, outputs, loading/error/empty states, and edge cases

---

## Project File Conventions

| Artifact | Location | Naming |
|----------|----------|--------|
| Page components | `src/app/pages/` | `feature.component.ts` |
| Presentation components | `src/app/components/` | `widget.component.ts` |
| Services | `src/app/core/services/` | `feature.service.ts` |
| Models / interfaces | `src/app/core/models/interface/` | `feature.models.ts` |
| Enums | `src/app/core/models/` | `feature.enums.ts` |
| Constants | `src/app/core/models/constants/` | `feature.constants.ts` |
| Guards | `src/app/core/guards/` | `feature.guard.ts` |

Export everything through the folder's `index.ts` barrel file.

---

## Dependency Rules

- Prefer Angular ecosystem packages before adding external libraries
- Use exact or tilde (`~`) versions for Angular and testing packages
- Run `npm install <pkg>` for runtime deps, `npm install <pkg> --save-dev` for tooling
- Remove unused dependencies promptly

---

## Available Custom Commands

| Command | Purpose |
|---------|---------|
| `/add-feature` | End-to-end workflow for adding a new feature |
| `/create-component` | Generate a new Angular component with tests |
| `/create-service` | Generate a new Angular service with tests |
| `/architect` | Strategic feature planning & architectural design |
| `/quality-gate` | Run full quality gate validation |
| `/security-fix` | Detect and remediate npm security vulnerabilities |
| `/test` | Comprehensive testing workflow (unit + E2E) |
| `/code-review` | Security & quality code review |
| `/update-docs` | Synchronise README and documentation |

---

## Quality Gate Scripts

```bash
npm run quality-gate:full       # Full validation suite
npm run quality-gate:automated  # Type check + security audit
npm run lint                    # ESLint
npm run test:ci                 # Unit tests (headless + coverage)
npm run security:audit          # npm audit
npm run analyze-bundle          # Bundle size analysis
```
