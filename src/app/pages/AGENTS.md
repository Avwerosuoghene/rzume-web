# Page Component Guidelines

When working with page components in this directory:

## Page Component Architecture
- Page components are **smart/container components**
- They orchestrate multiple child components
- Handle routing and navigation
- Manage page-level state and service coordination
- Use `ChangeDetectionStrategy.OnPush`

## Responsibilities
- Route handling and parameter extraction
- Service orchestration and data fetching
- State management coordination
- Layout composition
- Child component coordination
- Error handling and loading states

## Component Pattern
```typescript
@Component({
  selector: 'app-page-name',
  standalone: true,
  imports: [/* child components, services */],
  templateUrl: './page-name.component.html',
  styleUrl: './page-name.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNameComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private service = inject(DataService);
  private cdr = inject(ChangeDetectorRef);
  
  ngOnInit(): void {
    this.loadData();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Subscription Management
- Always implement `OnDestroy` lifecycle hook
- Use `takeUntil(this.destroy$)` pattern for subscriptions
- Complete all subjects in `ngOnDestroy`

## State Management
- Subscribe to state services using `takeUntil` pattern
- Use `shareReplay({ bufferSize: 1, refCount: true })` for shared observables
- Trigger change detection with `markForCheck()` when needed

## Routing
- Define routes in feature route files
- Use lazy loading for feature modules
- Implement route guards for protected pages
- Extract route parameters in `ngOnInit`

## Layout Structure
- Use semantic HTML structure
- Implement responsive layouts (mobile-first)
- Handle loading and error states
- Provide empty states when no data

## Testing
- Test component initialization
- Test service integration
- Test route navigation
- Mock all service dependencies
- Test loading and error states
