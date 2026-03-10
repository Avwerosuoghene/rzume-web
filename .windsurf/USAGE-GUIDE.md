# Windsurf Configuration Usage Guide

Complete guide for working with skills, agents, and rules in the Rzume Web Angular project.

---

## Table of Contents

- [Overview](#overview)
- [Understanding the System](#understanding-the-system)
- [Working with Skills](#working-with-skills)
- [Working with Agents](#working-with-agents)
- [Working with Rules](#working-with-rules)
- [Practical Examples](#practical-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Windsurf configuration for this project consists of three main components:

1. **Skills** (`.windsurf/skills/`): Reusable workflows for common development tasks
2. **Agents** (`AGENTS.md` files): Directory-scoped guidance for specific contexts
3. **Rules** (`.windsurf/rules/`): Project-wide standards and patterns

These work together to provide intelligent, context-aware assistance throughout your development workflow.

---

## Understanding the System

### Architecture

```
┌─────────────────────────────────────────────────┐
│              Cascade AI Assistant                │
└─────────────────────────────────────────────────┘
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
┌───────────────┐          ┌───────────────┐
│  Always-On    │          │  Context-     │
│  Rules        │          │  Aware Rules  │
└───────────────┘          └───────────────┘
        ↓                           ↓
┌─────────────────────────────────────────────────┐
│           Directory AGENTS.md Files              │
│         (Auto-applied by location)               │
└─────────────────────────────────────────────────┘
        ↓                           ↓
┌───────────────┐          ┌───────────────┐
│  Skills       │          │  User         │
│  (Invoked)    │          │  Request      │
└───────────────┘          └───────────────┘
```

### How It Works

1. **Always-On Rules**: Applied to every Cascade prompt automatically
2. **Context-Aware Rules**: Applied based on file type or AI decision
3. **AGENTS.md Files**: Applied when working in specific directories
4. **Skills**: Invoked explicitly by user or when relevant to task

---

## Working with Skills

### Available Skills

| Skill | Purpose | Invocation |
|-------|---------|------------|
| **create-component** | Generate Angular component | `@create-component` |
| **create-service** | Generate Angular service | `@create-service` |
| **add-feature** | Complete feature workflow | `@add-feature` |
| **web-architect** | Feature planning & design | `@web-architect` |
| **tester** | Comprehensive testing | `@tester` |
| **code-reviewer** | Security & quality review | `@code-reviewer` |
| **doc-updater** | Documentation automation | `@doc-updater` |

### How to Invoke Skills

#### Method 1: Direct Invocation
```
@create-component
```
Then provide details when prompted.

#### Method 2: With Context
```
@create-component for user profile display
```

#### Method 3: In Natural Language
```
I need to create a new component for displaying user profiles
```
Cascade will recognize the task and suggest using the skill.

### Skill Usage Examples

#### Example 1: Creating a Component

**Request**:
```
@create-component
```

**Cascade Response**:
```
I'll help you create a new Angular component. Please provide:
1. Component name (e.g., user-profile)
2. Component type (page/presentation)
3. Location (src/app/components or src/app/pages)
```

**You Provide**:
```
Name: job-filter
Type: presentation
Location: src/app/components
```

**Cascade Creates**:
- `job-filter.component.ts` (with OnPush, standalone, proper structure)
- `job-filter.component.html` (with modern control flow)
- `job-filter.component.scss` (with theme variables)
- `job-filter.component.spec.ts` (with comprehensive tests)
- Updates `index.ts` barrel export

#### Example 2: Planning a Feature

**Request**:
```
@web-architect

I need to add a feature for exporting job applications to PDF
```

**Cascade Provides**:
1. **Requirements Analysis**
   - Feature scope
   - User stories
   - Acceptance criteria

2. **Architecture Design**
   - Component hierarchy
   - Service architecture
   - Data flow

3. **Technical Specification**
   - API contracts
   - State management
   - UI/UX guidelines

4. **Implementation Plan**
   - Task breakdown
   - Implementation order
   - Risk assessment

5. **Documentation**
   - Architecture Decision Records
   - Implementation guide

#### Example 3: Writing Tests

**Request**:
```
@tester

Write comprehensive tests for DashboardComponent
```

**Cascade Generates**:
- Component initialization tests
- Input/output tests
- Service integration tests
- User interaction tests
- Form validation tests
- Loading/error state tests
- Edge case tests
- Accessibility tests

#### Example 4: Code Review

**Request**:
```
@code-reviewer

Review the authentication service for security issues
```

**Cascade Analyzes**:
- OWASP Top 10 vulnerabilities
- XSS/CSRF protection
- Authentication flaws
- Token security
- Input validation
- Error handling
- Performance issues
- Code quality

**Cascade Provides**:
- Detailed review report
- Severity-categorized issues
- Fix recommendations with code examples
- OWASP/CWE references

#### Example 5: Updating Documentation

**Request**:
```
@doc-updater

Update documentation for recent changes
```

**Cascade Performs**:
1. Analyzes git diff
2. Parses commit messages
3. Generates changelog entry
4. Checks README quality
5. Updates CHANGELOG.md
6. Optimizes README.md if needed

---

## Working with Agents

### What Are Agents?

Agents are directory-scoped guidance files (`AGENTS.md`) that automatically apply when working in specific folders.

### Available Agents

| Location | Agent | Purpose |
|----------|-------|---------|
| `/` | Root Agent | Project-wide principles |
| `/src/app/components/` | Component Agent | Presentation component guidelines |
| `/src/app/pages/` | Page Agent | Page component guidelines |
| `/src/app/core/services/` | Service Agent | Service development guidelines |
| `/src/app/core/models/` | Models Agent | Types and interfaces guidelines |

### How Agents Work

Agents are **automatically applied** based on your current working directory. You don't need to invoke them.

#### Example: Working in Components Directory

When you're in `/src/app/components/` and ask:
```
Create a new card component
```

Cascade automatically applies the Component Agent, which ensures:
- ✅ Standalone component structure
- ✅ OnPush change detection
- ✅ Input/Output pattern (dumb component)
- ✅ No direct service dependencies
- ✅ Proper styling with theme variables
- ✅ Component-scoped SCSS

#### Example: Working in Services Directory

When you're in `/src/app/core/services/` and ask:
```
Create a notification service
```

Cascade automatically applies the Service Agent, which ensures:
- ✅ `providedIn: 'root'`
- ✅ `inject()` function for DI
- ✅ BehaviorSubject pattern for state
- ✅ Proper error handling
- ✅ Observable with shareReplay
- ✅ Comprehensive tests

### Viewing Agent Guidelines

To see what guidelines apply in a directory:

```
What are the guidelines for this directory?
```

Or open the `AGENTS.md` file directly:
- `@/AGENTS.md` (root)
- `@/src/app/components/AGENTS.md`
- `@/src/app/pages/AGENTS.md`
- `@/src/app/core/services/AGENTS.md`
- `@/src/app/core/models/AGENTS.md`

---

## Working with Rules

### What Are Rules?

Rules are project-wide standards that define coding patterns, best practices, and quality requirements.

### Rule Types

#### 1. Always-On Rules
Applied to **every** Cascade prompt:

- **`angular-core-standards.md`**: Core Angular 18 patterns
  - Standalone components
  - OnPush change detection
  - Modern control flow
  - Subscription management

- **`project-context.md`**: Project-specific information
  - Technology stack
  - Architecture patterns
  - Routing structure
  - State management

#### 2. Context-Aware Rules (Glob-Based)
Applied when working with specific file types:

- **`component-patterns.md`**: `*.component.ts|html|scss`
- **`service-patterns.md`**: `*.service.ts`
- **`testing-standards.md`**: `*.spec.ts`
- **`styling-standards.md`**: `*.scss`

#### 3. Model-Decision Rules
Applied when Cascade determines they're relevant:

- **`code-quality.md`**: Anti-patterns, best practices

### How Rules Are Applied

#### Automatic Application

When you edit a component file:
```typescript
// Editing: dashboard.component.ts
```

Cascade automatically applies:
1. `angular-core-standards.md` (always-on)
2. `project-context.md` (always-on)
3. `component-patterns.md` (glob match)
4. `/src/app/pages/AGENTS.md` (directory)

#### Manual Reference

You can explicitly reference rules:
```
Follow the component patterns from the rules
```

Or ask about them:
```
What are the testing standards for this project?
```

### Rule Enforcement

Rules ensure:
- ✅ Consistent code style
- ✅ Best practices followed
- ✅ Security standards met
- ✅ Performance optimized
- ✅ Tests comprehensive

---

## Practical Examples

### Example 1: Building a New Feature

**Scenario**: Add user profile management feature

**Step 1: Planning**
```
@web-architect

Plan a user profile management feature with:
- View profile
- Edit profile
- Upload avatar
- Change password
```

**Cascade provides**: Complete architecture and implementation plan

**Step 2: Create Models**
```
Create interfaces for user profile
```

**Cascade creates** (with Models Agent applied):
- `user-profile.models.ts`
- Proper TypeScript interfaces
- Enums for constants
- Exports in `index.ts`

**Step 3: Create Services**
```
@create-service for user profile management
```

**Cascade creates** (with Service Agent applied):
- `user-profile.service.ts`
- BehaviorSubject state management
- API integration
- Error handling
- Unit tests

**Step 4: Create Components**
```
@create-component for profile view page
```

**Cascade creates** (with Page Agent applied):
- `profile-view.component.ts`
- Smart component structure
- Service integration
- Proper lifecycle management
- Comprehensive tests

**Step 5: Write Tests**
```
@tester

Write tests for user profile feature
```

**Cascade generates**:
- Unit tests for all components
- Service tests
- Integration tests
- E2E test scenarios

**Step 6: Code Review**
```
@code-reviewer

Review the user profile feature
```

**Cascade analyzes**:
- Security vulnerabilities
- Bug detection
- Performance issues
- Code quality

**Step 7: Update Documentation**
```
@doc-updater

Update documentation for user profile feature
```

**Cascade updates**:
- CHANGELOG.md with new feature
- README.md with usage instructions

### Example 2: Fixing a Bug

**Scenario**: Memory leak in dashboard component

**Step 1: Code Review**
```
@code-reviewer

Check DashboardComponent for memory leaks
```

**Cascade identifies**:
```markdown
## High Priority Issues

### Memory Leak in DashboardComponent
- **File**: dashboard.component.ts:67
- **Issue**: Subscription not cleaned up
- **Risk**: Medium - Memory leak over time
- **Fix**: Implement proper cleanup

```typescript
// Add
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe();
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```
```

**Step 2: Apply Fix**
```
Fix the memory leak in DashboardComponent
```

**Cascade applies** the recommended fix with proper patterns

**Step 3: Write Test**
```
@tester

Add test to verify subscription cleanup
```

**Cascade creates**:
```typescript
it('should cleanup subscriptions on destroy', () => {
  spyOn(component['destroy$'], 'next');
  spyOn(component['destroy$'], 'complete');
  
  component.ngOnDestroy();
  
  expect(component['destroy$'].next).toHaveBeenCalled();
  expect(component['destroy$'].complete).toHaveBeenCalled();
});
```

**Step 4: Update Documentation**
```
@doc-updater
```

**Cascade updates**:
```markdown
## [Unreleased] - 2024-03-10

### Fixed
- **dashboard**: Fix memory leak from unmanaged subscription (#123)
```

### Example 3: Optimizing Performance

**Scenario**: Dashboard is slow

**Step 1: Code Review**
```
@code-reviewer

Analyze DashboardComponent for performance issues
```

**Cascade identifies**:
- Missing OnPush change detection
- Function calls in template
- No trackBy for *ngFor

**Step 2: Apply Optimizations**
```
Optimize DashboardComponent performance
```

**Cascade applies**:
1. Adds OnPush change detection
2. Converts template functions to computed properties
3. Adds trackBy functions
4. Optimizes subscriptions

**Step 3: Verify with Tests**
```
@tester

Add performance tests for DashboardComponent
```

**Cascade creates** tests to verify optimizations

---

## Best Practices

### 1. Skill Usage

#### Do's ✅
- Use `@skill-name` for explicit invocation
- Provide context with your request
- Let Cascade ask for clarification
- Review generated code before committing
- Use skills for repetitive tasks

#### Don'ts ❌
- Don't skip the planning phase (use `@web-architect`)
- Don't bypass code review (use `@code-reviewer`)
- Don't forget to update docs (use `@doc-updater`)
- Don't write tests manually (use `@tester`)

### 2. Agent Awareness

#### Do's ✅
- Understand which agent applies to your current directory
- Follow agent guidelines for consistency
- Reference agent patterns when asking questions
- Trust the agent to enforce standards

#### Don'ts ❌
- Don't fight against agent guidelines
- Don't create components in wrong directories
- Don't ignore agent recommendations

### 3. Rule Compliance

#### Do's ✅
- Follow always-on rules consistently
- Let rules guide your code structure
- Ask about rules when uncertain
- Use rules as learning resources

#### Don'ts ❌
- Don't violate TypeScript strict mode
- Don't use NgModules (standalone only)
- Don't skip OnPush change detection
- Don't forget subscription cleanup

### 4. Workflow Integration

#### Recommended Workflow

```
1. Plan Feature
   ↓ (@web-architect)
2. Create Models
   ↓ (Models Agent applies)
3. Create Services
   ↓ (@create-service + Service Agent)
4. Create Components
   ↓ (@create-component + Component/Page Agent)
5. Write Tests
   ↓ (@tester)
6. Code Review
   ↓ (@code-reviewer)
7. Update Documentation
   ↓ (@doc-updater)
8. Commit
   ↓ (Pre-commit hooks run)
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Skill Not Working as Expected

**Problem**: Skill doesn't generate what you need

**Solution**:
1. Provide more context in your request
2. Be specific about requirements
3. Let Cascade ask clarifying questions
4. Review the skill documentation

**Example**:
```
❌ Bad: @create-component

✅ Good: @create-component for displaying job statistics
with bar charts, located in src/app/components
```

#### Issue 2: Rules Conflict

**Problem**: Multiple rules seem to contradict

**Solution**:
1. Always-on rules take precedence
2. Check agent guidelines for directory-specific rules
3. Ask Cascade to clarify

**Example**:
```
What's the correct pattern for state management in services?
```

#### Issue 3: Agent Not Applying

**Problem**: Agent guidelines not being followed

**Solution**:
1. Verify you're in the correct directory
2. Check if AGENTS.md file exists
3. Explicitly reference the agent

**Example**:
```
Create a service following the service agent guidelines
```

#### Issue 4: Generated Code Doesn't Match Project

**Problem**: Code doesn't follow project patterns

**Solution**:
1. Check if rules are up to date
2. Verify project-context.md is accurate
3. Provide more context about project specifics

**Example**:
```
Create a component using our project's exact patterns
from the dashboard component
```

### Getting Help

#### Ask Cascade
```
How do I use the @web-architect skill?
What are the component patterns for this project?
Show me examples of the testing standards
```

#### Reference Documentation
```
Show me the AGENTS.md for this directory
What rules apply to service files?
Explain the pre-commit documentation workflow
```

#### Check Examples
```
Show me an example of a well-structured component
How should I structure a state management service?
What's the correct way to write integration tests?
```

---

## Quick Reference

### Skill Invocations

```bash
@create-component      # Generate component
@create-service        # Generate service
@add-feature          # Complete feature workflow
@web-architect        # Feature planning & design
@tester               # Comprehensive testing
@code-reviewer        # Security & quality review
@doc-updater          # Documentation automation
```

### Agent Locations

```bash
/AGENTS.md                           # Root agent
/src/app/components/AGENTS.md        # Component agent
/src/app/pages/AGENTS.md             # Page agent
/src/app/core/services/AGENTS.md     # Service agent
/src/app/core/models/AGENTS.md       # Models agent
```

### Rule Files

```bash
.windsurf/rules/angular-core-standards.md   # Always-on
.windsurf/rules/project-context.md          # Always-on
.windsurf/rules/component-patterns.md       # *.component.*
.windsurf/rules/service-patterns.md         # *.service.ts
.windsurf/rules/testing-standards.md        # *.spec.ts
.windsurf/rules/styling-standards.md        # *.scss
.windsurf/rules/code-quality.md             # Model-decision
```

### Common Commands

```bash
# View configuration
cat .windsurf/README.md

# View skill documentation
cat .windsurf/skills/[skill-name].md

# View agent guidelines
cat [directory]/AGENTS.md

# View rules
cat .windsurf/rules/[rule-name].md
```

---

## Summary

The Windsurf configuration provides:

1. **7 Skills** for common development tasks
2. **5 Agents** for directory-specific guidance
3. **7 Rules** for project-wide standards

Together, they ensure:
- ✅ Consistent code quality
- ✅ Best practices followed
- ✅ Security standards met
- ✅ Comprehensive testing
- ✅ Up-to-date documentation
- ✅ Optimized performance
- ✅ Maintainable codebase

**Remember**: The system is designed to help you, not hinder you. Use it as a guide and learning resource, and don't hesitate to ask Cascade for clarification or examples!

---

**Last Updated**: March 2026  
**For Questions**: Ask Cascade or check `.windsurf/README.md`
