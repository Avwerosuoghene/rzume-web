---
trigger: manual
---

Workspace Structure
	•	Type: Single-package Angular workspace (private: true indicates it is not intended for publishing to npm).
	•	Framework: Angular 18 (core, material, cdk).
	•	Languages: TypeScript 5.5+.
	•	Execution Environment: Node.js (latest LTS recommended, minimum v18+ to align with Angular 18 and Playwright).
Dependency Management
	•	Dependencies:
	•	Core Angular packages: @angular/*.
	•	Authentication & JWT handling: @abacritt/angularx-social-login, @auth0/angular-jwt, jwt-decode, google-auth-library.
	•	RxJS for reactive programming.
	•	Zone.js for Angular’s change detection.
	•	DevDependencies:
	•	Angular CLI and build system (@angular-devkit/build-angular, @angular/cli).
	•	Testing tools: Jasmine, Karma, Cypress, Playwright.
	•	Bundling/analysis: source-map-explorer.
	•	TypeScript compiler and typings.
	•	Rules for Adding Dependencies:
	•	Use exact or tilde (~) versions for Angular and testing packages to maintain compatibility.
	•	Avoid duplication of dependencies already covered by Angular or RxJS.
	•	Run npm install <package> --save for runtime dependencies and npm install <package> --save-dev for tooling/testing.
	•	Remove unused dependencies promptly to reduce bundle size.
Conventions:
	•	Prefix E2E scripts with cy: (Cypress) or pw: (Playwright, when added).
	•	Keep script names short and descriptive.
	•	Do not override Angular CLI defaults unless necessary.
Tooling & Standards
	•	Build System: Angular CLI (ng).
	•	Testing:
	•	Unit Tests: Jasmine + Karma.
	•	E2E Tests: Cypress (cy:open) and Playwright (@playwright/test).
	•	Bundle Analysis: source-map-explorer used to monitor bundle size.
	•	Type Checking: TypeScript strict mode should be enabled in tsconfig.json.
	•	Code Style:
	•	Use Angular coding standards and official style guide.
	•	Ensure consistent formatting via IDE/Prettier (recommended even though not enforced in package.json).
Contribution Guidelines
	•	Adding Dependencies:
	•	Prefer Angular ecosystem packages before external libraries.
	•	Document why a new package is needed in the PR description.
	•	Scripts:
	•	Reuse existing CLI commands when possible.
	•	Add new scripts only if they provide significant developer productivity.
	•	Testing:
	•	Write unit tests for all new components and services.
	•	Use Cypress or Playwright for integration/E2E scenarios.
	•	Code Reviews:
	•	Ensure all builds and tests pass before merging.
	•	Run npm run analyze-bundle for large feature changes to monitor bundle impact.
Versioning & Release Rules
	•	Project Version: Currently 0.0.0 (pre-release).
	•	Versioning Scheme: Follow Semantic Versioning (SemVer) once released.
	•	MAJOR.MINOR.PATCH format.
	•	Breaking changes require a major version bump.
	•	Release Process:
	•	Ensure build, test, and analyze-bundle pass before tagging a release.
	•	Update changelog with notable changes.