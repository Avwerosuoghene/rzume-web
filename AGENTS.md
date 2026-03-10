# Rzume Web - Root Project Guidelines

## Project Overview
This is an Angular 18.2.0 application for job application tracking and resume management.

## Technology Stack
- **Framework**: Angular 18.2.0 (standalone components)
- **UI Library**: Angular Material
- **Language**: TypeScript 5.5+ (strict mode)
- **State Management**: Service-based with RxJS BehaviorSubjects
- **Styling**: SCSS with custom theme system
- **Testing**: Jasmine, Karma, Cypress, Playwright
- **Build**: Angular CLI
- **Deployment**: Docker + Google Cloud Run

## Core Architectural Principles

### 1. Standalone Components Only
- No NgModules anywhere in the application
- All components are standalone
- Import dependencies directly in component metadata

### 2. OnPush Change Detection
- Every component uses `ChangeDetectionStrategy.OnPush`
- Manual change detection with `ChangeDetectorRef.markForCheck()`
- Immutable data patterns

### 3. Modern Angular Patterns
- Use `inject()` function instead of constructor injection
- Use `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use signals for reactive state (when applicable)
- Class bindings instead of `ngClass`
- Style bindings instead of `ngStyle`

### 4. Subscription Management
- Always implement `OnDestroy` lifecycle hook
- Use `takeUntil(this.destroy$)` pattern
- Complete all subjects in `ngOnDestroy`
- No memory leaks

### 5. State Management
- Service-based state with BehaviorSubject pattern
- Use `shareReplay({ bufferSize: 1, refCount: true })` for performance
- No global state libraries (no NgRx)
- Centralized state services for shared data

## Project Structure

```
src/app/
├── components/          # Reusable presentation components
├── pages/              # Smart/container page components
├── core/               # Core application modules
│   ├── guards/         # Route guards
│   ├── interceptors/   # HTTP interceptors
│   ├── models/         # Interfaces, enums, constants
│   ├── services/       # Business logic services
│   └── helpers/        # Utility functions
└── styles/             # Global styles and themes
```

## Routing Architecture
- Two main route sections: `/auth` and `/main`
- `/main` routes are protected by `AuthGuardService`
- Lazy loading for feature routes
- Route configuration in `core/models/constants/`

## Styling Guidelines
- Mobile-first responsive design
- Breakpoints: 599px (tablet), 950px (desktop)
- SCSS variables in `src/app/styles/variables.scss`
- Typography system in `src/app/styles/fonts.scss`
- Component-scoped styles

## Testing Requirements
- Unit tests for all components and services
- Jasmine + Karma for unit tests
- Cypress for E2E tests
- Playwright for cross-browser testing
- Minimum 80% code coverage

## Build and Deployment
- Development: `npm start` (localhost:4200)
- Production build: `npm run build:prod`
- Docker deployment to Google Cloud Run
- Environment configuration via `config.json`

## Code Quality Standards
- TypeScript strict mode enabled
- No `any` types
- Proper error handling
- Comprehensive documentation
- Follow Angular style guide

## Performance Targets
- Initial bundle size: max 500KB
- OnPush change detection everywhere
- Lazy loading for routes
- Optimized images and assets
- Bundle analysis with `npm run analyze-bundle`

## Authentication
- Google OAuth + JWT tokens
- Session storage for tokens
- `AuthInterceptor` adds tokens to requests
- `AuthGuardService` protects routes
- Automatic token refresh

## Analytics
- Mixpanel for user behavior tracking
- Google Tag Manager for marketing
- Custom event tracking
- Privacy-compliant implementation
