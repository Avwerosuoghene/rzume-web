# Windsurf Configuration for Rzume Web

This directory contains comprehensive Windsurf AI configuration for the Rzume Web Angular application.

## 📁 Structure

```
.windsurf/
├── rules/                      # Workspace-level rules
│   ├── angular-core-standards.md    # Angular 18 core patterns (always_on)
│   ├── project-context.md           # Project-specific context (always_on)
│   ├── code-quality.md              # Code quality standards (model_decision)
│   ├── component-patterns.md        # Component development (glob: *.component.*)
│   ├── service-patterns.md          # Service development (glob: *.service.ts)
│   ├── testing-standards.md         # Testing patterns (glob: *.spec.ts)
│   └── styling-standards.md         # SCSS standards (glob: *.scss)
├── workflows/                  # Reusable workflows
│   ├── create-component.md          # Component generation workflow
│   ├── create-service.md            # Service generation workflow
│   ├── add-feature.md               # Complete feature workflow
│   ├── web-architect.md             # Enterprise architecture & planning
│   ├── tester.md                    # Comprehensive testing workflow
│   ├── code-reviewer.md             # Security & quality code review
│   ├── doc-updater.md               # Documentation & changelog automation
│   └── article-generator.md         # Technical article generation from commits
└── README.md                   # This file
```

## 🎯 Rules Overview

### Always-On Rules
These rules are included in every Cascade prompt:

- **angular-core-standards.md**: Core Angular 18 patterns
  - Standalone components (no NgModules)
  - OnPush change detection
  - Modern control flow (`@if`, `@for`, `@switch`)
  - `inject()` over constructor injection
  - Subscription management patterns

- **project-context.md**: Project-specific information
  - Technology stack
  - Routing structure
  - Core services
  - State management patterns
  - Styling system
  - API integration

### Context-Aware Rules (Glob-Based)
These rules activate when working with specific file types:

- **component-patterns.md**: Activates for `*.component.ts|html|scss`
- **service-patterns.md**: Activates for `*.service.ts`
- **testing-standards.md**: Activates for `*.spec.ts`
- **styling-standards.md**: Activates for `*.scss`

### Model-Decision Rules
These rules are applied when Cascade determines they're relevant:

- **code-quality.md**: Anti-patterns, best practices, code review checklist

## 📂 AGENTS.md Files

Directory-scoped guidance that automatically applies when working in specific folders:

- **Root `/AGENTS.md`**: Project-wide architectural principles
- **`/src/app/components/AGENTS.md`**: Presentation component guidelines
- **`/src/app/pages/AGENTS.md`**: Page component guidelines
- **`/src/app/core/services/AGENTS.md`**: Service development guidelines
- **`/src/app/core/models/AGENTS.md`**: Models and types guidelines

## 🛠️ Workflows

Reusable workflows for common tasks:

### Create Component
```
@create-component
```
Generates a complete Angular component with:
- Standalone component structure
- OnPush change detection
- Template with modern control flow
- SCSS with theme variables
- Unit tests
- Barrel exports

### Create Service
```
@create-service
```
Generates a service with:
- Proper dependency injection
- Error handling
- State management pattern (if applicable)
- Unit tests
- Barrel exports

### Add Feature
```
@add-feature
```
Complete workflow for adding a new feature:
- Planning phase
- Models creation
- Services implementation
- Components development
- Routing configuration
- Testing
- Documentation

### Web Architect
```
@web-architect
```
Enterprise-grade architectural planning and design:
- Strategic feature planning with DDD principles
- High-level architecture design (layered architecture)
- Component and service architecture
- Data model and API design
- Comprehensive technical documentation
- Implementation roadmap with task breakdown
- Risk assessment and mitigation
- Architecture Decision Records (ADRs)
- Integration with existing system documentation

### Tester
```
@tester
```
Comprehensive testing workflow for quality assurance:
- Unit testing (components, services, helpers)
- Integration testing (component-service integration)
- E2E testing with Cypress (user flows)
- Test planning and strategy
- Mock data and fixtures creation
- Test coverage analysis (80%+ target)
- Test performance optimization
- Test documentation and reporting
- Follows project testing standards (Jasmine, Karma, Cypress)

### Code Reviewer
```
@code-reviewer
```
Security-focused code review and quality analysis:
- **Security Analysis**: OWASP Top 10 vulnerabilities (XSS, CSRF, injection, auth failures)
- **Vulnerability Detection**: Common security exploits and weaknesses
- **Bug Detection**: Logic errors, race conditions, memory leaks, edge cases
- **Performance Analysis**: Change detection, memory leaks, optimization opportunities
- **Code Quality**: TypeScript best practices, Angular patterns, code smells
- **Angular Security**: Framework-specific security issues (sanitization, XSRF)
- Detailed review reports with severity levels
- Fix recommendations with code examples
- OWASP and CWE references

### Documentation Updater
```
@doc-updater
```
Automated documentation maintenance with git integration:
- **Git Diff Analysis**: Analyzes changes between local and remote branches
- **Changelog Generation**: Creates structured changelog entries from conventional commits
- **README Optimization**: Reviews and improves README.md structure and content
- **Pre-commit Integration**: Runs automatically before commits via git hooks
- **Keep a Changelog**: Follows industry-standard changelog format
- **Conventional Commits**: Parses commit messages for categorization
- **Quality Validation**: Ensures documentation completeness and accuracy
- Includes ready-to-use scripts for automation

### Article Generator
```
@article-generator
```
Technical content creation from git commits and implementations:
- **Commit Analysis**: Analyzes git commits to identify article-worthy implementations
- **Topic Suggestion**: Proposes 3-5 article topics based on code changes
- **Online Research**: Researches topics for technical accuracy and validity
- **Article Generation**: Creates comprehensive technical articles matching project writing style
- **Style Matching**: Maintains consistency with existing articles in `/articles` directory
- **Code Examples**: Includes working code examples with before/after comparisons
- **Quality Assurance**: Verifies technical accuracy and readability
- Supports tutorial, concept explanation, and comparison article formats

## 🚀 How to Use

### For Developers

1. **Let Cascade Guide You**: The rules automatically apply based on context
2. **Invoke Skills**: Use `@skill-name` to run workflows
3. **Reference Rules**: Mention specific patterns when needed

### For AI (Cascade)

1. **Always-On Rules**: Applied to every prompt automatically
2. **Glob Rules**: Applied when editing matching files
3. **Skills**: Invoked explicitly by user or when relevant
4. **AGENTS.md**: Applied based on current directory

## 📋 Key Patterns Enforced

### Component Development
- ✅ Standalone components only
- ✅ OnPush change detection
- ✅ Modern control flow syntax
- ✅ Proper subscription cleanup
- ✅ Mobile-first responsive design

### Service Development
- ✅ `providedIn: 'root'`
- ✅ `inject()` function for DI
- ✅ BehaviorSubject for state
- ✅ `shareReplay` for performance
- ✅ Comprehensive error handling

### Testing
- ✅ Unit tests for all components/services
- ✅ Proper mocking strategies
- ✅ 80%+ code coverage
- ✅ E2E tests for critical flows

### Styling
- ✅ Mobile-first approach
- ✅ Theme variables usage
- ✅ Responsive breakpoints (599px, 950px)
- ✅ Component-scoped SCSS

## 🎨 Styling System

### Breakpoints
- **Mobile**: 0-598px (default)
- **Tablet**: 599px+
- **Desktop**: 950px+

### Theme Variables
Located in `src/app/styles/variables.scss`:
- Colors: `$primary-green`, `$text-primary`, `$background-light`
- Spacing: `$spacing-xs` to `$spacing-2xl`
- Borders: `$border-color`, `$border-radius`

### Typography
Located in `src/app/styles/fonts.scss`:
- Font sizes: `$font-size-xs` to `$font-size-6xl`
- Font weights: `$font-weight-light` to `$font-weight-extrabold`
- Mixins: `@include font-display`, `@include font-heading`

## 🧪 Testing Standards

### Unit Tests
- Jasmine + Karma
- Mock all external dependencies
- Test inputs/outputs
- Test error states
- Test loading states

### E2E Tests
- Cypress for user flows
- Playwright for cross-browser
- Test critical paths
- Use data-testid attributes

## 📚 Additional Resources

### Project Documentation
- `/system-architecture/rzume-system-architecture.md`: Complete system architecture
- `/system-architecture/ANGULAR-PROJECT-SETUP-GUIDE.md`: Project setup guide
- `/README.md`: Project README

### Agent Definitions
- `/agents/analyst.md`: System analysis agent
- `/agents/feature-analyst.md`: Feature planning agent

## 🔄 Updating Configuration

### Adding New Rules
1. Create `.md` file in `.windsurf/rules/`
2. Add frontmatter with trigger type
3. Document patterns and standards
4. Update this README

### Adding New Skills
1. Create `.md` file in `.windsurf/skills/`
2. Add frontmatter with name and tags
3. Document workflow steps
4. Provide templates and examples

### Adding AGENTS.md
1. Create `AGENTS.md` in target directory
2. Document directory-specific guidelines
3. No frontmatter needed (auto-scoped)

## 💡 Best Practices

### For Optimal AI Assistance
1. **Be Specific**: Provide clear context and requirements
2. **Reference Patterns**: Mention specific patterns when needed
3. **Use Skills**: Leverage workflows for common tasks
4. **Review Output**: Always review AI-generated code
5. **Iterate**: Work iteratively, not in large batches

### For Maintaining Rules
1. **Keep Updated**: Update rules as patterns evolve
2. **Be Specific**: Avoid vague guidelines
3. **Provide Examples**: Include code examples
4. **Document Why**: Explain reasoning behind patterns

## 🎯 Goals

This configuration ensures:
- ✅ Consistent code quality across the project
- ✅ Adherence to Angular 18 best practices
- ✅ Proper architecture patterns
- ✅ Comprehensive testing
- ✅ Maintainable and scalable code
- ✅ Optimal performance
- ✅ Accessibility compliance

## 📞 Support

For questions or improvements:
1. Review existing rules and patterns
2. Check project documentation
3. Consult Angular official guidelines
4. Update configuration as needed

---

**Last Updated**: March 2026  
**Angular Version**: 18.2.0  
**Windsurf Version**: Latest
