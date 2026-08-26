# Test — Comprehensive Testing Workflow

Write or audit tests for Angular components and services following Rzume standards.

## Testing Pyramid

```
        /E2E\        — Cypress: critical user journeys
       /------\
      /Integration\  — Component ↔ Service data flow
     /------------\
    /  Unit Tests  \ — All components, services, helpers
```

Coverage targets: **≥ 80%** overall, **100%** on critical paths and all public APIs.

## Phase 1 — Plan

Before writing tests, answer:
- What is being tested? (component / service / helper / E2E flow)
- What are all the public methods and properties?
- What are the inputs / outputs / side-effects?
- What are the edge cases? (null, empty, large data, errors)
- What external dependencies need mocking?

## Phase 2 — Unit Tests

### Component Test Template
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ComponentNameComponent } from './component-name.component';
import { SomeService } from '@core/services';

describe('ComponentNameComponent', () => {
  let component: ComponentNameComponent;
  let fixture: ComponentFixture<ComponentNameComponent>;
  let mockService: jasmine.SpyObj<SomeService>;

  const mockData = { id: '1', name: 'Test Item' };

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('SomeService', ['getData', 'updateData']);

    await TestBed.configureTestingModule({
      imports: [ComponentNameComponent, NoopAnimationsModule],
      providers: [{ provide: SomeService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentNameComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    it('should create', () => expect(component).toBeTruthy());
    it('should have default values', () => {
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('Lifecycle', () => {
    it('should cleanup on destroy', () => {
      spyOn(component['destroy$'], 'next');
      component.ngOnDestroy();
      expect(component['destroy$'].next).toHaveBeenCalled();
    });
  });

  describe('Service Integration', () => {
    it('should load data on init', () => {
      mockService.getData.and.returnValue(of([mockData]));
      component.ngOnInit();
      fixture.detectChanges();
      expect(component.data).toEqual([mockData]);
    });

    it('should handle service errors', () => {
      mockService.getData.and.returnValue(throwError(() => new Error('fail')));
      component.ngOnInit();
      fixture.detectChanges();
      expect(component.errorMessage).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should emit event on action', () => {
      spyOn(component.actionEmitter, 'emit');
      component.performAction(mockData);
      expect(component.actionEmitter.emit).toHaveBeenCalledWith(mockData);
    });
  });

  describe('Conditional Rendering', () => {
    it('should show loader when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.loader')).toBeTruthy();
    });

    it('should show empty state when no data', () => {
      component.data = [];
      component.isLoading = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-empty-state')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic list element', () => {
      component.data = [mockData];
      fixture.detectChanges();
      const list = fixture.nativeElement.querySelector('ul, ol');
      expect(list).toBeTruthy('Expected <ul> or <ol>, not a <div> list');
    });

    it('should not use div as button', () => {
      fixture.detectChanges();
      const divButtons = fixture.nativeElement.querySelectorAll('div[click]');
      expect(divButtons.length).toBe(0);
    });

    it('should have aria-label on icon-only buttons', () => {
      fixture.detectChanges();
      fixture.nativeElement.querySelectorAll('button').forEach((btn: HTMLButtonElement) => {
        if (!btn.textContent?.trim()) {
          expect(btn.hasAttribute('aria-label')).toBeTrue();
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty array', () => { /* ... */ });
    it('should handle null values', () => { /* ... */ });
    it('should handle large datasets', () => { /* ... */ });
  });
});
```

### Service Test Template
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { FeatureService } from './feature.service';
import { ApiService } from '@core/services';

describe('FeatureService', () => {
  let service: FeatureService;
  let mockApi: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FeatureService, { provide: ApiService, useValue: mockApi }]
    });
    service = TestBed.inject(FeatureService);
  });

  it('should be created', () => expect(service).toBeTruthy());

  describe('HTTP Operations', () => {
    it('should fetch data', () => {
      const mockData = [{ id: '1' }];
      mockApi.get.and.returnValue(of({ data: { items: mockData } }));
      service.getAll().subscribe(r => expect(r.data.items).toEqual(mockData));
    });

    it('should handle errors', () => {
      mockApi.get.and.returnValue(throwError(() => new Error('Network')));
      service.getAll().subscribe({ error: err => expect(err).toBeTruthy() });
    });
  });

  describe('State Management', () => {
    it('should update state on fetch', (done) => {
      const items = [{ id: '1' }];
      mockApi.get.and.returnValue(of({ data: { items } }));
      service.getAll().subscribe();
      // Assert via the state service if applicable
      done();
    });
  });
});
```

## Phase 3 — E2E Tests (Cypress)

Location: `cypress/e2e/`

```typescript
describe('Feature E2E', () => {
  beforeEach(() => {
    cy.visit('/main/feature');
  });

  it('should display data', () => {
    cy.get('[data-cy="feature-list"]').should('be.visible');
    cy.get('[data-cy="feature-item"]').should('have.length.greaterThan', 0);
  });

  it('should show error on API failure', () => {
    cy.intercept('GET', '/api/features', { statusCode: 500, body: {} }).as('apiError');
    cy.visit('/main/feature');
    cy.wait('@apiError');
    cy.get('.error-message').should('be.visible');
  });

  it('should work on mobile viewport', () => {
    cy.viewport('iphone-x');
    cy.get('.feature-container').should('be.visible');
  });
});
```

## Phase 4 — Run and Verify

```bash
npm run test:ci        # unit tests + coverage report
npm run test:coverage  # open coverage report
npm run cy:open        # Cypress interactive
```

Coverage report: `coverage/rzume-web/index.html`

## Test Checklist

### Planning
- [ ] Test scope defined
- [ ] Mock data prepared
- [ ] Dependencies identified

### Unit Tests
- [ ] Component creation
- [ ] Initialization / default values
- [ ] Lifecycle cleanup (destroy$)
- [ ] Inputs / outputs
- [ ] Service integration (success + error)
- [ ] Loading / error / empty states
- [ ] User interactions
- [ ] Semantic HTML assertions
- [ ] ARIA accessibility assertions
- [ ] Edge cases (null, empty, large)

### E2E Tests
- [ ] Critical user journey covered
- [ ] Error states tested
- [ ] Responsive viewports tested

### Quality
- [ ] ≥ 80% coverage achieved
- [ ] All tests passing
- [ ] No console errors during tests
