---
trigger: glob
globs: ["**/*.spec.ts", "**/test/**/*.ts"]
description: Testing standards and best practices for unit and E2E tests
---

# Testing Standards

## Unit Testing with Jasmine + Karma

### Test File Structure
```typescript
describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;
  let mockService: jasmine.SpyObj<ServiceName>;
  
  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ServiceName', ['method1', 'method2']);
    
    await TestBed.configureTestingModule({
      imports: [ComponentName],
      providers: [
        { provide: ServiceName, useValue: mockService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ComponentName);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Component Testing Patterns

#### Testing Inputs
```typescript
it('should accept and display input data', () => {
  const testData = { id: '1', name: 'Test' };
  component.data = testData;
  fixture.detectChanges();
  
  expect(component.data).toEqual(testData);
  const element = fixture.nativeElement.querySelector('.data-display');
  expect(element.textContent).toContain('Test');
});
```

#### Testing Outputs
```typescript
it('should emit event on action', () => {
  spyOn(component.actionEmitter, 'emit');
  
  component.performAction();
  
  expect(component.actionEmitter.emit).toHaveBeenCalledWith(expectedValue);
});
```

#### Testing Forms
```typescript
it('should validate form correctly', () => {
  const form = component.form;
  
  // Test invalid state
  expect(form.valid).toBeFalse();
  
  // Set valid values
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
```

#### Testing Service Integration
```typescript
it('should load data on init', () => {
  const mockData = [{ id: '1', name: 'Test' }];
  mockService.getData.and.returnValue(of(mockData));
  
  component.ngOnInit();
  fixture.detectChanges();
  
  expect(mockService.getData).toHaveBeenCalled();
  expect(component.data).toEqual(mockData);
});

it('should handle service errors', () => {
  const error = new Error('Service error');
  mockService.getData.and.returnValue(throwError(() => error));
  
  component.ngOnInit();
  fixture.detectChanges();
  
  expect(component.errorMessage).toBeTruthy();
  expect(component.isLoading).toBeFalse();
});
```

### Service Testing Patterns

#### HTTP Service Testing
```typescript
describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
  
  it('should fetch data successfully', () => {
    const mockData = { id: '1', name: 'Test' };
    
    service.getData('1').subscribe(data => {
      expect(data).toEqual(mockData);
    });
    
    const req = httpMock.expectOne('/api/data/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
  
  it('should handle HTTP errors', () => {
    service.getData('1').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    
    const req = httpMock.expectOne('/api/data/1');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
```

#### State Service Testing
```typescript
describe('StateService', () => {
  let service: StateService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StateService]
    });
    service = TestBed.inject(StateService);
  });
  
  it('should update state', (done) => {
    const newState = { value: 'test' };
    
    service.state$.subscribe(state => {
      expect(state).toEqual(newState);
      done();
    });
    
    service.updateState(newState);
  });
  
  it('should provide current state', () => {
    const newState = { value: 'test' };
    service.updateState(newState);
    
    expect(service.currentState).toEqual(newState);
  });
});
```

### Testing Observables

#### Testing with Marble Testing
```typescript
it('should debounce search input', () => {
  const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
  
  scheduler.run(({ cold, expectObservable }) => {
    const input$ = cold('a-b-c-d-e|');
    const expected = '------e|';
    
    const result$ = input$.pipe(debounceTime(50, scheduler));
    
    expectObservable(result$).toBe(expected);
  });
});
```

### Testing Async Operations

#### Using fakeAsync and tick
```typescript
it('should update after delay', fakeAsync(() => {
  component.delayedUpdate();
  
  expect(component.value).toBe('initial');
  
  tick(1000);
  
  expect(component.value).toBe('updated');
}));
```

#### Using async and whenStable
```typescript
it('should load data asynchronously', async(() => {
  mockService.getData.and.returnValue(of(mockData));
  
  component.ngOnInit();
  fixture.detectChanges();
  
  fixture.whenStable().then(() => {
    fixture.detectChanges();
    expect(component.data).toEqual(mockData);
  });
}));
```

## E2E Testing with Cypress

### Test Structure
```typescript
describe('Dashboard Page', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
    cy.login(); // Custom command
  });
  
  it('should display job applications', () => {
    cy.get('[data-testid="job-list"]').should('be.visible');
    cy.get('[data-testid="job-item"]').should('have.length.greaterThan', 0);
  });
  
  it('should filter jobs by status', () => {
    cy.get('[data-testid="status-filter"]').click();
    cy.get('[data-testid="status-pending"]').click();
    
    cy.get('[data-testid="job-item"]').each(($el) => {
      cy.wrap($el).should('contain', 'Pending');
    });
  });
});
```

### Custom Commands
```typescript
// cypress/support/commands.ts
Cypress.Commands.add('login', () => {
  cy.visit('/auth/login');
  cy.get('[data-testid="email-input"]').type('test@example.com');
  cy.get('[data-testid="password-input"]').type('password123');
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});
```

## Testing Best Practices

### General Guidelines
- ✅ Write tests before or alongside code (TDD/BDD)
- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Keep tests independent and isolated
- ✅ Mock external dependencies
- ✅ Test edge cases and error scenarios

### Coverage Requirements
- Minimum 80% code coverage
- 100% coverage for critical paths
- Test all public methods
- Test error handling
- Test edge cases

### Test Organization
```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => { });
  afterEach(() => { });
  
  describe('Initialization', () => {
    it('should create', () => { });
    it('should initialize with default values', () => { });
  });
  
  describe('User Interactions', () => {
    it('should handle button click', () => { });
    it('should validate form input', () => { });
  });
  
  describe('Service Integration', () => {
    it('should fetch data on init', () => { });
    it('should handle errors', () => { });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty data', () => { });
    it('should handle null values', () => { });
  });
});
```

### Mocking Strategies

#### Service Mocks
```typescript
const mockService = jasmine.createSpyObj('ServiceName', {
  method1: of(mockData),
  method2: throwError(() => new Error('Error'))
});
```

#### Router Mock
```typescript
const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};
```

#### ActivatedRoute Mock
```typescript
const mockActivatedRoute = {
  params: of({ id: '123' }),
  queryParams: of({ filter: 'active' })
};
```

### Test Data Management
```typescript
// test-data.ts
export const MOCK_USER = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User'
};

export const MOCK_JOB_APPLICATION = {
  id: '1',
  companyName: 'Test Company',
  position: 'Developer',
  status: 'pending'
};
```

## Debugging Tests

### Common Issues
- **Async timing**: Use `fakeAsync`, `tick`, or `async`/`await`
- **Change detection**: Call `fixture.detectChanges()` after changes
- **Observable subscriptions**: Ensure observables complete
- **Memory leaks**: Clean up subscriptions in `afterEach`

### Debugging Tools
```typescript
// Log component state
console.log('Component state:', component);

// Log fixture debug element
console.log('Debug element:', fixture.debugElement.nativeElement);

// Check for errors
fixture.detectChanges();
expect(fixture.debugElement.nativeElement.textContent).toContain('expected');
```

## Continuous Integration

### Test Scripts
```json
{
  "scripts": {
    "test": "ng test",
    "test:ci": "ng test --watch=false --browsers=ChromeHeadless --code-coverage",
    "test:coverage": "ng test --code-coverage",
    "e2e": "cypress run",
    "e2e:open": "cypress open"
  }
}
```

### Coverage Thresholds
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
