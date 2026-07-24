---
name: write-tests
description: >-
  Write the failing test first (TDD red step) for a bug fix or new feature in
  rzume_web — Jasmine/Karma for unit tests, Cypress for e2e. Use before /implement,
  never after. For a bug: writes the test that reproduces the reported failure. For a
  feature: derives tests from the feature spec's acceptance criteria. Detects whether a
  unit or e2e test is appropriate.
argument-hint: "[file/component/service to test, or describe the bug/feature]"
---

# Write Tests — TDD red step, rzume_web

**This runs before `/implement`, not after.** Write a test that fails for the right reason — a real
assertion failure demonstrating the missing/broken behavior, not a compile error — then hand off to
`/implement` to make it pass.

## Step 1: Bug fix or new feature?

- **Bug fix**: write the test that reproduces the reported failure *first*. Run it, confirm it
  fails with the same symptom the bug report describes (not a different error) — that's what
  proves the test actually targets the bug.
- **New feature**: derive tests from the feature spec's "Acceptance Criteria → Tests" section
  (from `/figma-feature-plan`) or from the plan's stated behavior if there's no Figma spec.

## Step 2: Unit (Jasmine/Karma) or e2e (Cypress)?

| Testing... | Use |
|---|---|
| A service method, a component's internal logic/state, a pipe/directive | Unit — Jasmine/Karma, `*.spec.ts` |
| A full user flow across pages (signup, login, navigating the dashboard) | E2E — Cypress, `*.cy.ts` in `cypress/e2e/` |

Playwright is installed (`playwright.config.ts` exists) but has no populated `tests/` directory and
no npm script pointing at it — **Cypress is the e2e tool actually in use here**. Don't add
Playwright specs without checking with the user first; that would be introducing a second e2e
stack, not continuing an existing one.

## Unit tests (Jasmine/Karma)

File location: sibling `.spec.ts`, not a separate `__tests__/` folder:
```
core/services/job-application.service.ts
core/services/job-application.service.spec.ts   ← same folder
```

**Service test** — real providers via `TestBed`, not manual instantiation:
```ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { JobApplicationService } from './job-application.service';

describe('JobApplicationService', () => {
  let service: JobApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JobApplicationService, ApiService, JobApplicationStateService]
    });
    service = TestBed.inject(JobApplicationService);
  });

  it('should <expected behavior> when <condition>', () => { ... });
});
```

**Component test** — standalone component goes in `imports:` (it's importable directly);
**injected services get mocked via `jasmine.createSpyObj` + DI substitution** — this is the
idiomatic Angular pattern here, not something to avoid the way mocking a React Context would be:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let mockAuthService: jasmine.SpyObj<AuthenticationService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['signup']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent, NoopAnimationsModule, HttpClientTestingModule],
      providers: [{ provide: AuthenticationService, useValue: authServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    fixture.detectChanges();
  });

  it('should <expected behavior> when <condition>', () => { ... });
});
```

**Testing Angular Material components**: use CDK test harnesses, not raw DOM queries, when one
exists for the component you're testing:

```ts
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';

const loader: HarnessLoader = TestbedHarnessEnvironment.loader(fixture);
const button = await loader.getHarness(MatButtonHarness.with({ text: 'Submit' }));
await button.click();
```

## E2E tests (Cypress)

File location: `cypress/e2e/<feature-area>/<flow>.cy.ts` (see `cypress/e2e/authentication/`).
Select elements via `data-cy` attributes, not brittle CSS selectors or text content where avoidable:

```ts
describe('User Signup Process', () => {
  it('should signup a user and send a validation link', () => {
    cy.visit('/auth/signup');
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('[data-cy="signup-terms-check"] input').click();
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/auth/email-confirmation');
  });
});
```

If the component under test doesn't have a `data-cy` attribute yet, that's a legitimate thing for
`/implement` to add — flag it in the test rather than falling back to a fragile selector.

## Naming

`'should <expected behavior> when <condition>'` — matches most of the existing suite
(`'should initialize signup form with validators'`, `'should validate email field'`). A bare
`'should create'`/`'should be created'` smoke test is fine as the first test in a new spec file,
but shouldn't be the *only* test for anything with real behavior.

## What NOT to mock

| Type | Mock? |
|---|---|
| Injected services (`AuthenticationService`, `GoogleAuthService`, `Router`, `MatDialog`) | Yes — `jasmine.createSpyObj` + DI `useValue` |
| `HttpClient` | Yes — `HttpClientTestingModule` |
| `BehaviorSubject` state services | Prefer real instance unless the test is specifically about the consuming component's reaction, not the state logic itself |
| `@ViewChild` references needed before `detectChanges()` | Existing tests assign a spy object cast `as any` before the first `detectChanges()` call — a pre-existing, narrow exception to `/typescript-standards`' `any` rule; match it for ViewChild mocking specifically, don't extend `any` elsewhere |
| Angular Material components | No — use real components + CDK harnesses |

## After writing

Run it and **confirm it fails** before handing off to `/implement`:
```bash
ng test --include='**/job-application.service.spec.ts'   # unit, single file
npx cypress run --spec 'cypress/e2e/authentication/signup.cy.ts'   # e2e, single file
```

A red test that fails for the wrong reason (syntax error, wrong file, wrong selector) isn't done —
fix the test itself until it fails on the actual missing behavior, then hand off:
"Implement against the failing test in `<path>` per `/implement`."

## What this skill does NOT cover

- **Making the test pass** → `/implement`
- **Component/service shape being tested** → `/angular-patterns`, `/rxjs-state-patterns`
