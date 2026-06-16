---
name: Documentation Updater - Git-Based Changelog & README Optimizer
description: Automated documentation maintenance using git diff analysis, changelog generation, and README optimization for pre-commit hooks
tags: [documentation, changelog, git, pre-commit, readme, automation]
---

# Documentation Updater Skill

This skill provides automated documentation maintenance by analyzing git changes, generating changelogs, and optimizing README.md files. Designed to work as a pre-commit hook to ensure documentation stays synchronized with code changes.

## Overview

The Documentation Updater skill operates in three modes:
- **Git Diff Analysis**: Analyzes changes between local and remote branches
- **Changelog Generation**: Creates structured changelog entries from commits
- **README Optimization**: Reviews and improves README.md structure and content
- **Pre-commit Integration**: Runs automatically before commits

## Documentation Philosophy

### Living Documentation
- Documentation should evolve with code
- Changes should be documented as they happen
- Documentation is part of the development process
- Automated updates reduce manual overhead

### Quality Standards
- Clear, concise, and accurate
- Follows industry best practices
- Structured and scannable
- Includes all essential sections
- Up-to-date with latest changes

### Changelog Principles
- Follow [Keep a Changelog](https://keepachangelog.com/) format
- Use [Conventional Commits](https://www.conventionalcommits.org/) for parsing
- Semantic versioning for releases
- Categorized changes (Added, Changed, Fixed, etc.)

## Workflow Phases

### Phase 1: Git Analysis

#### 1.1 Detect Changes
**Objective**: Identify what has changed since last commit/push

**Git Commands to Execute**:
```bash
# Get current branch
git branch --show-current

# Check for uncommitted changes
git status --porcelain

# Get diff from last commit
git diff HEAD

# Get diff from remote
git diff origin/$(git branch --show-current)

# Get commit history since last push
git log origin/$(git branch --show-current)..HEAD --oneline

# Get detailed commit info
git log --pretty=format:"%h - %an, %ar : %s" --since="1 day ago"
```

**Information to Extract**:
- [ ] Modified files
- [ ] Added files
- [ ] Deleted files
- [ ] Commit messages
- [ ] Changed lines count
- [ ] File types affected
- [ ] Scope of changes

**Deliverable**: Change summary report

#### 1.2 Categorize Changes
**Objective**: Classify changes by type and impact

**Change Categories**:
- **Features** (`feat:`): New functionality
- **Bug Fixes** (`fix:`): Bug corrections
- **Documentation** (`docs:`): Documentation only
- **Styles** (`style:`): Code formatting
- **Refactoring** (`refactor:`): Code restructuring
- **Performance** (`perf:`): Performance improvements
- **Tests** (`test:`): Test additions/changes
- **Build** (`build:`): Build system changes
- **CI/CD** (`ci:`): CI configuration changes
- **Chores** (`chore:`): Maintenance tasks

**Impact Assessment**:
- **Breaking Changes**: API changes, removed features
- **Major Changes**: New features, significant refactoring
- **Minor Changes**: Bug fixes, small improvements
- **Patch Changes**: Documentation, typos, formatting

**Deliverable**: Categorized change list

#### 1.3 Parse Commit Messages
**Objective**: Extract structured information from commits

**Conventional Commit Format**:
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Examples**:
```
feat(auth): add Google OAuth integration
fix(api): resolve token refresh issue
docs(readme): update installation instructions
test(dashboard): add unit tests for filters
refactor(services): improve state management pattern
perf(components): optimize change detection strategy
```

**Parsing Rules**:
- Extract type, scope, and description
- Identify breaking changes (BREAKING CHANGE: in footer)
- Extract issue references (#123)
- Group by scope and type

**Deliverable**: Structured commit data

### Phase 2: Changelog Generation

#### 2.1 Changelog Structure
**Objective**: Create well-formatted changelog entries

**Changelog Format** (Keep a Changelog):
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature descriptions

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security improvements

## [1.0.0] - 2024-03-10

### Added
- Initial release
- User authentication with Google OAuth
- Job application dashboard
- CRUD operations for job applications

[Unreleased]: https://github.com/user/repo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
```

**Section Mapping**:
- `feat:` → **Added**
- `fix:` → **Fixed**
- `refactor:`, `perf:` → **Changed**
- `docs:` → **Documentation** (optional section)
- `security:` → **Security**
- Breaking changes → **Breaking Changes** (top of section)

#### 2.2 Generate Changelog Entry
**Objective**: Create changelog entry from git changes

**Entry Template**:
```markdown
## [Unreleased] - YYYY-MM-DD

### Added
- Feature description from commit message
- Another feature with link to PR (#123)

### Changed
- Refactoring description
- Performance improvement details

### Fixed
- Bug fix description with issue reference (#456)
- Another bug fix

### Security
- Security vulnerability fix
```

**Entry Generation Process**:
1. Group commits by category
2. Format each commit as bullet point
3. Add issue/PR references
4. Include scope in description
5. Sort by importance
6. Add date and version

**Deliverable**: Formatted changelog entry

#### 2.3 Update CHANGELOG.md
**Objective**: Insert new entry into existing changelog

**Update Strategy**:
```markdown
# Changelog

<!-- New entries go here -->
## [Unreleased] - 2024-03-10
### Added
- New features...

## [1.0.0] - 2024-03-01
### Added
- Previous features...
```

**Rules**:
- Insert at top (after header)
- Maintain chronological order (newest first)
- Update version links at bottom
- Preserve existing entries
- Follow consistent formatting

**Deliverable**: Updated CHANGELOG.md file

### Phase 3: README Optimization

#### 3.1 README Analysis
**Objective**: Evaluate current README quality

**Essential Sections Checklist**:
- [ ] **Project Name**: Clear, descriptive title
- [ ] **Description**: What the project does
- [ ] **Badges**: Build status, coverage, version
- [ ] **Table of Contents**: For long READMEs
- [ ] **Installation**: Step-by-step setup
- [ ] **Usage**: How to use the project
- [ ] **Features**: Key capabilities
- [ ] **Tech Stack**: Technologies used
- [ ] **Project Structure**: Directory layout
- [ ] **Configuration**: Environment setup
- [ ] **API Documentation**: If applicable
- [ ] **Testing**: How to run tests
- [ ] **Deployment**: Deployment instructions
- [ ] **Contributing**: Contribution guidelines
- [ ] **License**: License information
- [ ] **Authors**: Credits and acknowledgments
- [ ] **Support**: Where to get help
- [ ] **Changelog**: Link to CHANGELOG.md

**Quality Metrics**:
- **Completeness**: All essential sections present
- **Clarity**: Easy to understand
- **Accuracy**: Information is current
- **Structure**: Logical organization
- **Examples**: Code examples provided
- **Links**: All links working
- **Formatting**: Consistent markdown

**Deliverable**: README quality report

#### 3.2 Optimization Recommendations
**Objective**: Identify improvements for README

**Common Issues to Fix**:

##### Missing Sections
```markdown
❌ Missing "Installation" section
✅ Add:
## Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd project-name
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```
```

##### Outdated Information
```markdown
❌ Old version number
- **Version**: 1.0.0

✅ Update to current version
- **Version**: 2.1.0 (from package.json)
```

##### Poor Structure
```markdown
❌ No table of contents for long README

✅ Add TOC:
## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
```

##### Missing Code Examples
```markdown
❌ "Run the app" with no example

✅ Add example:
## Usage

Start the development server:
```bash
npm start
```

The app will be available at http://localhost:4200
```

##### Broken Links
```markdown
❌ [Documentation](./docs/guide.md) - file doesn't exist

✅ Fix or remove:
[Documentation](https://docs.example.com)
```

**Deliverable**: Optimization recommendations

#### 3.3 Apply Optimizations
**Objective**: Implement README improvements

**Optimization Patterns**:

##### Add Badges
```markdown
# Project Name

![Build Status](https://img.shields.io/github/workflow/status/user/repo/CI)
![Coverage](https://img.shields.io/codecov/c/github/user/repo)
![Version](https://img.shields.io/npm/v/package-name)
![License](https://img.shields.io/github/license/user/repo)
```

##### Improve Installation Section
```markdown
## Installation

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/user/repo.git
   cd repo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp src/environments/environment.ts src/environments/environment.development.ts
   ```
   
   Update the configuration with your settings:
   - `apiUrl`: Backend API URL
   - `googleClientId`: Google OAuth client ID

4. **Start development server**
   ```bash
   npm start
   ```
   
   Navigate to http://localhost:4200
```

##### Add Features Section
```markdown
## Features

- ✅ **User Authentication**: Secure login with Google OAuth and JWT
- ✅ **Dashboard**: Centralized job application management
- ✅ **CRUD Operations**: Create, read, update, delete applications
- ✅ **Filtering & Search**: Advanced filtering capabilities
- ✅ **Responsive Design**: Mobile-first UI with Angular Material
- ✅ **State Management**: Reactive state with RxJS
- ✅ **CI/CD Pipeline**: Automated deployment to Google Cloud Run
```

##### Improve Tech Stack Section
```markdown
## Tech Stack

### Frontend
- **Framework**: Angular 18.2.0
- **UI Library**: Angular Material 18.2.0
- **Language**: TypeScript 5.5.4
- **State Management**: RxJS 7.8.0

### Authentication
- Google OAuth (`@abacritt/angularx-social-login`)
- JWT (`@auth0/angular-jwt`)

### Testing
- **Unit Tests**: Jasmine + Karma
- **E2E Tests**: Cypress
- **Coverage**: 80%+ target

### DevOps
- **CI/CD**: GitHub Actions
- **Deployment**: Google Cloud Run
- **Containerization**: Docker
```

##### Add Usage Examples
```markdown
## Usage

### Development

Start the development server:
```bash
npm start
```

### Testing

Run unit tests:
```bash
npm test
```

Run E2E tests:
```bash
npm run cy:open
```

### Building

Build for production:
```bash
npm run build:prod
```

### Deployment

Deploy to Google Cloud Run:
```bash
# Automated via GitHub Actions on push to main
# Or manually:
docker build -t gcr.io/project-id/app-name .
docker push gcr.io/project-id/app-name
gcloud run deploy app-name --image gcr.io/project-id/app-name
```
```

**Deliverable**: Optimized README.md

### Phase 4: Pre-commit Integration

#### 4.1 Pre-commit Hook Setup
**Objective**: Configure automatic documentation updates

**Pre-commit Configuration** (`.pre-commit-config.yaml`):
```yaml
repos:
  - repo: local
    hooks:
      - id: update-documentation
        name: Update Documentation
        entry: node scripts/update-docs.js
        language: node
        stages: [commit]
        always_run: true
        pass_filenames: false
        
      - id: validate-changelog
        name: Validate Changelog
        entry: node scripts/validate-changelog.js
        language: node
        files: CHANGELOG.md
        
      - id: check-readme
        name: Check README Quality
        entry: node scripts/check-readme.js
        language: node
        files: README.md
```

**Installation**:
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

#### 4.2 Documentation Update Script
**Objective**: Automate documentation updates

**Script Template** (`scripts/update-docs.js`):
```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get git changes
function getGitChanges() {
  try {
    const diff = execSync('git diff --cached --name-status').toString();
    const commits = execSync('git log origin/$(git branch --show-current)..HEAD --oneline').toString();
    
    return {
      stagedFiles: diff.split('\n').filter(Boolean),
      recentCommits: commits.split('\n').filter(Boolean)
    };
  } catch (error) {
    console.error('Error getting git changes:', error.message);
    return { stagedFiles: [], recentCommits: [] };
  }
}

// Parse commit messages
function parseCommits(commits) {
  const conventionalCommitRegex = /^(\w+)(\(([^)]+)\))?: (.+)$/;
  
  return commits.map(commit => {
    const [hash, ...messageParts] = commit.split(' ');
    const message = messageParts.join(' ');
    const match = message.match(conventionalCommitRegex);
    
    if (match) {
      return {
        hash,
        type: match[1],
        scope: match[3] || '',
        description: match[4],
        raw: message
      };
    }
    
    return {
      hash,
      type: 'other',
      scope: '',
      description: message,
      raw: message
    };
  });
}

// Generate changelog entry
function generateChangelogEntry(commits) {
  const categories = {
    feat: 'Added',
    fix: 'Fixed',
    docs: 'Documentation',
    style: 'Style',
    refactor: 'Changed',
    perf: 'Changed',
    test: 'Tests',
    build: 'Build',
    ci: 'CI/CD',
    chore: 'Chore'
  };
  
  const grouped = {};
  
  commits.forEach(commit => {
    const category = categories[commit.type] || 'Other';
    if (!grouped[category]) grouped[category] = [];
    
    const entry = commit.scope 
      ? `**${commit.scope}**: ${commit.description}`
      : commit.description;
      
    grouped[category].push(`- ${entry} (${commit.hash})`);
  });
  
  let entry = `## [Unreleased] - ${new Date().toISOString().split('T')[0]}\n\n`;
  
  Object.keys(grouped).sort().forEach(category => {
    entry += `### ${category}\n`;
    entry += grouped[category].join('\n') + '\n\n';
  });
  
  return entry;
}

// Update CHANGELOG.md
function updateChangelog(entry) {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  
  if (!fs.existsSync(changelogPath)) {
    // Create new changelog
    const template = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n${entry}`;
    fs.writeFileSync(changelogPath, template);
    console.log('✅ Created CHANGELOG.md');
  } else {
    // Update existing changelog
    const content = fs.readFileSync(changelogPath, 'utf-8');
    const lines = content.split('\n');
    
    // Find insertion point (after header)
    let insertIndex = lines.findIndex(line => line.startsWith('## '));
    if (insertIndex === -1) insertIndex = lines.length;
    
    // Insert new entry
    lines.splice(insertIndex, 0, entry);
    fs.writeFileSync(changelogPath, lines.join('\n'));
    console.log('✅ Updated CHANGELOG.md');
  }
  
  // Stage the changelog
  execSync('git add CHANGELOG.md');
}

// Check README quality
function checkReadmeQuality() {
  const readmePath = path.join(process.cwd(), 'README.md');
  
  if (!fs.existsSync(readmePath)) {
    console.warn('⚠️  README.md not found');
    return;
  }
  
  const content = fs.readFileSync(readmePath, 'utf-8');
  const requiredSections = [
    'Installation',
    'Usage',
    'Features',
    'Tech Stack',
    'Contributing',
    'License'
  ];
  
  const missingSections = requiredSections.filter(section => 
    !content.includes(`## ${section}`) && !content.includes(`# ${section}`)
  );
  
  if (missingSections.length > 0) {
    console.warn('⚠️  README.md missing sections:', missingSections.join(', '));
  } else {
    console.log('✅ README.md has all essential sections');
  }
}

// Main execution
function main() {
  console.log('📝 Updating documentation...\n');
  
  const { stagedFiles, recentCommits } = getGitChanges();
  
  if (recentCommits.length > 0) {
    const parsedCommits = parseCommits(recentCommits);
    const changelogEntry = generateChangelogEntry(parsedCommits);
    updateChangelog(changelogEntry);
  }
  
  checkReadmeQuality();
  
  console.log('\n✨ Documentation update complete!');
}

main();
```

**Make Script Executable**:
```bash
chmod +x scripts/update-docs.js
```

#### 4.3 Workflow Integration
**Objective**: Integrate with development workflow

**Git Workflow**:
```bash
# 1. Make code changes
git add src/app/feature.component.ts

# 2. Commit with conventional format
git commit -m "feat(dashboard): add export functionality"

# 3. Pre-commit hook runs automatically:
#    - Analyzes git changes
#    - Generates changelog entry
#    - Checks README quality
#    - Updates CHANGELOG.md
#    - Stages updated files

# 4. Commit completes with updated docs
```

**Manual Trigger**:
```bash
# Update docs manually
npm run update-docs

# Or using pre-commit
pre-commit run update-documentation --all-files
```

### Phase 5: Documentation Validation

#### 5.1 Validation Checks
**Objective**: Ensure documentation quality

**Changelog Validation**:
```javascript
// scripts/validate-changelog.js
function validateChangelog(content) {
  const checks = {
    hasHeader: content.includes('# Changelog'),
    hasFormat: content.includes('Keep a Changelog'),
    hasVersioning: content.includes('Semantic Versioning'),
    hasUnreleased: content.includes('## [Unreleased]'),
    hasCategories: ['Added', 'Changed', 'Fixed'].some(cat => 
      content.includes(`### ${cat}`)
    )
  };
  
  const failed = Object.entries(checks)
    .filter(([_, passed]) => !passed)
    .map(([check]) => check);
  
  if (failed.length > 0) {
    console.error('❌ Changelog validation failed:', failed);
    process.exit(1);
  }
  
  console.log('✅ Changelog validation passed');
}
```

**README Validation**:
```javascript
// scripts/check-readme.js
function validateReadme(content) {
  const requiredSections = [
    'Installation',
    'Usage',
    'Features',
    'Tech Stack'
  ];
  
  const missingRequired = requiredSections.filter(section => 
    !content.includes(`## ${section}`)
  );
  
  const recommendedSections = [
    'Contributing',
    'License',
    'Testing',
    'Deployment'
  ];
  
  const missingRecommended = recommendedSections.filter(section =>
    !content.includes(`## ${section}`)
  );
  
  if (missingRequired.length > 0) {
    console.error('❌ Missing required sections:', missingRequired);
    process.exit(1);
  }
  
  if (missingRecommended.length > 0) {
    console.warn('⚠️  Missing recommended sections:', missingRecommended);
  }
  
  console.log('✅ README validation passed');
}
```

#### 5.2 Continuous Validation
**Objective**: Validate on every commit

**GitHub Actions Workflow** (`.github/workflows/docs.yml`):
```yaml
name: Documentation

on:
  pull_request:
    paths:
      - 'README.md'
      - 'CHANGELOG.md'
      - 'docs/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Validate Changelog
        run: node scripts/validate-changelog.js
      
      - name: Validate README
        run: node scripts/check-readme.js
      
      - name: Check for broken links
        uses: gaurav-nelson/github-action-markdown-link-check@v1
        with:
          use-quiet-mode: 'yes'
```

## Integration with Project

### Reference Project Standards
- `@/.windsurf/rules/code-quality.md`: Documentation standards
- `@/README.md`: Current documentation
- `@/CHANGELOG.md`: Existing changelog (if present)

### Use Git Commands
```bash
# Analyze changes
git diff --cached
git log --oneline
git status

# Update documentation
git add CHANGELOG.md README.md
git commit --amend --no-edit
```

### Follow Conventions
- **Conventional Commits**: Type, scope, description format
- **Keep a Changelog**: Structured changelog format
- **Semantic Versioning**: Version numbering
- **Markdown Best Practices**: Consistent formatting

## Best Practices Summary

### Changelog
- ✅ Use conventional commit format
- ✅ Group changes by category
- ✅ Include issue/PR references
- ✅ Keep entries concise
- ✅ Update on every commit
- ✅ Follow Keep a Changelog format

### README
- ✅ Include all essential sections
- ✅ Provide code examples
- ✅ Keep information current
- ✅ Use clear, concise language
- ✅ Add badges for status
- ✅ Include table of contents for long docs

### Automation
- ✅ Use pre-commit hooks
- ✅ Validate on CI/CD
- ✅ Auto-generate when possible
- ✅ Manual review before release
- ✅ Keep scripts maintainable

## Checklist

### Setup
- [ ] Install pre-commit
- [ ] Create .pre-commit-config.yaml
- [ ] Add update-docs.js script
- [ ] Add validation scripts
- [ ] Configure git hooks

### Changelog
- [ ] CHANGELOG.md exists
- [ ] Follows Keep a Changelog format
- [ ] Has Unreleased section
- [ ] Categories properly used
- [ ] Entries are descriptive

### README
- [ ] All essential sections present
- [ ] Installation instructions clear
- [ ] Usage examples provided
- [ ] Tech stack documented
- [ ] Contributing guidelines included
- [ ] License specified

### Automation
- [ ] Pre-commit hook configured
- [ ] Scripts executable
- [ ] CI/CD validation added
- [ ] Team trained on conventions

---

**This skill ensures comprehensive, automated documentation maintenance with git integration and pre-commit hooks for seamless workflow integration.**
