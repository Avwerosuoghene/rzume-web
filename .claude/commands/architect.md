# Web Architect — Feature Planning & Design

Strategic planning and architectural design for Rzume Web features. Use this before implementing any significant feature.

## Phase 1 — Discovery

### 1.1 Gather Requirements
Answer these before anything else:
- What business problem does this solve?
- Who are the primary users and what are their journeys?
- What are the acceptance criteria?
- Any performance, security, or accessibility constraints?
- Third-party integrations needed?

### 1.2 System Context
Map the feature into the existing system:
- Which bounded context does it belong to? (auth / jobs / profile / analytics)
- Which existing services does it touch?
- Does it need a new route under `/main`?
- Does it affect `AuthGuardService` or `ScreenManagerService`?
- Does it emit analytics events?

### 1.3 Domain Model
- Identify entities and value objects
- Define aggregates and boundaries
- List domain events

## Phase 2 — Architecture Design

### 2.1 Layered Architecture
```
Presentation Layer  →  Page Components (pages/)
                    →  Presentation Components (components/)
Abstraction Layer   →  Facade Services (optional, for complex features)
Core Layer          →  State Services + API Services (core/services/)
                    →  Models + Interfaces (core/models/)
```

### 2.2 Component Hierarchy
Draw out which components you need:
```
FeaturePageComponent  (src/app/pages/main/feature/)
  ├── FeatureToolbarComponent   (src/app/components/)
  ├── FeatureListComponent      (src/app/components/)
  │     └── FeatureCardComponent
  └── FeatureDialogComponent    (src/app/components/)
```

Classify each:
- **Smart** (page): handles routing, injects services, owns state
- **Dumb** (presentation): @Input / @Output only, zero service dependencies

### 2.3 Service Architecture
```
FeatureStateService   — BehaviorSubject, centralises feature state
FeatureService        — HTTP CRUD, delegates to ApiService
FeatureFacade         — (optional) simplifies complex orchestration
```

### 2.4 Data Models
```typescript
// Domain model
interface Feature { id: string; name: string; status: FeatureStatus; createdAt: Date; }

// DTOs
interface CreateFeatureDto { ... }
interface UpdateFeatureDto { ... }

// Enums
enum FeatureStatus { Active = 'active', Archived = 'archived' }

// State shape
interface FeatureState { items: Feature[]; selected: Feature | null; loading: boolean; error: string | null; }
```

### 2.5 Routing
```typescript
{
  path: 'feature',
  loadComponent: () => import('./feature/feature.component').then(m => m.FeatureComponent),
  canActivate: [AuthGuardService]
}
```

## Phase 3 — Technical Specification

### API Contracts
List all required backend endpoints:
```
GET    /api/features          → PaginatedItem<Feature>
POST   /api/features          → Feature
PUT    /api/features/:id      → Feature
DELETE /api/features/:id      → void
```

### State Shape & Updates
- Initial state
- Optimistic vs pessimistic updates
- Cache invalidation strategy
- Reset on navigation away?

### UI/UX Guidelines
- Loading: spinner or skeleton?
- Error: inline message or snackbar?
- Empty: illustration + CTA or simple text?
- Responsive layout per breakpoint

### Testing Strategy
- Unit: components (inputs/outputs/interactions), services (CRUD/state/errors)
- Integration: component ↔ service data flow
- E2E: full user journey in Cypress

## Phase 4 — Implementation Plan

### Task Breakdown
Produce an ordered list:
1. Models & interfaces
2. State service
3. API service
4. Presentation components
5. Page component
6. Routing
7. SCSS (mobile-first)
8. Unit tests
9. E2E tests
10. Integration into navigation

### Risk Assessment
- Technical risks (complexity, performance, third-party APIs)
- Timeline risks (dependencies, unknowns)
- Mitigation strategies

## Phase 5 — Deliverables

Produce a **Feature Design Document** with:
- Executive summary
- Component hierarchy diagram (ASCII is fine)
- Service architecture diagram
- Data model definitions
- API contracts
- State shape
- Routing changes
- Testing plan
- Implementation task list with order

## Architecture Validation Checklist
- [ ] Uses standalone components (no NgModules)
- [ ] OnPush on every component
- [ ] Modern control flow (@if, @for)
- [ ] Semantic HTML throughout
- [ ] ARIA requirements identified
- [ ] State managed via BehaviorSubject services
- [ ] Lazy-loaded routes
- [ ] Mobile-first responsive design
- [ ] 80%+ test coverage planned
- [ ] Security considered (input validation, auth guards)
- [ ] Analytics events identified
