---
name: rxjs-state-patterns
description: >-
  RxJS state management and subscription handling for rzume_web — the BehaviorSubject
  state-service pattern, when to use shareReplay, and how subscriptions get cleaned up.
  Use when adding a new piece of shared state, subscribing to a service observable from
  a component, or deciding how a subscription should be torn down. Use for state/data-flow
  decisions — for component shape use /angular-patterns, for TypeScript typing use
  /typescript-standards.
argument-hint: "[service or component name, or describe the state question]"
---

# RxJS State Patterns — rzume_web

## State service pattern

Shared state lives in a service, named `<Domain>StateService`, with a private `BehaviorSubject`
and a getter method returning `.asObservable()`:

```ts
@Injectable({ providedIn: 'root' })
export class JobApplicationStateService {
  private initialState: PaginatedItem<JobApplicationItem> = { ...defaults };
  private state$ = new BehaviorSubject<PaginatedItem<JobApplicationItem>>(this.initialState);

  getApplications() {
    return this.state$.asObservable();
  }

  updateState(updatedState: PaginatedItem<JobApplicationItem>) {
    this.state$.next(updatedState);
  }
}
```

Never expose the `BehaviorSubject` itself — only `.asObservable()`. State only changes through a
named update method, never by a consumer calling `.next()` directly on something you exposed.

## Derived/hot observables: `shareReplay`

When an observable is derived from a source that shouldn't be re-subscribed per consumer (e.g. a
`fromEvent` listener), share it with a replay buffer of 1 so late subscribers get the current value
without re-attaching a new listener:

```ts
private isMobile = new BehaviorSubject<boolean>(this.getIsMobile(window.innerWidth));
public isMobile$: Observable<boolean> = this.isMobile.asObservable().pipe(
  shareReplay({ bufferSize: 1, refCount: true })
);
```

## Subscription cleanup

Two patterns exist in this codebase. **`takeUntil` + `Subject<void>` is the dominant one (used in
~9 files vs. 2 for the Subscription-bag approach below) — default to it for new code:**

```ts
export class ScreenManagerService implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor() {
    fromEvent(window, 'resize').pipe(
      debounceTime(200),
      takeUntil(this.destroy$)
    ).subscribe(() => { ... });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

The minority pattern — a `Subscription` bag — still appears in a couple of components and is fine
to match if you're editing one of those files, just don't introduce it fresh:

```ts
private subscriptions = new Subscription();

ngOnInit(): void {
  this.subscriptions.add(this.uiState.isMobile$.subscribe(isMobile => { ... }));
}

ngOnDestroy(): void {
  this.subscriptions.unsubscribe();
}
```

**Rule: match whichever pattern the file you're editing already uses.** For a brand-new
file/service, use `takeUntil`.

`takeUntilDestroyed()`/`DestroyRef` (Angular's newer, signal-era cleanup helper) is not used
anywhere in this codebase yet. It's a reasonable modernization, but don't introduce it unprompted —
that's a repo-wide convention change, not a per-file decision.

## Async pipe vs. manual subscribe

Manual `.subscribe()` in the component class (paired with the cleanup pattern above) is the norm
here — the `| async` pipe appears in only a handful of templates. Prefer `| async` when a value is
purely for template rendering and needs no side effect in the component class; use manual subscribe
when the emitted value needs to drive component-class logic (as in the `job-stats` example, where
`isMobile` changing triggers rebuilding an array). Don't force a manual subscription into an async
pipe (or vice versa) just for consistency — pick based on whether the value only feeds the template.

## What this skill does NOT cover

- **Component declaration, `OnPush`, folder structure** → `/angular-patterns`
- **How the emitted types should be named/shaped** → `/typescript-standards`
