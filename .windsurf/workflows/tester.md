---
name: Tester - Comprehensive Testing Workflow
description: Complete testing workflow for Angular applications including unit tests, integration tests, and E2E tests with best practices
tags: [testing, jasmine, karma, cypress, quality-assurance, tdd]
---

# Tester Skill

This skill provides a comprehensive testing workflow for Angular applications, covering unit tests, integration tests, and end-to-end tests. It follows project-specific patterns and industry best practices to ensure high-quality, maintainable test coverage.

## Overview

The Tester skill operates across multiple testing layers:
- **Unit Testing**: Component, service, pipe, and helper function tests
- **Integration Testing**: Component-service integration and state management
- **E2E Testing**: User flows and critical paths with Cypress
- **Test Quality**: Coverage analysis, performance, and maintainability

## Testing Philosophy

### Test-Driven Development (TDD)
- Write tests before or alongside implementation
- Red-Green-Refactor cycle
- Tests as living documentation
- Confidence in refactoring

### Testing Pyramid
```
        /\
       /E2E\      <- Few, critical user journeys
      /------\
     /Integration\ <- Moderate, feature workflows
    /------------\
   /  Unit Tests  \ <- Many, fast, isolated
  /----------------\
```

### Coverage Requirements
- **Minimum**: 80% overall code coverage
- **Critical Paths**: 100% coverage
- **All Public APIs**: 100% coverage
- **Error Scenarios**: Comprehensive coverage

## Workflow Phases

### Phase 1: Test Planning & Analysis

#### 1.1 Understand Testing Scope
**Objective**: Determine what needs to be tested

**Questions to Answer**:
- What is being tested? (Component, Service, Feature, Flow)
- What are the critical functionalities?
- What are the edge cases and error scenarios?
- What are the dependencies?
- What user interactions need testing?
- What state changes occur?

**Analysis Checklist**:
- [ ] Identify all public methods/properties
- [ ] List all inputs and outputs
- [ ] Map all user interactions
- [ ] Document state changes
- [ ] Identify external dependencies
- [ ] List error scenarios
- [ ] Determine performance requirements

**Deliverable**: Test Plan Document

#### 1.2 Review Existing Patterns
**Objective**: Align with project testing standards

**Reference Documents**:
- `@/.windsurf/rules/testing-standards.md`: Testing patterns and standards
- `@/.windsurf/rules/angular-core-standards.md`: Angular patterns
- Existing test files in the project

**Project Testing Patterns**:
- Jasmine + Karma for unit tests
- Cypress for E2E tests
- `jasmine.createSpyObj` for mocking services
- `HttpClientTestingModule` for HTTP testing
- `NoopAnimationsModule` for animation testing
- BehaviorSubject patterns for state testing

**Deliverable**: Testing Strategy aligned with project standards

#### 1.3 Identify Test Data Requirements
**Objective**: Prepare mock data and fixtures

**Test Data Types**:
- **Mock Objects**: Simulated domain models
- **Mock Responses**: API response structures
- **Mock Services**: Service spy objects
- **Fixtures**: Reusable test data
- **Test Constants**: Shared test values

**Best Practices**:
- Create realistic test data
- Use factory functions for complex objects
- Maintain test data separately
- Reuse common fixtures
- Keep data minimal but representative

**Deliverable**: Test Data Fixtures

### Phase 2: Unit Testing

#### 2.1 Component Unit Tests

##### Test Structure Template
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ComponentName } from './component-name.component';
import { DependencyService } from '@core/services';

describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;
  let mockService: jasmine.SpyObj<DependencyService>;

  // Mock data
  const mockData = {
    id: '1',
    name: 'Test Item'
  };

  beforeEach(async () => {
    // Create service spy
    mockService = jasmine.createSpyObj('DependencyService', [
      'getData',
      'updateData',
      'deleteData'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ComponentName,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DependencyService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentName);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.isLoading).toBeFalse();
      expect(component.data).toEqual([]);
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should load data on init', () => {
      mockService.getData.and.returnValue(of([mockData]));
      
      component.ngOnInit();
      fixture.detectChanges();
      
      expect(mockService.getData).toHaveBeenCalled();
      expect(component.data).toEqual([mockData]);
    });

    it('should cleanup subscriptions on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Input Properties', () => {
    it('should accept and process input data', () => {
      component.inputData = mockData;
      fixture.detectChanges();
      
      expect(component.inputData).toEqual(mockData);
      
      const element = fixture.nativeElement.querySelector('.data-display');
      expect(element.textContent).toContain(mockData.name);
    });

    it('should handle null input gracefully', () => {
      component.inputData = null;
      fixture.detectChanges();
      
      expect(component.inputData).toBeNull();
      // Should not throw error
    });
  });

  describe('Output Events', () => {
    it('should emit event on action', () => {
      spyOn(component.actionEmitter, 'emit');
      
      component.performAction(mockData);
      
      expect(component.actionEmitter.emit).toHaveBeenCalledWith(mockData);
    });

    it('should emit event with correct payload', () => {
      let emittedValue: any;
      component.actionEmitter.subscribe((value: any) => {
        emittedValue = value;
      });
      
      component.performAction(mockData);
      
      expect(emittedValue).toEqual(mockData);
    });
  });

  describe('User Interactions', () => {
    it('should handle button click', () => {
      spyOn(component, 'handleClick');
      
      const button = fixture.nativeElement.querySelector('button');
      button.click();
      
      expect(component.handleClick).toHaveBeenCalled();
    });

    it('should update state on user input', () => {
      const input = fixture.nativeElement.querySelector('input');
      input.value = 'test value';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.inputValue).toBe('test value');
    });
  });

  describe('Form Validation', () => {
    it('should validate form correctly', () => {
      const form = component.form;
      
      // Invalid state
      expect(form.valid).toBeFalse();
      
      // Valid state
      form.patchValue({
        email: 'test@example.com',
        password: 'ValidPass123!'
      });
      
      expect(form.valid).toBeTrue();
    });

    it('should display validation errors', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      fixture.detectChanges();
      
      const errorElement = fixture.nativeElement.querySelector('.error-message');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Invalid email');
    });

    it('should disable submit when form is invalid', () => {
      component.form.patchValue({ email: '', password: '' });
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBeTrue();
    });
  });

  describe('Service Integration', () => {
    it('should load data successfully', () => {
      mockService.getData.and.returnValue(of([mockData]));
      
      component.loadData();
      fixture.detectChanges();
      
      expect(component.isLoading).toBeFalse();
      expect(component.data).toEqual([mockData]);
      expect(component.error).toBeNull();
    });

    it('should handle service errors', () => {
      const error = new Error('Service error');
      mockService.getData.and.returnValue(throwError(() => error));
      
      component.loadData();
      fixture.detectChanges();
      
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeTruthy();
      expect(component.data).toEqual([]);
    });

    it('should show loading state during data fetch', () => {
      mockService.getData.and.returnValue(of([mockData]));
      
      component.loadData();
      
      expect(component.isLoading).toBeTrue();
      
      fixture.detectChanges();
      
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('State Management', () => {
    it('should update component state', () => {
      const newState = { items: [mockData], loading: false };
      
      component.updateState(newState);
      
      expect(component.items).toEqual([mockData]);
      expect(component.loading).toBeFalse();
    });

    it('should trigger change detection on state update', () => {
      spyOn(component['cdr'], 'markForCheck');
      
      component.updateState({ items: [] });
      
      expect(component['cdr'].markForCheck).toHaveBeenCalled();
    });
  });

  describe('Conditional Rendering', () => {
    it('should display loading state', () => {
      component.isLoading = true;
      fixture.detectChanges();
      
      const loader = fixture.nativeElement.querySelector('.loader');
      expect(loader).toBeTruthy();
    });

    it('should display error state', () => {
      component.error = 'Error message';
      fixture.detectChanges();
      
      const errorElement = fixture.nativeElement.querySelector('.error');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Error message');
    });

    it('should display empty state', () => {
      component.data = [];
      component.isLoading = false;
      fixture.detectChanges();
      
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });

    it('should display data when available', () => {
      component.data = [mockData];
      component.isLoading = false;
      fixture.detectChanges();
      
      const dataElement = fixture.nativeElement.querySelector('.data-list');
      expect(dataElement).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty array', () => {
      component.processData([]);
      expect(component.result).toEqual([]);
    });

    it('should handle null values', () => {
      component.processData(null);
      expect(component.result).toBeNull();
    });

    it('should handle undefined values', () => {
      component.processData(undefined);
      expect(component.result).toBeUndefined();
    });

    it('should handle large datasets', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        name: `Item ${i}`
      }));
      
      component.processData(largeDataset);
      
      expect(component.result.length).toBe(1000);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      fixture.detectChanges();
      
      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('aria-label')).toBeTruthy();
    });

    it('should be keyboard navigable', () => {
      const input = fixture.nativeElement.querySelector('input');
      input.focus();
      
      expect(document.activeElement).toBe(input);
    });
  });
});
```

##### Component Testing Checklist
- [ ] Component creation test
- [ ] Initialization tests
- [ ] Input property tests
- [ ] Output event tests
- [ ] User interaction tests
- [ ] Form validation tests
- [ ] Service integration tests
- [ ] State management tests
- [ ] Conditional rendering tests
- [ ] Loading state tests
- [ ] Error state tests
- [ ] Empty state tests
- [ ] Edge case tests
- [ ] Accessibility tests

#### 2.2 Service Unit Tests

##### Service Test Template
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { DataService } from './data.service';
import { ApiService } from './api.service';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;
  let mockApiService: jasmine.SpyObj<ApiService>;

  const mockData = { id: '1', name: 'Test' };
  const apiUrl = '/api/data';

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DataService,
        { provide: ApiService, useValue: mockApiService }
      ]
    });

    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default state', () => {
      expect(service.currentState).toEqual(service['initialState']);
    });
  });

  describe('HTTP Operations', () => {
    it('should fetch data successfully', () => {
      mockApiService.get.and.returnValue(of([mockData]));

      service.getData().subscribe(data => {
        expect(data).toEqual([mockData]);
      });

      expect(mockApiService.get).toHaveBeenCalledWith(apiUrl);
    });

    it('should create data successfully', () => {
      mockApiService.post.and.returnValue(of(mockData));

      service.createData(mockData).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      expect(mockApiService.post).toHaveBeenCalledWith(apiUrl, mockData);
    });

    it('should update data successfully', () => {
      mockApiService.put.and.returnValue(of(mockData));

      service.updateData('1', mockData).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      expect(mockApiService.put).toHaveBeenCalledWith(`${apiUrl}/1`, mockData);
    });

    it('should delete data successfully', () => {
      mockApiService.delete.and.returnValue(of(void 0));

      service.deleteData('1').subscribe(() => {
        expect(true).toBeTrue();
      });

      expect(mockApiService.delete).toHaveBeenCalledWith(`${apiUrl}/1`);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors', () => {
      const error = new Error('HTTP Error');
      mockApiService.get.and.returnValue(throwError(() => error));

      service.getData().subscribe({
        next: () => fail('should have failed'),
        error: (err) => {
          expect(err).toBeTruthy();
        }
      });
    });

    it('should log errors', () => {
      spyOn(console, 'error');
      const error = new Error('Service error');
      mockApiService.get.and.returnValue(throwError(() => error));

      service.getData().subscribe({
        error: () => {
          expect(console.error).toHaveBeenCalled();
        }
      });
    });
  });

  describe('State Management', () => {
    it('should update state', (done) => {
      const newState = { items: [mockData] };

      service.state$.subscribe(state => {
        expect(state).toEqual(newState);
        done();
      });

      service.updateState(newState);
    });

    it('should provide current state', () => {
      const newState = { items: [mockData] };
      service.updateState(newState);

      expect(service.currentState).toEqual(newState);
    });

    it('should reset state', () => {
      service.updateState({ items: [mockData] });
      service.resetState();

      expect(service.currentState).toEqual(service['initialState']);
    });

    it('should emit state changes', (done) => {
      let emissionCount = 0;

      service.state$.subscribe(() => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(emissionCount).toBe(2);
          done();
        }
      });

      service.updateState({ items: [] });
      service.updateState({ items: [mockData] });
    });
  });

  describe('Caching', () => {
    it('should cache data', () => {
      mockApiService.get.and.returnValue(of([mockData]));

      service.getData().subscribe();
      service.getData().subscribe();

      // Should only call API once due to caching
      expect(mockApiService.get).toHaveBeenCalledTimes(1);
    });

    it('should invalidate cache', () => {
      mockApiService.get.and.returnValue(of([mockData]));

      service.getData().subscribe();
      service.invalidateCache();
      service.getData().subscribe();

      expect(mockApiService.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Business Logic', () => {
    it('should filter data correctly', () => {
      const data = [
        { id: '1', status: 'active' },
        { id: '2', status: 'inactive' }
      ];

      const filtered = service.filterByStatus(data, 'active');

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should transform data correctly', () => {
      const rawData = { id: 1, name: 'test' };
      const transformed = service.transformData(rawData);

      expect(transformed.id).toBe('1');
      expect(transformed.name).toBe('test');
    });
  });
});
```

##### Service Testing Checklist
- [ ] Service creation test
- [ ] HTTP GET operations
- [ ] HTTP POST operations
- [ ] HTTP PUT operations
- [ ] HTTP DELETE operations
- [ ] Error handling tests
- [ ] State management tests
- [ ] Caching tests
- [ ] Business logic tests
- [ ] Data transformation tests

#### 2.3 Helper/Utility Function Tests

##### Helper Test Template
```typescript
import { formatDate, calculateAge, validateEmail } from './helpers';

describe('Helper Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date, 'YYYY-MM-DD');
      
      expect(formatted).toBe('2024-01-15');
    });

    it('should handle invalid dates', () => {
      const result = formatDate(null, 'YYYY-MM-DD');
      
      expect(result).toBe('');
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = new Date('1990-01-01');
      const age = calculateAge(birthDate);
      
      expect(age).toBeGreaterThan(30);
    });

    it('should handle future dates', () => {
      const futureDate = new Date('2050-01-01');
      const age = calculateAge(futureDate);
      
      expect(age).toBe(0);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBeTrue();
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBeFalse();
    });

    it('should handle empty string', () => {
      expect(validateEmail('')).toBeFalse();
    });
  });
});
```

### Phase 3: Integration Testing

#### 3.1 Component-Service Integration

##### Integration Test Template
```typescript
describe('Component-Service Integration', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let jobService: JobApplicationService;
  let stateService: JobApplicationStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        JobApplicationService,
        JobApplicationStateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    jobService = TestBed.inject(JobApplicationService);
    stateService = TestBed.inject(JobApplicationStateService);
  });

  it('should load and display data from service', (done) => {
    const mockData = [{ id: '1', position: 'Developer' }];
    spyOn(jobService, 'getApplications').and.returnValue(of({
      success: true,
      data: { items: mockData }
    }));

    component.ngOnInit();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.applications).toEqual(mockData);
      const element = fixture.nativeElement.querySelector('.job-list');
      expect(element).toBeTruthy();
      done();
    });
  });

  it('should update state service on data change', () => {
    const mockData = [{ id: '1', position: 'Developer' }];
    spyOn(stateService, 'updateState');

    component.updateApplications(mockData);

    expect(stateService.updateState).toHaveBeenCalledWith(
      jasmine.objectContaining({ items: mockData })
    );
  });
});
```

#### 3.2 State Synchronization Tests

```typescript
describe('State Synchronization', () => {
  it('should sync state across components', () => {
    const stateService = TestBed.inject(StateService);
    const newState = { items: [{ id: '1' }] };

    stateService.updateState(newState);

    stateService.state$.subscribe(state => {
      expect(state).toEqual(newState);
    });
  });

  it('should handle concurrent state updates', (done) => {
    const stateService = TestBed.inject(StateService);
    let updateCount = 0;

    stateService.state$.subscribe(() => {
      updateCount++;
      if (updateCount === 3) {
        expect(updateCount).toBe(3);
        done();
      }
    });

    stateService.updateState({ items: [] });
    stateService.updateState({ items: [{ id: '1' }] });
    stateService.updateState({ items: [{ id: '1' }, { id: '2' }] });
  });
});
```

### Phase 4: End-to-End Testing (Cypress)

#### 4.1 E2E Test Structure

##### E2E Test Template
```typescript
describe('Feature Name E2E', () => {
  beforeEach(() => {
    cy.visit('/feature-path');
  });

  describe('User Journey: Complete Workflow', () => {
    it('should complete full user workflow', () => {
      // Step 1: Navigate to feature
      cy.url().should('include', '/feature-path');
      cy.get('h1').should('contain', 'Feature Title');

      // Step 2: Interact with form
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('SecurePass123!');

      // Step 3: Submit form
      cy.get('button[type="submit"]').click();

      // Step 4: Verify result
      cy.url().should('include', '/success');
      cy.get('.success-message').should('be.visible');
      cy.get('.success-message').should('contain', 'Success');
    });
  });

  describe('Form Validation', () => {
    it('should display validation errors', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="email"]').blur();

      cy.get('.error-message').should('be.visible');
      cy.get('.error-message').should('contain', 'Invalid email');
    });

    it('should disable submit when invalid', () => {
      cy.get('button[type="submit"]').should('be.disabled');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('SecurePass123!');

      cy.get('button[type="submit"]').should('not.be.disabled');
    });
  });

  describe('Data Loading', () => {
    it('should display loading state', () => {
      cy.intercept('GET', '/api/data', {
        delay: 1000,
        body: []
      }).as('getData');

      cy.visit('/feature-path');
      cy.get('.loader').should('be.visible');

      cy.wait('@getData');
      cy.get('.loader').should('not.exist');
    });

    it('should display data after loading', () => {
      cy.intercept('GET', '/api/data', {
        body: [{ id: '1', name: 'Test Item' }]
      }).as('getData');

      cy.visit('/feature-path');
      cy.wait('@getData');

      cy.get('.data-list').should('be.visible');
      cy.get('.data-item').should('have.length', 1);
      cy.get('.data-item').first().should('contain', 'Test Item');
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', () => {
      cy.intercept('GET', '/api/data', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getDataError');

      cy.visit('/feature-path');
      cy.wait('@getDataError');

      cy.get('.error-message').should('be.visible');
      cy.get('.error-message').should('contain', 'error');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile', () => {
      cy.viewport('iphone-x');
      cy.visit('/feature-path');

      cy.get('.mobile-menu').should('be.visible');
      cy.get('.desktop-menu').should('not.be.visible');
    });

    it('should work on tablet', () => {
      cy.viewport('ipad-2');
      cy.visit('/feature-path');

      cy.get('.content').should('be.visible');
    });

    it('should work on desktop', () => {
      cy.viewport(1920, 1080);
      cy.visit('/feature-path');

      cy.get('.desktop-menu').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.get('input[name="email"]').focus();
      cy.focused().should('have.attr', 'name', 'email');

      cy.focused().tab();
      cy.focused().should('have.attr', 'name', 'password');
    });

    it('should have proper ARIA labels', () => {
      cy.get('button[type="submit"]')
        .should('have.attr', 'aria-label');
    });
  });
});
```

##### Custom Cypress Commands
```typescript
// cypress/support/commands.ts
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('createJobApplication', (data: any) => {
  cy.get('[data-cy="add-job-button"]').click();
  cy.get('input[name="position"]').type(data.position);
  cy.get('input[name="company"]').type(data.company);
  cy.get('button[type="submit"]').click();
});
```

### Phase 5: Test Quality & Maintenance

#### 5.1 Code Coverage Analysis

##### Coverage Commands
```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html

# Check coverage thresholds
npm run test:ci
```

##### Coverage Requirements
```json
{
  "coverageReporter": {
    "check": {
      "global": {
        "statements": 80,
        "branches": 80,
        "functions": 80,
        "lines": 80
      }
    }
  }
}
```

#### 5.2 Test Performance

##### Performance Checklist
- [ ] Tests run in under 5 seconds (unit tests)
- [ ] No unnecessary `fixture.detectChanges()` calls
- [ ] Proper use of `fakeAsync` and `tick`
- [ ] Minimal DOM queries
- [ ] Reuse test setup where possible
- [ ] Parallel test execution enabled

##### Performance Optimization
```typescript
// Bad: Multiple detectChanges calls
it('should update', () => {
  component.value = 'test';
  fixture.detectChanges();
  expect(component.value).toBe('test');
  fixture.detectChanges();
  // Unnecessary second call
});

// Good: Single detectChanges call
it('should update', () => {
  component.value = 'test';
  fixture.detectChanges();
  expect(component.value).toBe('test');
});
```

#### 5.3 Test Maintainability

##### Maintainability Best Practices
- **DRY Principle**: Extract common setup to helper functions
- **Descriptive Names**: Use clear, descriptive test names
- **Single Responsibility**: One assertion per test (when possible)
- **Arrange-Act-Assert**: Follow AAA pattern
- **Test Data Builders**: Use factory functions for complex data

##### Test Helper Functions
```typescript
// test-helpers.ts
export function createMockJobApplication(overrides?: Partial<JobApplication>): JobApplication {
  return {
    id: '1',
    position: 'Developer',
    companyName: 'Tech Corp',
    status: ApplicationStatus.Applied,
    applicationDate: new Date(),
    ...overrides
  };
}

export function createMockApiResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    statusCode: 200,
    message: 'Success',
    data
  };
}

export function setupComponentTest<T>(
  component: Type<T>,
  providers: Provider[] = []
): { component: T; fixture: ComponentFixture<T> } {
  TestBed.configureTestingModule({
    imports: [component, NoopAnimationsModule],
    providers
  }).compileComponents();

  const fixture = TestBed.createComponent(component);
  return { component: fixture.componentInstance, fixture };
}
```

### Phase 6: Test Documentation

#### 6.1 Test Plan Document

```markdown
# Test Plan: [Feature Name]

## Overview
Brief description of what is being tested

## Scope
- Components to test
- Services to test
- User flows to test

## Test Strategy
- Unit tests: 80% coverage
- Integration tests: Critical paths
- E2E tests: Main user journeys

## Test Cases

### Unit Tests
1. Component initialization
2. Input/output handling
3. Form validation
4. Service integration
5. Error handling

### Integration Tests
1. Component-service integration
2. State synchronization
3. Data flow

### E2E Tests
1. User registration flow
2. Login flow
3. Main feature workflow

## Test Data
- Mock users
- Mock API responses
- Test fixtures

## Success Criteria
- All tests passing
- 80%+ code coverage
- No console errors
- Performance within limits
```

#### 6.2 Test Coverage Report

```markdown
# Test Coverage Report

## Summary
- **Statements**: 85%
- **Branches**: 82%
- **Functions**: 88%
- **Lines**: 85%

## Coverage by Module

### Components (90%)
- DashboardComponent: 95%
- HeaderComponent: 88%
- JobCardComponent: 92%

### Services (85%)
- JobApplicationService: 90%
- AuthenticationService: 85%
- StateService: 80%

### Helpers (95%)
- DateHelper: 100%
- ValidationHelper: 95%

## Uncovered Areas
- Error edge cases in AuthService
- Rare user interactions in Dashboard
- Legacy code in deprecated components

## Recommendations
1. Add tests for error scenarios
2. Increase integration test coverage
3. Add E2E tests for critical paths
```

## Integration with Project

### Leveraging Existing Patterns

#### Reference Testing Standards
- `@/.windsurf/rules/testing-standards.md`: Project testing patterns
- `@/.windsurf/rules/angular-core-standards.md`: Angular standards
- `@/.windsurf/rules/component-patterns.md`: Component patterns
- `@/.windsurf/rules/service-patterns.md`: Service patterns

#### Use Project Test Utilities
- Jasmine matchers and spies
- HttpClientTestingModule
- NoopAnimationsModule
- Custom test helpers

#### Follow Project Conventions
- Test file naming: `*.spec.ts`
- Test location: Co-located with source files
- Mock data: Realistic and minimal
- Test organization: Describe blocks by feature

### Test Automation

#### Continuous Integration
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:ci
      - run: npm run e2e:ci
```

#### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:changed",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

## Best Practices Summary

### Unit Testing
- ✅ Test one thing at a time
- ✅ Use descriptive test names
- ✅ Follow AAA pattern
- ✅ Mock all external dependencies
- ✅ Test edge cases and errors
- ✅ Keep tests fast and isolated

### Integration Testing
- ✅ Test component-service integration
- ✅ Test state synchronization
- ✅ Test data flow
- ✅ Use real services when appropriate
- ✅ Test critical user paths

### E2E Testing
- ✅ Test complete user journeys
- ✅ Use data-cy attributes for selectors
- ✅ Test on multiple viewports
- ✅ Mock external APIs
- ✅ Test error scenarios
- ✅ Keep tests independent

### Test Quality
- ✅ Maintain 80%+ coverage
- ✅ Keep tests maintainable
- ✅ Run tests fast
- ✅ Document test strategy
- ✅ Review test code
- ✅ Refactor tests with code

## Common Testing Patterns

### Testing Observables
```typescript
it('should emit values', (done) => {
  service.data$.subscribe(value => {
    expect(value).toEqual(expectedValue);
    done();
  });
});
```

### Testing Async Operations
```typescript
it('should handle async', fakeAsync(() => {
  component.loadData();
  tick(1000);
  expect(component.data).toBeTruthy();
}));
```

### Testing Forms
```typescript
it('should validate form', () => {
  component.form.patchValue({ email: 'test@test.com' });
  expect(component.form.valid).toBeTrue();
});
```

### Testing HTTP
```typescript
it('should call API', () => {
  service.getData().subscribe();
  const req = httpMock.expectOne('/api/data');
  expect(req.request.method).toBe('GET');
  req.flush(mockData);
});
```

## Checklist

### Planning Phase
- [ ] Test scope defined
- [ ] Test strategy documented
- [ ] Test data prepared
- [ ] Dependencies identified

### Unit Testing
- [ ] Component tests written
- [ ] Service tests written
- [ ] Helper tests written
- [ ] Edge cases covered
- [ ] Error scenarios tested

### Integration Testing
- [ ] Component-service integration tested
- [ ] State synchronization tested
- [ ] Data flow tested

### E2E Testing
- [ ] User journeys tested
- [ ] Critical paths covered
- [ ] Responsive design tested
- [ ] Accessibility tested

### Quality Assurance
- [ ] 80%+ code coverage achieved
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Tests documented
- [ ] CI/CD configured

---

## Quality Gate Checkpoint

After completing test implementation, submit for quality gate review:

### Pre-Submission Validation
1. **Run all tests**
   ```bash
   npm run test:coverage
   npm run e2e
   ```

2. **Verify coverage**
   ```bash
   # Check coverage report
   open coverage/rzume-web/index.html
   ```

3. **Request quality gate review**
   ```
   @quality-gate Please review my test implementation
   
   **Testing Scope**: [What was tested]
   
   **Coverage Achieved:**
   - Overall: [%]
   - Components: [%]
   - Services: [%]
   - Critical paths: [%]
   
   **Tests Written:**
   - Unit tests: [count]
   - Integration tests: [count]
   - E2E tests: [count]
   
   **Edge Cases Covered:**
   - [Edge case 1]
   - [Edge case 2]
   
   **Concerns:**
   - [Any testing gaps or concerns]
   ```

4. **Address feedback**
   - Add missing tests
   - Improve test quality
   - Get approval before finalizing

---

**This skill ensures comprehensive, maintainable, and high-quality test coverage for Angular applications following project standards and industry best practices.**
