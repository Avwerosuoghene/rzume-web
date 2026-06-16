---
trigger: glob
globs: ["**/*.service.ts"]
description: Service development patterns and best practices
---

# Service Development Patterns

## Service Structure

### Basic Service Template
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = inject(ConfigService).apiUrls.base;
  
  getData(): Observable<Data[]> {
    return this.http.get<Data[]>(`${this.apiUrl}/data`);
  }
}
```

## State Management Services

### BehaviorSubject Pattern (Required)
```typescript
@Injectable({
  providedIn: 'root'
})
export class StateService {
  private stateSubject = new BehaviorSubject<State>(initialState);
  
  // Public observable with shareReplay for performance
  state$ = this.stateSubject.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  
  // Getter for current value
  get currentState(): State {
    return this.stateSubject.value;
  }
  
  // Update methods
  updateState(newState: Partial<State>): void {
    this.stateSubject.next({
      ...this.currentState,
      ...newState
    });
  }
  
  // Reset method
  resetState(): void {
    this.stateSubject.next(initialState);
  }
}
```

### Pagination State Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class PaginationStateService {
  private paginationSubject = new BehaviorSubject<PaginatedData>({
    items: [],
    totalCount: 0,
    totalPages: 0,
    pageNumber: 1,
    pageSize: 10,
    hasPrevious: false,
    hasNext: false
  });
  
  pagination$ = this.paginationSubject.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  
  updatePagination(data: PaginatedData): void {
    this.paginationSubject.next(data);
  }
}
```

## HTTP Services

### API Service Pattern
```typescript
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.config.apiUrls.base}${endpoint}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }
  
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.config.apiUrls.base}${endpoint}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.config.apiUrls.base}${endpoint}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.config.apiUrls.base}${endpoint}`)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
```

### Feature Service Pattern
```typescript
@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  private api = inject(ApiService);
  private state = inject(JobApplicationStateService);
  
  getApplications(filter?: JobApplicationFilter): Observable<PaginatedItem<JobApplication>> {
    const params = this.buildParams(filter);
    return this.api.get<PaginatedItem<JobApplication>>('/job-applications', params)
      .pipe(
        tap(data => this.state.updateState(data)),
        catchError(error => {
          console.error('Failed to fetch applications', error);
          return throwError(() => error);
        })
      );
  }
  
  createApplication(data: CreateJobApplicationDto): Observable<JobApplication> {
    return this.api.post<JobApplication>('/job-applications', data);
  }
  
  updateApplication(id: string, data: UpdateJobApplicationDto): Observable<JobApplication> {
    return this.api.put<JobApplication>(`/job-applications/${id}`, data);
  }
  
  deleteApplication(id: string): Observable<void> {
    return this.api.delete<void>(`/job-applications/${id}`);
  }
  
  private buildParams(filter?: JobApplicationFilter): HttpParams {
    let params = new HttpParams();
    if (filter?.searchQuery) {
      params = params.set('search', filter.searchQuery);
    }
    if (filter?.status) {
      params = params.set('status', filter.status);
    }
    return params;
  }
}
```

## Utility Services

### Storage Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  setItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      sessionStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Failed to save to storage', error);
    }
  }
  
  getItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to retrieve from storage', error);
      return null;
    }
  }
  
  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }
  
  clear(): void {
    sessionStorage.clear();
  }
}
```

### Screen Manager Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class ScreenManagerService {
  private breakpointObserver = inject(BreakpointObserver);
  
  isMobile$ = this.breakpointObserver
    .observe(['(max-width: 598px)'])
    .pipe(
      map(result => result.matches),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  
  isTablet$ = this.breakpointObserver
    .observe(['(min-width: 599px) and (max-width: 949px)'])
    .pipe(
      map(result => result.matches),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  
  isDesktop$ = this.breakpointObserver
    .observe(['(min-width: 950px)'])
    .pipe(
      map(result => result.matches),
      shareReplay({ bufferSize: 1, refCount: true })
    );
}
```

## Authentication Services

### Auth Service Pattern
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private api = inject(ApiService);
  private storage = inject(StorageService);
  private router = inject(Router);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', credentials)
      .pipe(
        tap(response => {
          this.storage.setItem('access_token', response.accessToken);
          this.storage.setItem('refresh_token', response.refreshToken);
          this.currentUserSubject.next(response.user);
        })
      );
  }
  
  logout(): void {
    this.storage.removeItem('access_token');
    this.storage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
  
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storage.getItem<string>('refresh_token');
    return this.api.post<AuthResponse>('/auth/refresh', { refreshToken })
      .pipe(
        tap(response => {
          this.storage.setItem('access_token', response.accessToken);
        })
      );
  }
  
  isAuthenticated(): boolean {
    return !!this.storage.getItem('access_token');
  }
}
```

## Dialog/Modal Services

### Dialog Helper Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class DialogHelperService {
  private dialog = inject(MatDialog);
  
  openConfirmDialog(config: ConfirmDialogConfig): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: config
    });
    
    return dialogRef.afterClosed();
  }
  
  openInfoDialog(message: string, title?: string): void {
    this.dialog.open(InfoDialogComponent, {
      width: '400px',
      data: { message, title }
    });
  }
  
  openFormDialog<T>(component: any, data?: any): Observable<T> {
    const dialogRef = this.dialog.open(component, {
      width: '600px',
      data
    });
    
    return dialogRef.afterClosed();
  }
}
```

## Service Testing

### Service Test Template
```typescript
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
  
  it('should fetch data', () => {
    const mockData = [{ id: '1', name: 'Test' }];
    
    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
    });
    
    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
  
  it('should handle errors', () => {
    service.getData().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    
    const req = httpMock.expectOne('/api/data');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
```

## Best Practices

### Dependency Injection
- ✅ Use `inject()` function instead of constructor injection
- ✅ Use `providedIn: 'root'` for singleton services
- ✅ Avoid circular dependencies

### Error Handling
- ✅ Always handle HTTP errors
- ✅ Provide user-friendly error messages
- ✅ Log errors for debugging

### Performance
- ✅ Use `shareReplay` for shared observables
- ✅ Unsubscribe from observables when needed
- ✅ Avoid memory leaks

### Testing
- ✅ Mock HTTP calls with HttpTestingController
- ✅ Test error scenarios
- ✅ Test state updates
