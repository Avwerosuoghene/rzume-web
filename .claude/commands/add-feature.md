# Add New Feature

Complete workflow for adding an end-to-end feature to the Rzume Web application. Follow each phase in order.

## Phase 1 — Planning

Before writing any code, answer these questions:
1. What is the feature's purpose and which user stories does it fulfil?
2. What components are needed? (page/container vs presentation)
3. What services are needed? (state, API, utility)
4. What API endpoints does it require?
5. What state needs to be managed?
6. Does it need route guards?

## Phase 2 — Implementation Order

### 1. Models (`src/app/core/models/interface/`)
- Define TypeScript interfaces for all data structures
- Create enums for status values and constants
- Export via the folder's `index.ts` barrel

### 2. Services (`src/app/core/services/`)
- **State service** if shared state is needed (BehaviorSubject + shareReplay pattern)
- **API service** for backend calls, wrapping the existing `ApiService`
- Add unit tests for each service
- Export via `src/app/core/services/index.ts`

### 3. Components
- **Page component** in `src/app/pages/` — handles routing, coordinates children, owns service calls
- **Presentation components** in `src/app/components/` — pure UI, @Input/@Output only
- Every component: standalone, OnPush, takeUntil cleanup, semantic HTML, ARIA
- Add unit tests for each component

### 4. Routing (`src/app/core/models/constants/`)
- Add route path to `application.routes.enums.ts`
- Add lazy-loaded route to the appropriate routes file:
  ```typescript
  {
    path: 'feature-name',
    loadComponent: () => import('./feature/feature.component').then(m => m.FeatureComponent),
    canActivate: [AuthGuardService]  // if protected
  }
  ```

### 5. Styles
- Use `@import 'src/app/styles/variables'` and `@import 'src/app/styles/fonts'`
- Mobile-first: default styles → `@media (min-width: 599px)` → `@media (min-width: 950px)`
- Use `:host { display: block }` as the root rule

### 6. Tests
- Unit tests: all components and services, ≥ 80% coverage
- E2E: critical user journeys in Cypress (`cypress/e2e/`)

### 7. Integration
- Add navigation links / sidebar entry if needed
- Wire feature flags via `ConfigService` if applicable

## Phase 3 — Checklists

### Manual testing
- [ ] Works on mobile (0–598px)
- [ ] Works on tablet (599px+)
- [ ] Works on desktop (950px+)
- [ ] Loading states visible
- [ ] Error states visible
- [ ] Empty states visible
- [ ] Navigation works

### Code checklist
- [ ] OnPush change detection on every component
- [ ] `takeUntil(this.destroy$)` on every subscription
- [ ] No `any` types
- [ ] No `<div (click)>` — only `<button>` for actions
- [ ] Semantic HTML throughout
- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs linked to `<label>`
- [ ] Mobile-first SCSS
- [ ] Unit tests written and passing
- [ ] Exported via barrel `index.ts`

## Phase 4 — Quality Gate

Before marking the feature complete, run:
```bash
npm run quality-gate:automated
```

Then ask Claude to run `/quality-gate` for a full review.
