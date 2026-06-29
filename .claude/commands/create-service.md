# Create Angular Service

Generate a complete Angular service following Rzume project standards.

## Step 1 — Determine service type

| Type | Purpose | Pattern |
|------|---------|---------|
| **State** | Shared reactive state | BehaviorSubject + shareReplay |
| **API** | HTTP CRUD operations | Wraps `ApiService` |
| **Utility** | Pure helper logic | Stateless functions |
| **Auth** | Token/session management | BehaviorSubject + Router |
| **Dialog** | MatDialog helpers | `MatDialog` injection |

## Step 2 — Generate the service file

### State Management Service
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

interface FeatureState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

const initialState: FeatureState = { items: [], loading: false, error: null };

@Injectable({ providedIn: 'root' })
export class FeatureStateService {
  private stateSubject = new BehaviorSubject<FeatureState>(initialState);

  state$: Observable<FeatureState> = this.stateSubject.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  get currentState(): FeatureState {
    return this.stateSubject.value;
  }

  updateState(patch: Partial<FeatureState>): void {
    this.stateSubject.next({ ...this.currentState, ...patch });
  }

  resetState(): void {
    this.stateSubject.next(initialState);
  }
}
```

### API / Feature Service
```typescript
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from '@core/services';
import { FeatureStateService } from './feature-state.service';

@Injectable({ providedIn: 'root' })
export class FeatureService {
  private api = inject(ApiService);
  private state = inject(FeatureStateService);
  private readonly endpoint = '/feature-endpoint';

  getAll(filter?: FeatureFilter): Observable<PaginatedItem<Feature>> {
    return this.api.get<PaginatedItem<Feature>>(this.endpoint).pipe(
      tap(data => this.state.updateState({ items: data.data.items })),
      catchError(error => {
        this.state.updateState({ error: 'Failed to load data' });
        return throwError(() => error);
      })
    );
  }

  create(dto: CreateFeatureDto): Observable<Feature> {
    return this.api.post<Feature>(this.endpoint, dto);
  }

  update(id: string, dto: UpdateFeatureDto): Observable<Feature> {
    return this.api.put<Feature>(`${this.endpoint}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
```

## Step 3 — Generate the spec file

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { FeatureService } from './feature.service';
import { ApiService } from '@core/services';

describe('FeatureService', () => {
  let service: FeatureService;
  let mockApiService: jasmine.SpyObj<ApiService>;

  const mockItem = { id: '1', name: 'Test' };

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FeatureService,
        { provide: ApiService, useValue: mockApiService }
      ]
    });

    service = TestBed.inject(FeatureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch items', () => {
    mockApiService.get.and.returnValue(of({ data: { items: [mockItem] } }));
    service.getAll().subscribe(data => {
      expect(data.data.items).toEqual([mockItem]);
    });
    expect(mockApiService.get).toHaveBeenCalled();
  });

  it('should handle errors', () => {
    mockApiService.get.and.returnValue(throwError(() => new Error('Network error')));
    service.getAll().subscribe({
      next: () => fail('should have errored'),
      error: err => expect(err).toBeTruthy()
    });
  });
});
```

## Step 4 — Barrel export

Add to `src/app/core/services/index.ts`:
```typescript
export { FeatureService } from './feature/feature.service';
export { FeatureStateService } from './feature/feature-state.service';
```

## Completion Checklist
- [ ] `providedIn: 'root'`
- [ ] Dependencies injected via `inject()`
- [ ] Error handling on all HTTP calls
- [ ] State services use BehaviorSubject + shareReplay
- [ ] HTTP services use `ApiService` wrapper (not raw `HttpClient`)
- [ ] Unit tests cover happy path, error cases, and state updates
- [ ] Exported via `services/index.ts`
