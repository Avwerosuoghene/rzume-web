# Update Docs — Documentation Synchronisation

Review and synchronise the project's documentation with the current codebase state. This mirrors the Husky pre-commit doc-updater workflow.

## What to Update

### 1. `README.md`
Check and update the following sections if they are out of date:

**Project stats**
- Count components: `find src/app/components -name '*.component.ts' | wc -l`
- Count services: `find src/app/core/services -name '*.service.ts' | wc -l`
- Count pages: `find src/app/pages -name '*.component.ts' | wc -l`

**Feature list** — does it reflect all current routes and capabilities?

**Bundle size** — is the documented initial load still accurate?

**Setup instructions** — do `npm start`, `npm run build`, and `npm test` still work as described?

**Architecture overview** — does the component/service structure section match reality?

### 2. `CHANGELOG.md`
Add an entry for recent changes following this format:
```markdown
## [Unreleased]

### Added
- [New feature description]

### Changed
- [What changed and why]

### Fixed
- [Bug fixes]
```

### 3. Component JSDoc
For any new public components, ensure the class has a one-line JSDoc:
```typescript
/** Displays job application statistics with filtering capabilities. */
@Component({ ... })
export class JobStatsComponent { ... }
```

### 4. Service JSDoc
For new services:
```typescript
/** Manages job application state across the application using BehaviorSubject. */
@Injectable({ providedIn: 'root' })
export class JobApplicationStateService { ... }
```

## Process

1. Run the automated doc update script if it exists:
   ```bash
   npm run update-docs
   ```

2. Read `README.md` and compare its stats/feature list against the current codebase.

3. Identify any outdated or missing sections.

4. Edit `README.md` with accurate current information.

5. Add a `CHANGELOG.md` entry summarising recent work.

6. Add or update JSDoc on any new public APIs.

## Do Not

- Do not invent features that don't exist in the code
- Do not change API documentation without verifying the actual implementation
- Do not remove existing documented features without confirming they were removed from code
- Do not create new documentation files unless explicitly asked
