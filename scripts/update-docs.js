#!/usr/bin/env node

/**
 * Documentation Updater Script
 * 
 * Automatically updates README.md based on git changes.
 * Implements the doc-updater skill from .windsurf/skills/doc-updater.md
 * 
 * Features:
 * - Analyzes git diff and staged changes
 * - Updates README.md sections based on code changes
 * - Validates README.md quality
 * - Adds new features, components, and services to documentation
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Execute git command safely without shell injection
 * @param {string} command - Git command (e.g., 'git')
 * @param {string[]} args - Command arguments
 * @returns {string} Command output
 */
function execGit(command, args = []) {
  try {
    const result = spawnSync(command, args, {
      encoding: 'utf-8',
      timeout: 5000,  // 5 second timeout
      shell: false    // Prevent shell injection
    });
    
    if (result.error) {
      console.warn(`Git command failed: ${command} ${args.join(' ')}`);
      console.warn(`Error: ${result.error.message}`);
      return '';
    }
    
    return (result.stdout || '').trim();
  } catch (error) {
    console.warn(`Git command failed: ${command} ${args.join(' ')}`);
    console.warn(`Error: ${error.message}`);
    return '';
  }
}

/**
 * Get project root directory and validate it's a git repository
 * @returns {string} Absolute path to project root
 */
function getProjectRoot() {
  const cwd = process.cwd();
  try {
    const gitRoot = execGit('git', ['rev-parse', '--show-toplevel']);
    if (!gitRoot) {
      throw new Error('Not in a git repository');
    }
    return gitRoot;
  } catch (error) {
    throw new Error('Not in a git repository');
  }
}

/**
 * Validate file path is within project and safe
 * @param {string} filepath - File path to validate
 * @returns {boolean} True if valid
 */
function isValidFilePath(filepath) {
  if (!filepath) return false;
  
  // Check for path traversal
  if (filepath.includes('..')) return false;
  
  // Check for null bytes
  if (filepath.includes('\0')) return false;
  
  // Must be within src/app or scripts or root-level .md files
  const validPaths = ['src/app/', 'scripts/', 'README.md', 'CHANGELOG.md'];
  const isValid = validPaths.some(validPath => 
    filepath.startsWith(validPath) || filepath === validPath
  );
  
  if (!isValid) return false;
  
  // Valid file extensions only
  const validExtensions = ['.ts', '.js', '.html', '.scss', '.md', '.json'];
  if (!validExtensions.some(ext => filepath.endsWith(ext))) return false;
  
  return true;
}

/**
 * Get git changes information
 */
function getGitChanges() {
  console.log(`${colors.blue}📊 Analyzing git changes...${colors.reset}\n`);
  
  const stagedFiles = execGit('git', ['diff', '--cached', '--name-status']);
  const currentBranch = execGit('git', ['branch', '--show-current']);
  
  // Get commits that haven't been pushed yet (safely)
  let unpushedCommits = '';
  if (currentBranch) {
    unpushedCommits = execGit('git', ['log', `origin/${currentBranch}..HEAD`, '--oneline']);
  }
  
  return {
    stagedFiles: stagedFiles.split('\n').filter(Boolean),
    currentBranch,
    unpushedCommits: unpushedCommits.split('\n').filter(Boolean)
  };
}

/**
 * Analyze file changes and categorize them
 */
function analyzeFileChanges(stagedFiles) {
  const changes = {
    newComponents: [],
    newServices: [],
    newFeatures: [],
    modifiedComponents: [],
    modifiedServices: [],
    tests: [],
    docs: []
  };
  
  stagedFiles.forEach(file => {
    const [status, filepath] = file.split('\t');
    
    // Validate file path
    if (!filepath || !isValidFilePath(filepath)) {
      if (filepath) {
        console.warn(`${colors.yellow}⚠️  Skipping invalid file path: ${filepath}${colors.reset}`);
      }
      return;
    }
    
    // New components
    if (status === 'A' && filepath.includes('.component.ts')) {
      const componentName = filepath.split('/').pop().replace('.component.ts', '');
      changes.newComponents.push({
        name: componentName,
        path: filepath,
        type: filepath.includes('/pages/') ? 'page' : 'component'
      });
    }
    
    // New services
    if (status === 'A' && filepath.includes('.service.ts')) {
      const serviceName = filepath.split('/').pop().replace('.service.ts', '');
      changes.newServices.push({
        name: serviceName,
        path: filepath
      });
    }
    
    // Modified components
    if (status === 'M' && filepath.includes('.component.ts')) {
      const componentName = filepath.split('/').pop().replace('.component.ts', '');
      changes.modifiedComponents.push({
        name: componentName,
        path: filepath
      });
    }
    
    // Modified services
    if (status === 'M' && filepath.includes('.service.ts')) {
      const serviceName = filepath.split('/').pop().replace('.service.ts', '');
      changes.modifiedServices.push({
        name: serviceName,
        path: filepath
      });
    }
    
    // Tests
    if (filepath.includes('.spec.ts')) {
      changes.tests.push(filepath);
    }
    
    // Documentation
    if (filepath.includes('.md')) {
      changes.docs.push(filepath);
    }
  });
  
  return changes;
}

/**
 * Safely read file with size validation
 * @param {string} filepath - File path to read
 * @returns {string} File content
 */
function readFileSafe(filepath) {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  const stats = fs.statSync(filepath);
  
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${filepath} (${stats.size} bytes)`);
  }
  
  return fs.readFileSync(filepath, 'utf-8');
}

/**
 * Safely write file with atomic operation and backup
 * @param {string} filepath - File path to write
 * @param {string} content - Content to write
 */
function safeWriteFile(filepath, content) {
  const backupPath = `${filepath}.backup`;
  const tempPath = `${filepath}.tmp`;
  
  try {
    // Create backup if file exists
    if (fs.existsSync(filepath)) {
      fs.copyFileSync(filepath, backupPath);
    }
    
    // Write to temp file first
    fs.writeFileSync(tempPath, content, { encoding: 'utf-8', mode: 0o644 });
    
    // Atomic rename
    fs.renameSync(tempPath, filepath);
    
    // Remove backup on success
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
    
    return true;
  } catch (error) {
    // Restore from backup on failure
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filepath);
      fs.unlinkSync(backupPath);
    }
    
    // Clean up temp file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    
    throw error;
  }
}

/**
 * Find section in content using safe parsing (no ReDoS)
 * @param {string} content - File content
 * @param {string} sectionName - Section name to find
 * @returns {object|null} Section info with start/end indices
 */
function findSection(content, sectionName) {
  const lines = content.split('\n');
  let start = -1;
  let end = lines.length;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(sectionName)) {
      start = i;
    } else if (start !== -1 && (lines[i].startsWith('## ') || lines[i].startsWith('### '))) {
      end = i;
      break;
    }
  }
  
  if (start === -1) return null;
  
  return {
    start,
    end,
    content: lines.slice(start, end).join('\n'),
    lines
  };
}

/**
 * Update README.md based on code changes
 */
function updateReadme(changes) {
  console.log(`\n${colors.blue}📝 Updating README.md...${colors.reset}\n`);
  
  const projectRoot = getProjectRoot();
  const readmePath = path.join(projectRoot, 'README.md');
  
  // Validate path is within project
  if (!readmePath.startsWith(projectRoot)) {
    console.log(`${colors.red}❌ Invalid README.md path${colors.reset}`);
    return false;
  }
  
  if (!fs.existsSync(readmePath)) {
    console.log(`${colors.red}❌ README.md not found${colors.reset}`);
    return false;
  }
  
  let content = readFileSafe(readmePath);
  let updated = false;
  
  // Update Key Features section with new features
  if (changes.newComponents.length > 0 || changes.newServices.length > 0) {
    const newFeatures = [];
    
    // Add new page components as features
    changes.newComponents.forEach(comp => {
      if (comp.type === 'page') {
        const featureName = comp.name
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        newFeatures.push(`- **${featureName}**: New feature added to the application.`);
      }
    });
    
    if (newFeatures.length > 0) {
      // Find Key Features section using safe parsing
      const section = findSection(content, '### Key Features:');
      
      if (section) {
        const updatedLines = [...section.lines];
        // Insert new features after the section header
        updatedLines.splice(section.start + 1, 0, ...newFeatures);
        content = updatedLines.join('\n');
        updated = true;
        console.log(`${colors.green}✅ Added ${newFeatures.length} new feature(s) to Key Features${colors.reset}`);
      }
    }
  }
  
  // Update Available Scripts section if new scripts detected
  const packageJsonPath = path.join(projectRoot, 'package.json');
  
  // Validate path
  if (!packageJsonPath.startsWith(projectRoot)) {
    console.log(`${colors.red}❌ Invalid package.json path${colors.reset}`);
    return false;
  }
  
  const packageJson = JSON.parse(readFileSafe(packageJsonPath));
  const scriptsSection = findSection(content, '## Available Scripts');
  
  if (scriptsSection) {
    const currentScripts = scriptsSection.content;
    const missingScripts = [];
    
    // Check for important scripts not documented
    const importantScripts = ['prepare', 'update-docs'];
    importantScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script] && !currentScripts.includes(script)) {
        missingScripts.push(`-   **\`npm run ${script}\`**: ${getScriptDescription(script)}`);
      }
    });
    
    if (missingScripts.length > 0) {
      const updatedLines = [...scriptsSection.lines];
      updatedLines.splice(scriptsSection.start + 1, 0, ...missingScripts);
      content = updatedLines.join('\n');
      updated = true;
      console.log(`${colors.green}✅ Added ${missingScripts.length} new script(s) to Available Scripts${colors.reset}`);
    }
  }
  
  // Update Components section with new components
  if (changes.newComponents.length > 0) {
    const componentsSection = findSection(content, '### UI Components (`src/app/components/`)');
    
    if (componentsSection) {
      const newComponentsList = changes.newComponents.filter(comp => comp.type === 'component');
      const newComponentDocs = newComponentsList
        .map(comp => `- **\`${comp.name}/\`**: ${formatName(comp.name)} component`);
      
      if (newComponentDocs.length > 0) {
        const updatedLines = [...componentsSection.lines];
        updatedLines.splice(componentsSection.start + 1, 0, ...newComponentDocs);
        content = updatedLines.join('\n');
        updated = true;
        console.log(`${colors.green}✅ Added ${newComponentDocs.length} new component(s) to documentation${colors.reset}`);
      }
    }
  }
  
  // Update Services section with new services
  if (changes.newServices.length > 0) {
    const servicesSection = findSection(content, '### Core Services (`src/app/core/services/`)');
    
    if (servicesSection) {
      const newServiceDocs = changes.newServices
        .map(svc => `- **\`${svc.name}.service.ts\`**: ${formatName(svc.name)} service`);
      
      const updatedLines = [...servicesSection.lines];
      updatedLines.splice(servicesSection.start + 1, 0, ...newServiceDocs);
      content = updatedLines.join('\n');
      updated = true;
      console.log(`${colors.green}✅ Added ${changes.newServices.length} new service(s) to documentation${colors.reset}`);
    }
  }
  
  if (updated) {
    try {
      safeWriteFile(readmePath, content);
      execGit('git', ['add', 'README.md']);
      console.log(`${colors.green}✅ Updated and staged README.md${colors.reset}`);
      return true;
    } catch (error) {
      console.error(`${colors.red}❌ Failed to update README.md: ${error.message}${colors.reset}`);
      return false;
    }
  } else {
    console.log(`${colors.cyan}ℹ️  No README.md updates needed for current changes${colors.reset}`);
    return false;
  }
}

/**
 * Get description for script
 */
function getScriptDescription(scriptName) {
  const descriptions = {
    'prepare': 'Initializes Husky git hooks',
    'update-docs': 'Updates project documentation based on git changes'
  };
  return descriptions[scriptName] || 'Project script';
}

/**
 * Format name for documentation (DRY principle)
 * @param {string} name - Name to format
 * @returns {string} Formatted name
 */
function formatName(name) {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check README.md quality
 */
function checkReadmeQuality() {
  console.log(`\n${colors.blue}📖 Checking README.md quality...${colors.reset}\n`);
  
  const projectRoot = getProjectRoot();
  const readmePath = path.join(projectRoot, 'README.md');
  
  // Validate path
  if (!readmePath.startsWith(projectRoot)) {
    console.log(`${colors.red}❌ Invalid README.md path${colors.reset}`);
    return false;
  }
  
  if (!fs.existsSync(readmePath)) {
    console.log(`${colors.red}❌ README.md not found${colors.reset}`);
    return false;
  }
  
  const content = readFileSafe(readmePath);
  
  // Required sections for a quality README
  const requiredSections = [
    'Installation',
    'Usage',
    'Tech Stack'
  ];
  
  const recommendedSections = [
    'Features',
    'Contributing',
    'License',
    'Testing',
    'Deployment'
  ];
  
  const missingSections = requiredSections.filter(section => 
    !content.includes(`## ${section}`) && !content.includes(`# ${section}`)
  );
  
  const missingRecommended = recommendedSections.filter(section =>
    !content.includes(`## ${section}`) && !content.includes(`# ${section}`)
  );
  
  if (missingSections.length > 0) {
    console.log(`${colors.red}❌ README.md missing required sections:${colors.reset}`);
    missingSections.forEach(section => {
      console.log(`   - ${section}`);
    });
    return false;
  }
  
  if (missingRecommended.length > 0) {
    console.log(`${colors.yellow}⚠️  README.md missing recommended sections:${colors.reset}`);
    missingRecommended.forEach(section => {
      console.log(`   - ${section}`);
    });
  }
  
  console.log(`${colors.green}✅ README.md has all required sections${colors.reset}`);
  return true;
}

/**
 * Analyze staged files for documentation impact
 */
function analyzeStagedFiles(stagedFiles) {
  console.log(`${colors.blue}📝 Staged files:${colors.reset}`);
  
  if (stagedFiles.length === 0) {
    console.log(`${colors.yellow}   No files staged${colors.reset}`);
    return;
  }
  
  const fileTypes = {
    components: 0,
    services: 0,
    models: 0,
    tests: 0,
    docs: 0,
    other: 0
  };
  
  stagedFiles.forEach(file => {
    const [status, filepath] = file.split('\t');
    
    if (filepath.includes('.component.')) fileTypes.components++;
    else if (filepath.includes('.service.')) fileTypes.services++;
    else if (filepath.includes('.models.') || filepath.includes('interface')) fileTypes.models++;
    else if (filepath.includes('.spec.')) fileTypes.tests++;
    else if (filepath.includes('.md') || filepath.includes('docs/')) fileTypes.docs++;
    else fileTypes.other++;
    
    const statusSymbol = status === 'A' ? '+' : status === 'M' ? '~' : '-';
    console.log(`   ${statusSymbol} ${filepath}`);
  });
  
  console.log(`\n${colors.cyan}📊 File type summary:${colors.reset}`);
  if (fileTypes.components > 0) console.log(`   Components: ${fileTypes.components}`);
  if (fileTypes.services > 0) console.log(`   Services: ${fileTypes.services}`);
  if (fileTypes.models > 0) console.log(`   Models: ${fileTypes.models}`);
  if (fileTypes.tests > 0) console.log(`   Tests: ${fileTypes.tests}`);
  if (fileTypes.docs > 0) console.log(`   Documentation: ${fileTypes.docs}`);
  if (fileTypes.other > 0) console.log(`   Other: ${fileTypes.other}`);
}

/**
 * Main execution
 */
function main() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   📝 Documentation Updater Script     ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);
  
  try {
    // Get git changes
    const { stagedFiles, currentBranch } = getGitChanges();
    
    console.log(`${colors.cyan}🌿 Current branch: ${currentBranch}${colors.reset}\n`);
    
    // Analyze staged files
    analyzeStagedFiles(stagedFiles);
    
    // Analyze code changes
    const changes = analyzeFileChanges(stagedFiles);
    
    // Display change summary
    if (changes.newComponents.length > 0 || changes.newServices.length > 0) {
      console.log(`\n${colors.blue}� Code changes detected:${colors.reset}`);
      if (changes.newComponents.length > 0) {
        console.log(`${colors.green}   + ${changes.newComponents.length} new component(s)${colors.reset}`);
      }
      if (changes.newServices.length > 0) {
        console.log(`${colors.green}   + ${changes.newServices.length} new service(s)${colors.reset}`);
      }
      if (changes.modifiedComponents.length > 0) {
        console.log(`${colors.yellow}   ~ ${changes.modifiedComponents.length} modified component(s)${colors.reset}`);
      }
      if (changes.modifiedServices.length > 0) {
        console.log(`${colors.yellow}   ~ ${changes.modifiedServices.length} modified service(s)${colors.reset}`);
      }
    }
    
    // Update README.md based on changes
    updateReadme(changes);
    
    // Check README quality
    checkReadmeQuality();
    
    console.log(`\n${colors.green}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}║   ✨ Documentation update complete!   ║${colors.reset}`);
    console.log(`${colors.green}╚════════════════════════════════════════╝${colors.reset}\n`);
    
  } catch (error) {
    console.error(`\n${colors.red}❌ Error updating documentation:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run the script
main();
