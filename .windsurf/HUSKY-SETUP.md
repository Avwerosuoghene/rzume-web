# Husky Pre-commit Hooks Setup Guide

This document explains the Husky pre-commit hooks setup for automated documentation updates and commit message validation.

---

## Overview

Husky is configured to run automated checks and documentation updates before every commit. This ensures:
- ✅ Documentation stays synchronized with code changes
- ✅ Commit messages follow conventional commits format
- ✅ README.md is automatically updated based on code changes
- ✅ README.md quality is validated

---

## What Happens on Commit

### Pre-commit Hook
When you run `git commit`, the following happens automatically:

```
1. Documentation Updater Script Runs
   ↓
2. Analyzes staged files (components, services, etc.)
   ↓
3. Detects new/modified code
   ↓
4. Updates README.md sections:
   - Key Features (new page components)
   - Available Scripts (new npm scripts)
   - UI Components (new components)
   - Core Services (new services)
   ↓
5. Validates README.md quality
   ↓
6. Stages updated README.md
   ↓
7. Commit proceeds
```

### Commit Message Validation
After you write your commit message:

```
1. Validates conventional commit format
   ↓
2. Checks for valid type (feat, fix, docs, etc.)
   ↓
3. Ensures proper structure
   ↓
4. Commit proceeds or fails with helpful error
```

---

## Installation

### First-time Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Husky** (automatically runs via `prepare` script):
   ```bash
   npm run prepare
   ```

3. **Verify installation**:
   ```bash
   ls -la .husky
   ```
   
   You should see:
   - `.husky/pre-commit`
   - `.husky/commit-msg`

### Manual Husky Installation (if needed)

If Husky hooks aren't working:

```bash
# Install Husky
npm install husky --save-dev

# Initialize Husky
npx husky install

# Make scripts executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x scripts/update-docs.js
chmod +x scripts/validate-commit-msg.js
```

---

## Usage

### Making a Commit

#### ✅ Good Commit (Conventional Format)

```bash
git add .
git commit -m "feat(dashboard): add export to PDF functionality"
```

**What happens**:
1. Pre-commit hook runs documentation updater
2. Analyzes your staged files
3. Detects new component: `export-button.component.ts`
4. Updates README.md UI Components section
5. Validates README.md quality
6. Stages updated README.md
7. Commit message is validated
8. Commit succeeds ✅

#### ❌ Bad Commit (Invalid Format)

```bash
git add .
git commit -m "added new feature"
```

**What happens**:
1. Pre-commit hook runs successfully
2. Commit message validation **fails** ❌
3. You see an error with examples
4. Commit is **rejected**

**Error message**:
```
╔════════════════════════════════════════════════════════════╗
║   ❌ Invalid commit message format                        ║
╚════════════════════════════════════════════════════════════╝

Your commit message:
  "added new feature"

Expected format:
  type(scope): description

Examples:
  feat(auth): add Google OAuth integration
  fix(dashboard): resolve search input clearing bug
```

### Conventional Commit Format

**Format**: `type(scope): description`

**Valid Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or changes
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `security`: Security improvements

**Examples**:
```bash
# Feature
git commit -m "feat(auth): add Google OAuth integration"

# Bug fix
git commit -m "fix(dashboard): resolve search input clearing bug"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Test
git commit -m "test(services): add unit tests for auth service"

# Refactoring
git commit -m "refactor(components): improve state management pattern"

# With scope
git commit -m "feat(api): add pagination support to job listings"

# Without scope
git commit -m "chore: update dependencies"
```

---

## Scripts

### Documentation Updater
**Location**: `scripts/update-docs.js`

**What it does**:
- Analyzes git diff and staged changes
- Detects new components and services
- Updates README.md sections automatically:
  - Adds new features to Key Features
  - Documents new components in UI Components section
  - Documents new services in Core Services section
  - Updates Available Scripts with new npm scripts
- Validates README.md quality
- Stages updated README.md

**Run manually**:
```bash
npm run update-docs
```

**Output**:
```
╔════════════════════════════════════════╗
║   📝 Documentation Updater Script     ║
╚════════════════════════════════════════╝

📊 Analyzing git changes...

🌿 Current branch: feature/export-pdf

📝 Staged files:
   + src/app/services/export.service.ts
   + src/app/components/export-button/export-button.component.ts
   ~ README.md

📊 File type summary:
   Components: 1
   Services: 1
   Documentation: 1

� Code changes detected:
   + 1 new component(s)
   + 1 new service(s)

📝 Updating README.md...

✅ Added 1 new component(s) to documentation
✅ Added 1 new service(s) to documentation
✅ Updated and staged README.md

📖 Checking README.md quality...

✅ README.md has all required sections

╔════════════════════════════════════════╗
║   ✨ Documentation update complete!   ║
╚════════════════════════════════════════╝
```

### Commit Message Validator
**Location**: `scripts/validate-commit-msg.js`

**What it does**:
- Validates commit message format
- Ensures conventional commits standard
- Provides helpful error messages

**Run manually**:
```bash
# Not typically run manually (runs via commit-msg hook)
node scripts/validate-commit-msg.js .git/COMMIT_EDITMSG
```

---

## README.md Updates

### What Gets Updated

The documentation updater automatically updates these README.md sections:

#### **1. Key Features**
When you add new page components (in `src/app/pages/`), they're automatically added to the Key Features section.

**Example**:
```markdown
### Key Features:
- **User Authentication**: Secure sign-up and sign-in
- **Dashboard**: Central hub for job applications
- **Export Manager**: Export job applications to PDF  ← Automatically added
```

#### **2. Available Scripts**
New npm scripts are automatically documented.

**Example**:
```markdown
## Available Scripts
- **`npm start`**: Starts the development server
- **`npm run update-docs`**: Updates project documentation  ← Automatically added
```

#### **3. UI Components**
New components in `src/app/components/` are documented.

**Example**:
```markdown
### UI Components (`src/app/components/`)
- **`custom-table/`**: Reusable data table
- **`export-button/`**: Export functionality button  ← Automatically added
```

#### **4. Core Services**
New services in `src/app/core/services/` are documented.

**Example**:
```markdown
### Core Services (`src/app/core/services/`)
- **`api.service.ts`**: HTTP client wrapper
- **`export.service.ts`**: PDF export functionality  ← Automatically added
```

### Change Detection

The script detects:
- ✅ New components (status: `A`, path: `*.component.ts`)
- ✅ New services (status: `A`, path: `*.service.ts`)
- ✅ Modified components (status: `M`, path: `*.component.ts`)
- ✅ Modified services (status: `M`, path: `*.service.ts`)
- ✅ New npm scripts in `package.json`

---

## README.md Validation

### Required Sections

The documentation updater checks for these **required** sections:
- ✅ Installation
- ✅ Usage
- ✅ Tech Stack

### Recommended Sections

These sections are recommended but not required:
- Features
- Contributing
- License
- Testing
- Deployment

### Validation Output

**All sections present**:
```
✅ README.md has all required sections
```

**Missing required sections**:
```
❌ README.md missing required sections:
   - Installation
   - Usage
```

**Missing recommended sections**:
```
⚠️  README.md missing recommended sections:
   - Contributing
   - License
```

---

## Troubleshooting

### Husky hooks not running

**Problem**: Pre-commit hook doesn't execute

**Solution**:
```bash
# Reinstall Husky
npm run prepare

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### Script permission denied

**Problem**: `Permission denied` error when running scripts

**Solution**:
```bash
chmod +x scripts/update-docs.js
chmod +x scripts/validate-commit-msg.js
```

### Commit message validation failing

**Problem**: Valid commit message is rejected

**Solution**:
- Ensure format is exactly: `type(scope): description`
- Check for typos in type
- Ensure there's a space after the colon
- Scope is optional but must be in parentheses if present

**Valid**:
```
feat(auth): add login
feat: add login
```

**Invalid**:
```
feat(auth) add login  ❌ (missing colon)
feat (auth): add login ❌ (space before parenthesis)
feat:add login ❌ (no space after colon)
```

### Bypassing hooks (emergency only)

**Not recommended**, but if you need to bypass hooks:

```bash
git commit --no-verify -m "emergency fix"
```

⚠️ **Warning**: This skips all validation and documentation updates. Use only in emergencies.

---

## Workflow Integration

### Daily Development

```bash
# 1. Make your changes
vim src/app/feature.component.ts

# 2. Stage changes
git add .

# 3. Commit with conventional format
git commit -m "feat(feature): add new functionality"

# 4. Hooks run automatically:
#    - Documentation updater
#    - Commit message validation
#    - CHANGELOG.md update

# 5. Push when ready
git push origin feature-branch
```

### Pull Request Process

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make commits (hooks run on each commit)
git commit -m "feat(api): add endpoint"
git commit -m "test(api): add endpoint tests"
git commit -m "docs(api): document new endpoint"

# 3. Push branch
git push origin feature/new-feature

# 4. Create PR
#    - CHANGELOG.md will show all changes
#    - README.md will be validated
#    - All commits follow conventional format
```

---

## Configuration Files

### `.husky/pre-commit`
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run update-docs
```

### `.husky/commit-msg`
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

node scripts/validate-commit-msg.js "$1"
```

### `package.json` scripts
```json
{
  "scripts": {
    "prepare": "husky install",
    "update-docs": "node scripts/update-docs.js"
  }
}
```

---

## Best Practices

### Commit Messages

✅ **Do**:
- Use conventional commit format
- Be descriptive in the description
- Include scope when relevant
- Keep description concise (< 72 characters)
- Use imperative mood ("add" not "added")

❌ **Don't**:
- Use vague messages ("fix stuff", "update")
- Skip the type prefix
- Use past tense
- Include multiple changes in one commit

### Documentation

✅ **Do**:
- Let the hooks update README.md automatically
- Review generated README.md updates
- Keep README.md sections structured properly
- Add new components/services via git (they'll be documented automatically)

❌ **Don't**:
- Manually add components/services to README.md (automation handles it)
- Skip README.md required sections
- Bypass hooks without good reason
- Delete auto-generated documentation entries

---

## Team Onboarding

### For New Team Members

1. **Clone repository**:
   ```bash
   git clone <repo-url>
   cd rzume_web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify Husky setup**:
   ```bash
   ls -la .husky
   ```

4. **Read this guide**: `.windsurf/HUSKY-SETUP.md`

5. **Make a test commit**:
   ```bash
   echo "test" >> test.txt
   git add test.txt
   git commit -m "chore: test commit"
   ```

6. **Verify hooks ran**:
   - Check terminal output for documentation updater
   - Verify commit message was validated

---

## Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [README Best Practices](https://www.makeareadme.com/)
- [Documentation Guide](./.windsurf/skills/doc-updater.md)

---

---

## 🔒 Security Notes

This Husky implementation has been **security hardened** to protect against common vulnerabilities:

### **Security Features**
- ✅ **Command Injection Protection**: All git commands use safe execution without shell interpretation
- ✅ **Path Traversal Prevention**: File paths are validated to prevent unauthorized access
- ✅ **Atomic File Operations**: README.md updates use atomic writes with automatic backup/rollback
- ✅ **DoS Protection**: File size limits (10MB) and command timeouts (5s) prevent resource exhaustion
- ✅ **Input Validation**: All file paths are validated against whitelist and checked for malicious patterns
- ✅ **Error Recovery**: Comprehensive error handling with automatic rollback on failures

### **Security Reports**
For detailed security information, see:
- **Vulnerability Report**: `implementations/husky/SECURITY-VULNERABILITY-REPORT.md`
- **Implementation Report**: `implementations/husky/SECURITY-FIXES-IMPLEMENTATION.md`

### **Security Best Practices**
1. ✅ Never bypass hooks with `--no-verify` unless absolutely necessary
2. ✅ Review generated documentation updates before pushing
3. ✅ Keep Husky and dependencies updated
4. ✅ Report any suspicious behavior to security team

---

**Last Updated**: March 2026  
**Security Hardened**: March 10, 2026  
**Maintained By**: Development Team
