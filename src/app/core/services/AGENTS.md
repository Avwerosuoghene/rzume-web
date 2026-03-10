# Service Development Guidelines

When working with services in this directory:

## Service Architecture
- All services must use `providedIn: 'root'` for singleton pattern
- Use `inject()` function instead of constructor injection
- Services are the single source of truth for business logic
- Implement proper error handling for all operations

## Service Types

### State Management Services
- Use BehaviorSubject pattern for reactive state
- Expose observables with `shareReplay({ bufferSize: 1, refCount: true })`
- Provide getter methods for current state values
- Implement update and reset methods

### API/Data Services
- Wrap HTTP calls with proper error handling
- Return typed observables
- Use ApiService for HTTP operations
- Implement retry logic for failed requests

### Utility Services
- Keep services focused on single responsibility
- Provide pure utility functions
- No side effects in service methods
- Make services testable

## Service Pattern
```typescript
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  
  private dataSubject = new BehaviorSubject<Data[]>([]);
  data$ = this.dataSubject.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  
  getData(): Observable<Data[]> {
    return this.api.get<Data[]>('/endpoint').pipe(
      tap(data => this.dataSubject.next(data)),
      catchError(this.handleError)
    );
  }
  
  private handleError(error: any): Observable<never> {
    console.error('Service error:', error);
    return throwError(() => error);
  }
}
```

## Error Handling
- Always implement error handling for HTTP calls
- Provide user-friendly error messages
- Log errors for debugging
- Use `catchError` operator for observable error handling

## Performance
- Use `shareReplay` for shared observables
- Avoid memory leaks with proper cleanup
- Implement caching when appropriate
- Debounce frequent operations

## Testing
- Write unit tests for all services
- Mock HTTP calls with `HttpTestingController`
- Test error scenarios
- Test state updates
- Verify observable emissions

## Dependencies
- Minimize service dependencies
- Avoid circular dependencies
- Use dependency injection properly
- Keep services loosely coupled
