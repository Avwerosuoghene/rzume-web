---
name: Add New Feature
description: Complete workflow for adding a new feature to the application
tags: [angular, feature, workflow]
---

# Add New Feature Skill

This skill guides you through adding a complete feature to the application.

## Planning Phase

1. **Understand Requirements**
   - What is the feature's purpose?
   - What user stories does it fulfill?
   - What are the acceptance criteria?

2. **Identify Components Needed**
   - Page components (routes)
   - Presentation components (UI)
   - Services (business logic)
   - Models (interfaces, enums)
   - Guards (if route protection needed)

3. **Plan Data Flow**
   - What API endpoints are needed?
   - What state needs to be managed?
   - How do components communicate?

## Implementation Phase

### 1. Create Models
```bash
# Location: src/app/core/models/interface/
# Create interfaces for data structures
```

**Steps:**
- Define TypeScript interfaces
- Create enums for constants
- Add to models/index.ts

### 2. Create Services
```bash
# Location: src/app/core/services/
# Create business logic services
```

**Steps:**
- Create state management service (if needed)
- Create API service for backend calls
- Add error handling
- Create unit tests
- Export in services/index.ts

### 3. Create Components
```bash
# Location: src/app/pages/ or src/app/components/
# Create UI components
```

**Steps:**
- Create page component (smart/container)
- Create presentation components (dumb)
- Implement OnPush change detection
- Add proper subscription cleanup
- Create component tests
- Export in index.ts

### 4. Add Routing
```bash
# Location: src/app/core/models/constants/
# Add route configuration
```

**Steps:**
- Add route enum to application.routes.enums.ts
- Add route configuration to appropriate routes file
- Implement lazy loading
- Add route guard if needed
- Test navigation

### 5. Add Styling
```bash
# Location: Component SCSS files
# Implement responsive styles
```

**Steps:**
- Use theme variables
- Follow mobile-first approach
- Implement responsive breakpoints
- Test on different screen sizes

### 6. Write Tests
```bash
# Create comprehensive test coverage
```

**Steps:**
- Unit tests for all components
- Unit tests for all services
- E2E tests for critical user flows
- Verify 80%+ code coverage

### 7. Integration
```bash
# Integrate feature into application
```

**Steps:**
- Add navigation links
- Update sidebar/menu if needed
- Add feature flags if applicable
- Test integration with existing features

## Testing Phase

### Manual Testing
- [ ] Feature works on mobile
- [ ] Feature works on tablet
- [ ] Feature works on desktop
- [ ] All user interactions work
- [ ] Error states display correctly
- [ ] Loading states display correctly
- [ ] Navigation works correctly

### Automated Testing
- [ ] All unit tests pass
- [ ] E2E tests pass
- [ ] Code coverage meets threshold
- [ ] No console errors
- [ ] No TypeScript errors

## Documentation Phase

1. **Update Documentation**
   - Add feature to README if needed
   - Document API endpoints
   - Document component usage
   - Add JSDoc comments

2. **Code Review Checklist**
   - [ ] Follows Angular standards
   - [ ] Uses OnPush change detection
   - [ ] Proper subscription cleanup
   - [ ] No memory leaks
   - [ ] Responsive design implemented
   - [ ] Accessibility considered
   - [ ] Tests written and passing
   - [ ] No hardcoded values
   - [ ] Error handling implemented

## Example: Adding Job Search Feature

### 1. Models
```typescript
// src/app/core/models/interface/job-search.models.ts
export interface JobSearchCriteria {
  keywords: string;
  location?: string;
  jobType?: JobType;
  salaryMin?: number;
  salaryMax?: number;
}

export interface JobSearchResult {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
}
```

### 2. Service
```typescript
// src/app/core/services/job-search.service.ts
@Injectable({ providedIn: 'root' })
export class JobSearchService {
  private api = inject(ApiService);
  
  searchJobs(criteria: JobSearchCriteria): Observable<JobSearchResult[]> {
    return this.api.post<JobSearchResult[]>('/jobs/search', criteria);
  }
}
```

### 3. Component
```typescript
// src/app/pages/main/job-search/job-search.component.ts
@Component({
  selector: 'app-job-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobSearchComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchService = inject(JobSearchService);
  
  results: JobSearchResult[] = [];
  
  onSearch(criteria: JobSearchCriteria): void {
    this.searchService.searchJobs(criteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => this.results = results);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 4. Route
```typescript
// Add to main-routes.ts
{
  path: 'job-search',
  loadComponent: () => import('./job-search/job-search.component')
    .then(m => m.JobSearchComponent)
}
```

## Quality Gate Checkpoint

Before considering this feature complete, request a quality gate review:

### Prepare for Quality Gate
1. **Document all changes made**
   - List all files created/modified
   - Describe implementation approach
   - Note any architectural decisions

2. **Run local validation**
   ```bash
   npm run quality-gate:automated
   ```

3. **Request quality gate review**
   ```
   @quality-gate Please review my implementation of [feature name]
   
   **Changes Made:**
   - Models: [list files]
   - Services: [list files]
   - Components: [list files]
   - Routes: [list changes]
   
   **Testing Done:**
   - Unit tests: [coverage %]
   - E2E tests: [scenarios covered]
   - Manual testing: [devices/browsers tested]
   
   **Potential Concerns:**
   - [Any concerns or edge cases you're unsure about]
   ```

4. **Address feedback**
   - Implement required changes from quality gate
   - Resubmit if rejected
   - Get final approval before merge

## Checklist

- [ ] Requirements understood
- [ ] Models created
- [ ] Services implemented
- [ ] Components created
- [ ] Routes configured
- [ ] Styles implemented
- [ ] Tests written
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] **Quality gate review requested**
- [ ] **Quality gate approved**
- [ ] Code review passed
