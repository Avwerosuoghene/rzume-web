---
name: Create Angular Service
description: Generate a new Angular service with proper patterns and tests
tags: [angular, service, generation]
---

# Create Angular Service Skill

This skill generates a complete Angular service following project standards.

## Steps

1. **Determine Service Type**
   - Ask: What type of service is needed?
     - State management service (BehaviorSubject pattern)
     - API/HTTP service
     - Utility service
     - Authentication service

2. **Create Service File**
   - Generate service TypeScript file with:
     - `@Injectable({ providedIn: 'root' })`
     - Use `inject()` function for dependencies
     - Implement appropriate pattern based on type
     - Add proper error handling
     - Include JSDoc comments

3. **Implement Service Pattern**
   - **State Service**: BehaviorSubject with shareReplay
   - **API Service**: HTTP methods with error handling
   - **Utility Service**: Pure functions
   - **Auth Service**: Token management and user state

4. **Create Test File**
   - Set up TestBed configuration
   - Mock HTTP calls if needed
   - Test all public methods
   - Test error scenarios
   - Test state updates (for state services)

5. **Update Barrel Exports**
   - Add service to `src/app/core/services/index.ts`
   - Ensure proper export structure

## Templates

### State Management Service
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private stateSubject = new BehaviorSubject<State>(initialState);
  
  state$: Observable<State> = this.stateSubject.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  
  get currentState(): State {
    return this.stateSubject.value;
  }
  
  updateState(newState: Partial<State>): void {
    this.stateSubject.next({
      ...this.currentState,
      ...newState
    });
  }
  
  resetState(): void {
    this.stateSubject.next(initialState);
  }
}
```

### API Service
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = 'api/endpoint';
  
  getData(): Observable<Data[]> {
    return this.http.get<Data[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }
  
  createData(data: CreateDataDto): Observable<Data> {
    return this.http.post<Data>(this.apiUrl, data).pipe(
      catchError(this.handleError)
    );
  }
  
  private handleError(error: any): Observable<never> {
    console.error('Service error:', error);
    return throwError(() => new Error('Operation failed'));
  }
}
```

### Service Test
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });
    
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch data', () => {
    const mockData = [{ id: '1', name: 'Test' }];
    
    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
    });
    
    const req = httpMock.expectOne('api/endpoint');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
```

## Checklist

- [ ] Service uses `providedIn: 'root'`
- [ ] Dependencies injected with `inject()`
- [ ] Proper error handling implemented
- [ ] State services use BehaviorSubject pattern
- [ ] HTTP services use ApiService wrapper
- [ ] Unit tests created
- [ ] Exported in services/index.ts
- [ ] JSDoc comments added

## Security Fixer Checkpoint

If the service required adding any new npm packages:

1. **Run security audit**: `npm run security:audit`
2. **If vulnerabilities found**, run: `npm run security:fix`
3. **If issues remain**, invoke: `@security-fixer Please verify security after adding [package] for [service name]`

## Quality Gate Checkpoint

Before finalizing service, request quality gate review:

```
@quality-gate Please review my service implementation

**Service**: [ServiceName]
**Type**: [State/API/Utility/Auth]
**Location**: [File path]

**Features Implemented:**
- [Feature 1]
- [Feature 2]

**Dependencies Added:**
- [Any new npm packages, or "None"]

**Security Check:**
- npm audit: [PASSED/FIXED via security-fixer]

**Testing:**
- Unit tests: [coverage %]
- Test scenarios: [list]
- Error handling: [scenarios covered]

**Concerns:**
- [Any concerns or questions]
```

**Next Steps:**
- Address quality gate feedback
- Get approval before integration
