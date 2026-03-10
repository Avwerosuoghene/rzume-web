#!/usr/bin/env node

/**
 * Commit Message Validator
 * 
 * Validates that commit messages follow the Conventional Commits format.
 * Format: type(scope): description
 * 
 * Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, security
 */

const fs = require('fs');
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const commitMsgFile = process.argv[2];

if (!commitMsgFile) {
  console.error(`${colors.red}❌ No commit message file provided${colors.reset}`);
  process.exit(1);
}

const commitMessage = fs.readFileSync(commitMsgFile, 'utf-8').trim();

// Skip validation for merge commits and revert commits
if (commitMessage.startsWith('Merge') || commitMessage.startsWith('Revert')) {
  console.log(`${colors.cyan}ℹ️  Skipping validation for merge/revert commit${colors.reset}`);
  process.exit(0);
}

// Get first line for multi-line commit messages
const firstLine = commitMessage.split('\n')[0].trim();

// Conventional commit regex
const conventionalCommitRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|security)(\(.+\))?: .{1,}$/;

if (!conventionalCommitRegex.test(firstLine)) {
  console.error(`\n${colors.red}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.error(`${colors.red}║   ❌ Invalid commit message format                        ║${colors.reset}`);
  console.error(`${colors.red}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.error(`${colors.yellow}Your commit message:${colors.reset}`);
  console.error(`  "${firstLine}"\n`);
  
  console.error(`${colors.cyan}Expected format:${colors.reset}`);
  console.error(`  type(scope): description\n`);
  
  console.error(`${colors.cyan}Valid types:${colors.reset}`);
  console.error(`  - feat:     New feature`);
  console.error(`  - fix:      Bug fix`);
  console.error(`  - docs:     Documentation changes`);
  console.error(`  - style:    Code style changes (formatting, etc.)`);
  console.error(`  - refactor: Code refactoring`);
  console.error(`  - perf:     Performance improvements`);
  console.error(`  - test:     Test additions or changes`);
  console.error(`  - build:    Build system changes`);
  console.error(`  - ci:       CI/CD changes`);
  console.error(`  - chore:    Maintenance tasks`);
  console.error(`  - security: Security improvements\n`);
  
  console.error(`${colors.cyan}Examples:${colors.reset}`);
  console.error(`  feat(auth): add Google OAuth integration`);
  console.error(`  fix(dashboard): resolve search input clearing bug`);
  console.error(`  docs(readme): update installation instructions`);
  console.error(`  test(services): add unit tests for auth service\n`);
  
  process.exit(1);
}

console.log(`${colors.green}✅ Commit message format is valid${colors.reset}`);
process.exit(0);
