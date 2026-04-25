---
name: Web Architect - Feature Planning & Design
description: Strategic feature planning, architectural design, and comprehensive technical documentation for Angular applications
tags: [architecture, planning, documentation, design, enterprise]
---

# Web Architect Skill

This skill provides enterprise-grade architectural planning and documentation for Angular features. It combines strategic design principles with tactical implementation planning to ensure scalable, maintainable solutions.

## Overview

The Web Architect skill operates at a high level of abstraction, focusing on:
- **Strategic Design**: Domain-driven design principles and bounded contexts
- **Architectural Patterns**: Layered architecture, abstraction layers, and separation of concerns
- **Technical Documentation**: Comprehensive design documents and implementation guides
- **System Integration**: How new features integrate with existing architecture
- **Quality Assurance**: Architecture validation and best practices enforcement

## Workflow Phases

### Phase 1: Discovery & Analysis

#### 1.1 Understand Feature Requirements
**Objective**: Gather comprehensive understanding of the feature

**Actions**:
- Review feature request and user stories
- Identify business objectives and success criteria
- Determine acceptance criteria
- Analyze user personas and use cases
- Identify constraints (technical, business, timeline)

**Questions to Ask**:
- What business problem does this feature solve?
- Who are the primary users of this feature?
- What are the critical user journeys?
- Are there any performance requirements?
- What are the security/privacy considerations?
- Are there any third-party integrations needed?

**Deliverable**: Feature Requirements Document

#### 1.2 System Context Analysis
**Objective**: Understand how the feature fits into the existing system

**Actions**:
- Review existing architecture documentation
  - Check `/system-architecture/rzume-system-architecture.md`
  - Review `/AGENTS.md` for architectural principles
  - Check component and service patterns
- Identify affected bounded contexts
- Map dependencies on existing services
- Identify potential integration points
- Analyze impact on current routing structure
- Review state management implications

**Reference Documents**:
- `@/system-architecture/rzume-system-architecture.md`
- `@/AGENTS.md`
- `@/.windsurf/rules/angular-core-standards.md`
- `@/.windsurf/rules/project-context.md`

**Deliverable**: System Context Map

#### 1.3 Domain Analysis
**Objective**: Define the domain model and bounded context

**Actions**:
- Identify domain entities and value objects
- Define aggregates and their boundaries
- Map domain events and workflows
- Identify ubiquitous language terms
- Define bounded context boundaries
- Create context mapping with existing contexts

**Deliverable**: Domain Model Diagram

### Phase 2: Architectural Design

#### 2.1 High-Level Architecture
**Objective**: Design the feature's architectural structure

**Design Considerations**:
- **Layered Architecture**:
  - Presentation Layer (Components)
  - Abstraction Layer (Facades/State Services)
  - Core Layer (Business Logic, API Services)
  
- **Separation of Concerns**:
  - Smart vs Dumb components
  - Service responsibilities
  - State management strategy
  
- **Data Flow**:
  - Unidirectional data flow
  - Reactive state management
  - Event-driven communication

**Architecture Patterns to Apply**:
```
Presentation Layer (Components)
    ↓ (delegates actions)
Abstraction Layer (Facades)
    ↓ (orchestrates)
Core Layer (Services, State, API)
    ↓ (communicates)
Backend API
```

**Deliverable**: High-Level Architecture Diagram

#### 2.2 Component Architecture
**Objective**: Design the component hierarchy and structure

**Design Elements**:
- **Page Components** (Smart/Container):
  - Route handling
  - State coordination
  - Service orchestration
  - Layout composition
  
- **Presentation Components** (Dumb):
  - Pure UI rendering
  - Input/Output driven
  - Reusable across features
  
- **Shared Components**:
  - Common UI elements
  - Form components
  - Utility components

**Component Design Pattern**:
```typescript
// Page Component (Smart)
@Component({
  selector: 'app-feature-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Coordinates child components and services
})

// Presentation Component (Dumb)
@Component({
  selector: 'app-feature-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Pure UI, Input/Output only
})
```

**Deliverable**: Component Hierarchy Diagram

#### 2.3 Service Architecture
**Objective**: Design service layer and state management

**Service Types**:
- **State Management Services**:
  - BehaviorSubject pattern
  - Centralized feature state
  - Observable streams with shareReplay
  
- **API Services**:
  - HTTP communication
  - Error handling
  - Data transformation
  
- **Facade Services**:
  - Abstraction layer
  - Component interface
  - Use case orchestration
  
- **Utility Services**:
  - Helper functions
  - Shared logic
  - Cross-cutting concerns

**State Management Pattern**:
```typescript
@Injectable({ providedIn: 'root' })
export class FeatureStateService {
  private stateSubject = new BehaviorSubject<State>(initialState);
  state$ = this.stateSubject.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
}

@Injectable({ providedIn: 'root' })
export class FeatureFacade {
  // Exposes high-level interface to components
  // Orchestrates state and API services
}
```

**Deliverable**: Service Architecture Diagram

#### 2.4 Data Model Design
**Objective**: Define interfaces, types, and data structures

**Design Elements**:
- **Domain Models**: Core business entities
- **DTOs**: Data transfer objects for API
- **View Models**: UI-specific data structures
- **Enums**: Constants and status values
- **Type Guards**: Runtime type validation

**Data Model Structure**:
```typescript
// Domain Model
export interface Feature {
  id: string;
  name: string;
  status: FeatureStatus;
  createdAt: Date;
}

// DTOs
export interface CreateFeatureDto { }
export interface UpdateFeatureDto { }
export interface FeatureResponseDto { }

// Enums
export enum FeatureStatus {
  Active = 'active',
  Inactive = 'inactive'
}
```

**Deliverable**: Data Model Documentation

#### 2.5 Routing & Navigation
**Objective**: Design routing structure and navigation flows

**Design Considerations**:
- Route hierarchy and nesting
- Lazy loading strategy
- Route guards and protection
- Route parameters and query params
- Navigation flows and user journeys

**Routing Pattern**:
```typescript
// Feature routes with lazy loading
{
  path: 'feature',
  loadComponent: () => import('./feature.component'),
  canActivate: [AuthGuardService],
  children: [
    { path: '', component: FeatureListComponent },
    { path: ':id', component: FeatureDetailComponent }
  ]
}
```

**Deliverable**: Routing Diagram & Navigation Flows

### Phase 3: Technical Specification

#### 3.1 API Integration Design
**Objective**: Define API contracts and integration patterns

**Specification**:
- **Endpoints**: List all required API endpoints
- **Request/Response Models**: Define data contracts
- **Error Handling**: Error scenarios and handling
- **Authentication**: Token management and security
- **Caching Strategy**: Data caching and invalidation

**API Contract Example**:
```typescript
// GET /api/features
Response: PaginatedItem<Feature>

// POST /api/features
Request: CreateFeatureDto
Response: Feature

// PUT /api/features/:id
Request: UpdateFeatureDto
Response: Feature

// DELETE /api/features/:id
Response: void
```

**Deliverable**: API Integration Specification

#### 3.2 State Management Design
**Objective**: Define state structure and management strategy

**State Design**:
- **State Shape**: Define state structure
- **State Updates**: Update patterns (optimistic/pessimistic)
- **State Synchronization**: Multi-component coordination
- **State Persistence**: Local storage considerations
- **State Reset**: Cleanup and reset strategies

**State Structure Example**:
```typescript
interface FeatureState {
  items: Feature[];
  selectedItem: Feature | null;
  filters: FeatureFilter;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
}
```

**Deliverable**: State Management Specification

#### 3.3 UI/UX Design Guidelines
**Objective**: Define UI patterns and user experience

**Design Guidelines**:
- **Layout Structure**: Page layouts and composition
- **Responsive Design**: Mobile, tablet, desktop breakpoints
- **Component Styling**: SCSS patterns and theme usage
- **User Interactions**: Click, hover, focus states
- **Loading States**: Skeleton loaders, spinners
- **Error States**: Error messages and recovery
- **Empty States**: No data scenarios

**Responsive Pattern**:
```scss
.feature-container {
  // Mobile (default)
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

**Deliverable**: UI/UX Design Specification

#### 3.4 Testing Strategy
**Objective**: Define comprehensive testing approach

**Testing Layers**:
- **Unit Tests**:
  - Component tests (inputs, outputs, interactions)
  - Service tests (state, API calls, error handling)
  - Utility function tests
  
- **Integration Tests**:
  - Component-service integration
  - State synchronization
  - API integration
  
- **E2E Tests**:
  - Critical user journeys
  - End-to-end workflows
  - Cross-browser testing

**Test Coverage Requirements**:
- Minimum 80% code coverage
- 100% coverage for critical paths
- All error scenarios tested
- All user interactions tested

**Deliverable**: Testing Strategy Document

### Phase 4: Implementation Planning

#### 4.1 Task Breakdown
**Objective**: Break down implementation into manageable tasks

**Task Categories**:
1. **Models & Types**:
   - Create interfaces
   - Define enums
   - Create DTOs
   
2. **Services**:
   - State management service
   - API service
   - Facade service
   - Utility services
   
3. **Components**:
   - Page components
   - Presentation components
   - Shared components
   
4. **Routing**:
   - Route configuration
   - Route guards
   - Navigation updates
   
5. **Styling**:
   - Component styles
   - Responsive design
   - Theme integration
   
6. **Testing**:
   - Unit tests
   - Integration tests
   - E2E tests

**Deliverable**: Detailed Task List with Estimates

#### 4.2 Implementation Order
**Objective**: Define optimal implementation sequence

**Recommended Order**:
1. **Foundation** (Bottom-up approach):
   - Create models and interfaces
   - Set up routing structure
   - Create core services (API, State)
   
2. **Abstraction Layer**:
   - Create facade services
   - Set up state management
   
3. **Presentation Layer**:
   - Create presentation components
   - Create page components
   - Implement layouts
   
4. **Integration**:
   - Connect components to services
   - Implement navigation
   - Add to main application
   
5. **Polish**:
   - Styling and responsive design
   - Error handling
   - Loading states
   
6. **Quality Assurance**:
   - Write tests
   - Code review
   - Performance optimization

**Deliverable**: Implementation Roadmap

#### 4.3 Dependencies & Risks
**Objective**: Identify dependencies and potential risks

**Dependencies**:
- External libraries or packages
- Backend API availability
- Design assets and mockups
- Third-party integrations
- Team member availability

**Risk Assessment**:
- **Technical Risks**: Complexity, performance, compatibility
- **Timeline Risks**: Dependencies, resource availability
- **Quality Risks**: Testing coverage, edge cases
- **Integration Risks**: API changes, breaking changes

**Mitigation Strategies**:
- Parallel development where possible
- Mock data for API development
- Incremental delivery
- Regular code reviews
- Automated testing

**Deliverable**: Risk Assessment & Mitigation Plan

### Phase 5: Documentation Generation

#### 5.1 Architecture Decision Records (ADRs)
**Objective**: Document key architectural decisions

**ADR Template**:
```markdown
# ADR-XXX: [Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?

## Alternatives Considered
What other options were evaluated?
```

**Deliverable**: Architecture Decision Records

#### 5.2 Implementation Guide
**Objective**: Create step-by-step implementation documentation

**Guide Sections**:
1. **Overview**: Feature summary and objectives
2. **Architecture**: High-level design and patterns
3. **Setup**: Prerequisites and dependencies
4. **Implementation Steps**: Detailed instructions
5. **Code Examples**: Reference implementations
6. **Testing**: Test scenarios and examples
7. **Deployment**: Deployment considerations
8. **Maintenance**: Ongoing maintenance notes

**Deliverable**: Comprehensive Implementation Guide

#### 5.3 API Documentation
**Objective**: Document all API interactions

**Documentation Elements**:
- Endpoint descriptions
- Request/response schemas
- Authentication requirements
- Error codes and handling
- Rate limiting considerations
- Example requests and responses

**Deliverable**: API Documentation

#### 5.4 Component Documentation
**Objective**: Document component usage and patterns

**Documentation Elements**:
- Component purpose and responsibility
- Input/output specifications
- Usage examples
- Styling guidelines
- Accessibility considerations
- Known limitations

**Deliverable**: Component Documentation

## Integration with Existing System

### Leveraging Project Resources

#### Use Existing Agents
When planning features, consult:
- `@/agents/analyst.md`: For system analysis
- `@/agents/feature-analyst.md`: For feature planning

#### Reference Architecture Documentation
- `@/system-architecture/rzume-system-architecture.md`: System overview
- `@/system-architecture/ANGULAR-PROJECT-SETUP-GUIDE.md`: Setup patterns
- `@/ANGULAR-COMPONENT-ARCHITECTURE-ANALYSIS.md`: Component patterns
- `@/ANGULAR-COMPONENT-DEVELOPMENT-GUIDE.md`: Development guide

#### Follow Established Patterns
- `@/.windsurf/rules/angular-core-standards.md`: Core standards
- `@/.windsurf/rules/component-patterns.md`: Component patterns
- `@/.windsurf/rules/service-patterns.md`: Service patterns
- `@/.windsurf/rules/testing-standards.md`: Testing patterns
- `@/.windsurf/rules/styling-standards.md`: Styling patterns

### Architecture Validation

#### Automated Validation
Ensure the design adheres to:
- ✅ Standalone components architecture
- ✅ OnPush change detection strategy
- ✅ Modern control flow syntax
- ✅ Proper subscription management
- ✅ Service-based state management
- ✅ Mobile-first responsive design
- ✅ 80%+ test coverage requirement

#### Manual Review Checklist
- [ ] Follows layered architecture pattern
- [ ] Maintains separation of concerns
- [ ] Uses established patterns and conventions
- [ ] Integrates with existing services
- [ ] Follows routing conventions
- [ ] Uses theme variables and typography
- [ ] Implements proper error handling
- [ ] Includes comprehensive tests
- [ ] Documents architectural decisions
- [ ] Considers performance implications
- [ ] Addresses security concerns
- [ ] Supports accessibility requirements

## Output Format

### Comprehensive Feature Design Document

```markdown
# Feature Design Document: [Feature Name]

## Executive Summary
Brief overview of the feature and its business value

## Requirements
- Business objectives
- User stories
- Acceptance criteria
- Constraints

## Architecture

### System Context
- Bounded context definition
- Integration points
- Dependencies

### High-Level Design
- Layered architecture diagram
- Component hierarchy
- Service architecture
- Data flow

### Technical Specifications
- Data models
- API contracts
- State management
- Routing structure

## Implementation Plan

### Task Breakdown
Detailed task list with estimates

### Implementation Order
Recommended sequence with dependencies

### Risk Assessment
Identified risks and mitigation strategies

## Testing Strategy
- Unit testing approach
- Integration testing plan
- E2E test scenarios
- Coverage requirements

## Documentation
- Architecture Decision Records
- API documentation
- Component documentation
- Implementation guide

## Appendices
- Diagrams
- Code examples
- Reference materials
```

## Best Practices

### Strategic Design Principles
1. **Domain-Driven Design**: Focus on business domains and bounded contexts
2. **Separation of Concerns**: Clear layer responsibilities
3. **Single Responsibility**: Each component/service has one job
4. **Open/Closed Principle**: Open for extension, closed for modification
5. **Dependency Inversion**: Depend on abstractions, not concretions

### Angular-Specific Patterns
1. **Standalone Components**: No NgModules
2. **OnPush Detection**: Performance optimization
3. **Reactive Programming**: RxJS and observables
4. **Facade Pattern**: Abstraction layer for components
5. **Smart/Dumb Components**: Clear component responsibilities

### Documentation Standards
1. **Clear and Concise**: Easy to understand
2. **Visual Diagrams**: Architecture and flow diagrams
3. **Code Examples**: Reference implementations
4. **Decision Rationale**: Explain the "why"
5. **Living Documentation**: Keep updated

## Example Usage

### Scenario: Adding Job Search Feature

**Phase 1: Discovery**
- Understand job search requirements
- Analyze integration with existing job application system
- Define domain model for job search

**Phase 2: Architecture**
- Design component hierarchy (search page, filters, results)
- Design service layer (search service, state service)
- Define data models (search criteria, results)

**Phase 3: Specification**
- Define API endpoints for job search
- Specify state management for search results
- Design responsive UI for search interface

**Phase 4: Planning**
- Break down into tasks (models, services, components)
- Define implementation order
- Identify dependencies (job board API integration)

**Phase 5: Documentation**
- Create ADR for search algorithm choice
- Write implementation guide
- Document API integration
- Create component usage guide

## Checklist

### Planning Phase
- [ ] Requirements fully understood
- [ ] System context analyzed
- [ ] Domain model defined
- [ ] Bounded context identified

### Design Phase
- [ ] High-level architecture designed
- [ ] Component hierarchy defined
- [ ] Service architecture specified
- [ ] Data models documented
- [ ] Routing structure planned

### Specification Phase
- [ ] API contracts defined
- [ ] State management designed
- [ ] UI/UX guidelines created
- [ ] Testing strategy documented

### Implementation Planning
- [ ] Tasks broken down
- [ ] Implementation order defined
- [ ] Dependencies identified
- [ ] Risks assessed

### Security Validation
- [ ] New dependencies security-audited (`npm run security:audit`)
- [ ] No critical/high production vulnerabilities
- [ ] Security Fixer Agent invoked if vulnerabilities found (`/security-fixer`)

### Documentation
- [ ] ADRs created
- [ ] Implementation guide written
- [ ] API documentation complete
- [ ] Component documentation ready

## Security Fixer Agent Integration

When the architectural design introduces new npm dependencies:

1. **During design phase**: Document all proposed dependencies and their security posture
2. **After implementation**: Run `npm run security:fix` to ensure no vulnerabilities were introduced
3. **If vulnerabilities are found**: Invoke the Security Fixer Agent:
   ```
   @security-fixer The web architect has proposed/added new dependencies for [feature].

   **New Dependencies:**
   - [package@version] — [purpose]

   **Architecture Context:**
   - [brief description of the feature]

   Please verify these dependencies are secure and fix any vulnerabilities.
   ```
4. **Alternative packages**: If a dependency has unfixable vulnerabilities, the architect should identify secure alternatives

---

**This skill ensures enterprise-grade architectural planning and comprehensive documentation for scalable, maintainable Angular features.**
