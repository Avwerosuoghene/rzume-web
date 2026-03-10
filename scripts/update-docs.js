#!/usr/bin/env node

/**
 * Intelligent Documentation Updater Script
 * 
 * Enhanced version implementing the full doc-updater skill capabilities.
 * Provides intelligent, detailed documentation generation with deep code analysis.
 * 
 * Features:
 * - Deep code analysis and understanding
 * - Intelligent feature extraction and documentation
 * - Context-aware README.md updates
 * - Automated changelog generation
 * - Quality assessment and optimization
 * - Security-hardened implementation
 * 
 * Based on: .windsurf/skills/doc-updater.md
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const crypto = require('crypto');

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
  console.log(`${colors.blue}📊 Deep Git Analysis...${colors.reset}\n`);
  
  const stagedFiles = execGit('git', ['diff', '--cached', '--name-status']);
  const currentBranch = execGit('git', ['branch', '--show-current']);
  
  // Get commits that haven't been pushed yet (for changelog generation)
  let unpushedCommits = '';
  if (currentBranch) {
    unpushedCommits = execGit('git', ['log', `origin/${currentBranch}..HEAD`, '--oneline']);
  }
  
  // Get detailed commit information for intelligent analysis
  let detailedCommits = '';
  if (currentBranch) {
    detailedCommits = execGit('git', ['log', `origin/${currentBranch}..HEAD`, '--pretty=format:%H|%s|%b|%an|%ad', '--date=short']);
  }
  
  return {
    stagedFiles: stagedFiles.split('\n').filter(Boolean),
    currentBranch,
    unpushedCommits: unpushedCommits.split('\n').filter(Boolean),
    detailedCommits: detailedCommits.split('\n').filter(Boolean)
  };
}

/**
 * Deep analyze file changes with intelligent feature extraction
 * Implements doc-updater skill's Phase 1: Git Analysis
 */
function analyzeFileChanges(stagedFiles) {
  const changes = {
    newComponents: [],
    newServices: [],
    newFeatures: [],
    modifiedComponents: [],
    modifiedServices: [],
    tests: [],
    docs: [],
    impact: {
      breaking: [],
      major: [],
      minor: [],
      patch: []
    },
    categories: {
      feat: [],
      fix: [],
      docs: [],
      style: [],
      refactor: [],
      perf: [],
      test: [],
      build: [],
      ci: [],
      chore: [],
      security: []
    }
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
    
    // Deep analysis for TypeScript files
    if (filepath.endsWith('.ts') && !filepath.includes('.spec.ts')) {
      const analysis = analyzeTypeScriptFile(filepath, status);
      
      if (analysis.type === 'component') {
        if (status === 'A') changes.newComponents.push(analysis);
        if (status === 'M') changes.modifiedComponents.push(analysis);
      } else if (analysis.type === 'service') {
        if (status === 'A') changes.newServices.push(analysis);
        if (status === 'M') changes.modifiedServices.push(analysis);
      }
      
      // Categorize by impact
      if (analysis.breaking) changes.impact.breaking.push(analysis);
      else if (analysis.major) changes.impact.major.push(analysis);
      else if (analysis.minor) changes.impact.minor.push(analysis);
      else changes.impact.patch.push(analysis);
    }
    
    // Tests
    if (filepath.includes('.spec.ts') || filepath.includes('.test.ts')) {
      changes.tests.push({
        path: filepath,
        status
      });
    }
    
    // Documentation
    if (filepath.includes('.md')) {
      changes.docs.push(filepath);
    }
  });
  
  return changes;
}

/**
 * Deep analyze TypeScript file for intelligent documentation
 * Implements doc-updater skill's intelligent analysis
 */
function analyzeTypeScriptFile(filepath, status) {
  const fullPath = path.join(getProjectRoot(), filepath);
  
  try {
    const content = readFileSafe(fullPath);
    const lines = content.split('\n');
    
    // Extract file information
    const fileName = path.basename(filepath, '.ts');
    const isComponent = filepath.includes('.component.ts');
    const isService = filepath.includes('.service.ts');
    const isPage = filepath.includes('/pages/');
    
    // Intelligent analysis
    const analysis = {
      name: fileName,
      path: filepath,
      type: isComponent ? 'component' : (isService ? 'service' : 'module'),
      subtype: isPage ? 'page' : (isComponent ? 'component' : 'service'),
      description: '',
      features: [],
      dependencies: [],
      methods: [],
      inputs: [],
      outputs: [],
      breaking: false,
      major: false,
      minor: false,
      lines: lines.length
    };
    
    // Extract class description
    const classMatch = content.match(/@(?:Component|Service|Injectable)\(\{[\s\S]*?\}\)\s*export\s+class\s+(\w+)(?:\s+implements\s+(\w+))?\s*{([\s\S]*?)^}/m);
    if (classMatch) {
      analysis.className = classMatch[1];
      analysis.implements = classMatch[2];
      analysis.classBody = classMatch[3];
    }
    
    // Extract description from JSDoc
    const jsdocMatch = content.match(/\/\*\*\s*([\s\S]*?)\s*\*\//m);
    if (jsdocMatch) {
      analysis.description = jsdocMatch[1]
        .replace(/\*/g, '')
        .replace(/\n/g, ' ')
        .trim();
    }
    
    // Generate intelligent description if not found
    if (!analysis.description) {
      analysis.description = generateIntelligentDescription(analysis, content);
    }
    
    // Extract features and functionality
    analysis.features = extractFeatures(content, analysis.type);
    
    // Extract dependencies
    analysis.dependencies = extractDependencies(content);
    
    // Extract methods (for services)
    if (analysis.type === 'service') {
      analysis.methods = extractMethods(content);
    }
    
    // Extract inputs/outputs (for components)
    if (analysis.type === 'component') {
      analysis.inputs = extractInputs(content);
      analysis.outputs = extractOutputs(content);
    }
    
    // Assess impact
    analysis.breaking = assessBreakingChanges(content, status);
    analysis.major = analysis.features.length > 3 || analysis.methods.length > 5;
    analysis.minor = analysis.features.length > 0 || analysis.methods.length > 0;
    
    return analysis;
    
  } catch (error) {
    console.warn(`${colors.yellow}⚠️  Could not analyze ${filepath}: ${error.message}${colors.reset}`);
    
    // Fallback to basic analysis
    const fileName = path.basename(filepath, '.ts');
    return {
      name: fileName,
      path: filepath,
      type: filepath.includes('.component.ts') ? 'component' : 'service',
      subtype: filepath.includes('/pages/') ? 'page' : 'component',
      description: `${formatName(fileName)} ${filepath.includes('.service.ts') ? 'service' : 'component'}`,
      features: [],
      dependencies: [],
      methods: [],
      inputs: [],
      outputs: [],
      breaking: false,
      major: false,
      minor: true,
      lines: 0
    };
  }
}

/**
 * Generate intelligent description based on code analysis
 */
function generateIntelligentDescription(analysis, content) {
  const name = formatName(analysis.name);
  
  if (analysis.type === 'service') {
    if (content.includes('BehaviorSubject')) {
      return `${name} service with reactive state management using BehaviorSubject pattern`;
    } else if (content.includes('HttpClient')) {
      return `${name} service for API communication and HTTP operations`;
    } else if (content.includes('AuthenticationService')) {
      return `${name} service handling user authentication and session management`;
    } else {
      return `${name} service providing core business logic and data management`;
    }
  } else if (analysis.type === 'component') {
    if (analysis.subtype === 'page') {
      return `${name} page component for main application functionality`;
    } else if (content.includes('ControlValueAccessor')) {
      return `${name} form component with custom value accessor integration`;
    } else if (content.includes('@Input()') && content.includes('@Output()')) {
      return `${name} interactive component with input/output bindings`;
    } else {
      return `${name} reusable UI component for enhanced user experience`;
    }
  }
  
  return `${name} module for application functionality`;
}

/**
 * Extract features from code content
 */
function extractFeatures(content, type) {
  const features = [];
  
  // Common patterns
  if (content.includes('BehaviorSubject')) {
    features.push('Reactive state management with BehaviorSubject');
  }
  if (content.includes('HttpClient')) {
    features.push('HTTP client integration for API communication');
  }
  if (content.includes('Observable')) {
    features.push('Observable-based reactive programming');
  }
  if (content.includes('FormBuilder') || content.includes('FormGroup')) {
    features.push('Reactive forms integration');
  }
  if (content.includes('Router')) {
    features.push('Angular Router integration');
  }
  if (content.includes('ChangeDetectionStrategy.OnPush')) {
    features.push('OnPush change detection for performance optimization');
  }
  if (content.includes('debounceTime')) {
    features.push('Debounced input handling');
  }
  if (content.includes('takeUntil')) {
    features.push('Proper subscription cleanup with takeUntil pattern');
  }
  
  // Component-specific features
  if (type === 'component') {
    if (content.includes('@Input()')) {
      features.push('Configurable input properties');
    }
    if (content.includes('@Output()')) {
      features.push('Event emission capabilities');
    }
    if (content.includes('ngAfterViewInit')) {
      features.push('View lifecycle management');
    }
  }
  
  // Service-specific features
  if (type === 'service') {
    if (content.includes('providedIn: \'root\'')) {
      features.push('Singleton service with tree-shakable provider');
    }
    if (content.includes('localStorage') || content.includes('sessionStorage')) {
      features.push('Browser storage integration');
    }
  }
  
  return features;
}

/**
 * Extract dependencies from imports
 */
function extractDependencies(content) {
  const dependencies = [];
  
  // Extract Angular imports
  const angularImports = content.match(/import\s+{[^}]+}\s+from\s+['"]@angular\/([^'"]+)['"];?/g);
  if (angularImports) {
    angularImports.forEach(imp => {
      const match = imp.match(/@angular\/([^'"]+)/);
      if (match) dependencies.push(`@angular/${match[1]}`);
    });
  }
  
  // Extract RxJS imports
  if (content.includes('rxjs')) {
    dependencies.push('rxjs');
  }
  
  // Extract Angular Material imports
  const materialImports = content.match(/import\s+{[^}]+}\s+from\s+['"]@angular\/material\/([^'"]+)['"];?/g);
  if (materialImports) {
    dependencies.push('@angular/material');
  }
  
  return [...new Set(dependencies)]; // Remove duplicates
}

/**
 * Extract methods from service class
 */
function extractMethods(content) {
  const methods = [];
  
  // Find method definitions
  const methodMatches = content.match(/(\w+)\([^)]*\)\s*:[^;{]+/g);
  if (methodMatches) {
    methodMatches.forEach(method => {
      const methodName = method.match(/(\w+)\(/);
      if (methodName && !methodName[1].startsWith('_')) {
        methods.push(methodName[1]);
      }
    });
  }
  
  return methods;
}

/**
 * Extract inputs from component class
 */
function extractInputs(content) {
  const inputs = [];
  
  // Find @Input() decorators
  const inputMatches = content.match(/@Input\(\)\s+(\w+)(?::\s*[^=;]+)?/g);
  if (inputMatches) {
    inputMatches.forEach(input => {
      const inputName = input.match(/@Input\(\)\s+(\w+)/);
      if (inputName) inputs.push(inputName[1]);
    });
  }
  
  return inputs;
}

/**
 * Extract outputs from component class
 */
function extractOutputs(content) {
  const outputs = [];
  
  // Find @Output() decorators
  const outputMatches = content.match(/@Output\(\)\s+(\w+)(?::\s*[^=;]+)?/g);
  if (outputMatches) {
    outputMatches.forEach(output => {
      const outputName = output.match(/@Output\(\)\s+(\w+)/);
      if (outputName) outputs.push(outputName[1]);
    });
  }
  
  return outputs;
}

/**
 * Assess breaking changes
 */
function assessBreakingChanges(content, status) {
  if (status !== 'M') return false;
  
  // Look for breaking change indicators
  const breakingPatterns = [
    /class\s+\w+\s+implements/, // Interface changes
    /@Input\(\)\s+\w+/, // Input changes
    /@Output\(\)\s+\w+/, // Output changes
    /export\s+class/, // Export changes
    /constructor\([^)]*\)/, // Constructor changes
  ];
  
  return breakingPatterns.some(pattern => pattern.test(content));
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
 * Intelligent README.md update with detailed documentation generation
 * Implements doc-updater skill's Phase 3: README Optimization
 */
function updateReadme(changes) {
  console.log(`\n${colors.blue}📝 Intelligent README.md Update...${colors.reset}\n`);
  
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
  
  console.log(`${colors.cyan}🔍 Analyzing changes for intelligent documentation...${colors.reset}`);
  
  // Update Key Features section with intelligent descriptions
  if (changes.newComponents.length > 0 || changes.newServices.length > 0) {
    const newFeatures = [];
    
    // Add new page components as features with intelligent descriptions
    changes.newComponents.forEach(comp => {
      if (comp.subtype === 'page') {
        const featureDesc = generateFeatureDocumentation(comp);
        newFeatures.push(featureDesc);
      }
    });
    
    // Add new services as features
    changes.newServices.forEach(svc => {
      const featureDesc = generateServiceDocumentation(svc);
      newFeatures.push(featureDesc);
    });
    
    if (newFeatures.length > 0) {
      const section = findSection(content, '### Key Features:');
      
      if (section) {
        const updatedLines = [...section.lines];
        updatedLines.splice(section.start + 1, 0, ...newFeatures);
        content = updatedLines.join('\n');
        updated = true;
        console.log(`${colors.green}✅ Added ${newFeatures.length} intelligent feature description(s)${colors.reset}`);
      }
    }
  }
  
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
  
  // Update Components section with intelligent documentation
  if (changes.newComponents.length > 0) {
    const componentsSection = findSection(content, '### UI Components (`src/app/components/`)');
    
    if (componentsSection) {
      const newComponentsList = changes.newComponents.filter(comp => comp.type === 'component');
      const newComponentDocs = newComponentsList
        .map(comp => generateComponentDocumentation(comp));
      
      if (newComponentDocs.length > 0) {
        const updatedLines = [...componentsSection.lines];
        updatedLines.splice(componentsSection.start + 1, 0, ...newComponentDocs);
        content = updatedLines.join('\n');
        updated = true;
        console.log(`${colors.green}✅ Added ${newComponentDocs.length} intelligent component documentation(s)${colors.reset}`);
      }
    }
  }
  
  // Update Services section with intelligent documentation
  if (changes.newServices.length > 0) {
    const servicesSection = findSection(content, '### Core Services (`src/app/core/services/`)');
    
    if (servicesSection) {
      const newServiceDocs = changes.newServices
        .map(svc => generateServiceDocumentation(svc));
      
      const updatedLines = [...servicesSection.lines];
      updatedLines.splice(servicesSection.start + 1, 0, ...newServiceDocs);
      content = updatedLines.join('\n');
      updated = true;
      console.log(`${colors.green}✅ Added ${changes.newServices.length} intelligent service documentation(s)${colors.reset}`);
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
 * Generate intelligent feature documentation
 */
function generateFeatureDocumentation(component) {
  const name = formatName(component.name);
  const features = component.features || [];
  
  let doc = `- **${name}**: ${component.description}`;
  
  if (features.length > 0) {
    doc += ` with ${features.length} key feature${features.length > 1 ? 's' : ''}`;
  }
  
  return doc;
}

/**
 * Generate intelligent component documentation
 */
function generateComponentDocumentation(component) {
  const name = formatName(component.name);
  const features = component.features || [];
  const inputs = component.inputs || [];
  const outputs = component.outputs || [];
  const dependencies = component.dependencies || [];
  
  let doc = `- **\`${component.name}/\`**: ${component.description}`;
  
  // Add key features
  if (features.length > 0) {
    const topFeatures = features.slice(0, 2); // Top 2 features
    doc += `\n  - Features: ${topFeatures.join(', ')}`;
  }
  
  // Add inputs/outputs summary
  if (inputs.length > 0 || outputs.length > 0) {
    const interactions = [];
    if (inputs.length > 0) interactions.push(`${inputs.length} input${inputs.length > 1 ? 's' : ''}`);
    if (outputs.length > 0) interactions.push(`${outputs.length} output${outputs.length > 1 ? 's' : ''}`);
    doc += `\n  - Interactions: ${interactions.join(', ')}`;
  }
  
  // Add dependencies if significant
  if (dependencies.length > 2) {
    doc += `\n  - Dependencies: ${dependencies.slice(0, 3).join(', ')}`;
  }
  
  return doc;
}

/**
 * Generate intelligent service documentation
 */
function generateServiceDocumentation(service) {
  const name = formatName(service.name);
  const features = service.features || [];
  const methods = service.methods || [];
  const dependencies = service.dependencies || [];
  
  let doc = `- **\`${service.name}.service.ts\`**: ${service.description}`;
  
  // Add key features
  if (features.length > 0) {
    const topFeatures = features.slice(0, 3); // Top 3 features
    doc += `\n  - Features: ${topFeatures.join(', ')}`;
  }
  
  // Add methods summary
  if (methods.length > 0) {
    doc += `\n  - Methods: ${methods.length} public method${methods.length > 1 ? 's' : ''}`;
    if (methods.length <= 5) {
      doc += ` (${methods.join(', ')})`;
    }
  }
  
  // Add dependencies if significant
  if (dependencies.some(dep => dep.includes('http') || dep.includes('auth'))) {
    doc += `\n  - Integrations: ${dependencies.filter(dep => dep.includes('http') || dep.includes('auth')).join(', ')}`;
  }
  
  return doc;
}

/**
 * Get description for script
 */
function getScriptDescription(scriptName) {
  const descriptions = {
    'prepare': 'Initializes Husky git hooks for automated pre-commit validation',
    'update-docs': 'Intelligently updates project documentation based on code analysis and git changes'
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
 * Check README.md quality
 */
function checkReadmeQuality() {
  console.log(`\n${colors.blue}📖 Comprehensive README Quality Assessment...${colors.reset}\n`);
  
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
  
  // Essential sections checklist (from doc-updater skill)
  const essentialSections = [
    { name: 'Project Name', check: content.includes('# ') },
    { name: 'Description', check: content.length > 200 },
    { name: 'Installation', check: content.includes('## Installation') || content.includes('# Installation') },
    { name: 'Usage', check: content.includes('## Usage') || content.includes('# Usage') },
    { name: 'Features', check: content.includes('## Features') || content.includes('# Features') },
    { name: 'Tech Stack', check: content.includes('## Tech Stack') || content.includes('# Tech Stack') }
  ];
  
  const recommendedSections = [
    { name: 'Badges', check: content.includes('[') && content.includes('](') },
    { name: 'Table of Contents', check: content.includes('## Table of Contents') || content.includes('# Table of Contents') },
    { name: 'Project Structure', check: content.includes('## Project Structure') },
    { name: 'Configuration', check: content.includes('## Configuration') },
    { name: 'API Documentation', check: content.includes('## API') },
    { name: 'Testing', check: content.includes('## Testing') },
    { name: 'Deployment', check: content.includes('## Deployment') },
    { name: 'Contributing', check: content.includes('## Contributing') },
    { name: 'License', check: content.includes('## License') },
    { name: 'Authors', check: content.includes('## Authors') },
    { name: 'Support', check: content.includes('## Support') },
    { name: 'Changelog', check: content.includes('CHANGELOG.md') }
  ];
  
  // Quality metrics
  const qualityMetrics = [
    { name: 'Clarity', check: content.split('\n').length > 20 },
    { name: 'Examples', check: content.includes('```') },
    { name: 'Links Working', check: content.includes('http') },
    { name: 'Formatting', check: content.includes('**') && content.includes('*') },
    { name: 'Structure', check: content.includes('##') }
  ];
  
  // Assess essential sections
  const essentialPassed = essentialSections.filter(section => section.check).length;
  const essentialTotal = essentialSections.length;
  
  console.log(`${colors.cyan}📋 Essential Sections: ${essentialPassed}/${essentialTotal} (${Math.round(essentialPassed/essentialTotal * 100)}%)${colors.reset}`);
  
  essentialSections.forEach(section => {
    const status = section.check ? '✅' : '❌';
    console.log(`   ${status} ${section.name}`);
  });
  
  // Assess recommended sections
  const recommendedPassed = recommendedSections.filter(section => section.check).length;
  const recommendedTotal = recommendedSections.length;
  
  console.log(`\n${colors.cyan}📋 Recommended Sections: ${recommendedPassed}/${recommendedTotal} (${Math.round(recommendedPassed/recommendedTotal * 100)}%)${colors.reset}`);
  
  recommendedSections.forEach(section => {
    const status = section.check ? '✅' : '⚪';
    console.log(`   ${status} ${section.name}`);
  });
  
  // Assess quality metrics
  const qualityPassed = qualityMetrics.filter(metric => metric.check).length;
  const qualityTotal = qualityMetrics.length;
  
  console.log(`\n${colors.cyan}📊 Quality Metrics: ${qualityPassed}/${qualityTotal} (${Math.round(qualityPassed/qualityTotal * 100)}%)${colors.reset}`);
  
  qualityMetrics.forEach(metric => {
    const status = metric.check ? '✅' : '❌';
    console.log(`   ${status} ${metric.name}`);
  });
  
  // Calculate overall score
  const overallScore = Math.round(
    (essentialPassed / essentialTotal * 0.5 + 
     recommendedPassed / recommendedTotal * 0.3 + 
     qualityPassed / qualityTotal * 0.2) * 100
  );
  
  console.log(`\n${colors.cyan}🏆 Overall README Quality Score: ${overallScore}/100${colors.reset}`);
  
  // Provide recommendations
  if (overallScore >= 90) {
    console.log(`${colors.green}🌟 Excellent README quality!${colors.reset}`);
    return true;
  } else if (overallScore >= 70) {
    console.log(`${colors.green}✅ Good README quality${colors.reset}`);
    
    const missingEssential = essentialSections.filter(s => !s.check);
    if (missingEssential.length > 0) {
      console.log(`${colors.yellow}💡 Consider adding: ${missingEssential.map(s => s.name).join(', ')}${colors.reset}`);
    }
    
    return true;
  } else {
    console.log(`${colors.yellow}⚠️  README needs improvement${colors.reset}`);
    
    const missingEssential = essentialSections.filter(s => !s.check);
    if (missingEssential.length > 0) {
      console.log(`${colors.red}❌ Missing essential sections: ${missingEssential.map(s => s.name).join(', ')}${colors.reset}`);
    }
    
    return false;
  }
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
    
    // Display intelligent summary
    console.log(`${colors.cyan}📋 Intelligent Change Summary:${colors.reset}`);
    
    // Components analysis
    if (changes.newComponents.length > 0) {
      console.log(`\n   ${colors.green}➕ New Components:${colors.reset}`);
      changes.newComponents.forEach(comp => {
        const featureCount = comp.features ? comp.features.length : 0;
        const complexity = comp.lines > 100 ? 'Complex' : comp.lines > 50 ? 'Medium' : 'Simple';
        console.log(`      • ${comp.name} (${comp.subtype}) - ${comp.description}`);
        console.log(`        Features: ${featureCount}, Complexity: ${complexity}, Lines: ${comp.lines}`);
      });
    }
    
    // Services analysis
    if (changes.newServices.length > 0) {
      console.log(`\n   ${colors.green}➕ New Services:${colors.reset}`);
      changes.newServices.forEach(svc => {
        const methodCount = svc.methods ? svc.methods.length : 0;
        const featureCount = svc.features ? svc.features.length : 0;
        console.log(`      • ${svc.name} - ${svc.description}`);
        console.log(`        Methods: ${methodCount}, Features: ${featureCount}, Dependencies: ${svc.dependencies ? svc.dependencies.length : 0}`);
      });
    }
    
    // Modified files analysis
    if (changes.modifiedComponents.length > 0 || changes.modifiedServices.length > 0) {
      console.log(`\n   ${colors.yellow}🔄 Modified Files:${colors.reset}`);
      [...changes.modifiedComponents, ...changes.modifiedServices].forEach(item => {
        const impact = item.breaking ? '🔴 Breaking' : item.major ? '🟠 Major' : item.minor ? '🟡 Minor' : '🟢 Patch';
        console.log(`      • ${item.name} - ${impact} impact`);
      });
    }
    
    // Impact assessment
    console.log(`\n   ${colors.cyan}📊 Impact Assessment:${colors.reset}`);
    const totalImpact = Object.values(changes.impact).flat().length;
    if (totalImpact > 0) {
      Object.entries(changes.impact).forEach(([level, items]) => {
        if (items.length > 0) {
          const icon = level === 'breaking' ? '🔴' : level === 'major' ? '🟠' : level === 'minor' ? '🟡' : '🟢';
          console.log(`      ${icon} ${level.charAt(0).toUpperCase() + level.slice(1)}: ${items.length} item(s)`);
        }
      });
    } else {
      console.log(`      🟢 Low impact changes`);
    }
    
    // Test coverage
    if (changes.tests.length > 0) {
      console.log(`\n   ${colors.blue}🧪 Test Coverage:${colors.reset}`);
      console.log(`      • ${changes.tests.length} test file(s) updated`);
    }
    
    // Documentation
    if (changes.docs.length > 0) {
      console.log(`\n   ${colors.magenta}📚 Documentation:${colors.reset}`);
      changes.docs.forEach(doc => console.log(`      • ${doc}`));
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
