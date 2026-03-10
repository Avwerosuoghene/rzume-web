---
name: Code Reviewer - Security & Quality Analysis
description: Comprehensive code review skill for identifying bugs, vulnerabilities, security issues, and code quality problems in Angular applications
tags: [code-review, security, vulnerabilities, bugs, quality, owasp]
---

# Code Reviewer Skill

This skill provides enterprise-grade code review capabilities with a strong focus on security vulnerabilities, potential bugs, performance issues, and code quality. It follows OWASP security guidelines and Angular best practices to ensure robust, secure, and maintainable code.

## Overview

The Code Reviewer skill performs multi-layered analysis:
- **Security Analysis**: OWASP Top 10, XSS, CSRF, injection attacks, authentication flaws
- **Vulnerability Detection**: Common security vulnerabilities and exploits
- **Bug Detection**: Logic errors, edge cases, race conditions, memory leaks
- **Performance Analysis**: Performance bottlenecks, optimization opportunities
- **Code Quality**: Best practices, maintainability, technical debt
- **Angular-Specific**: Framework-specific security and performance issues

## Review Philosophy

### Defense in Depth
- Multiple layers of security validation
- Assume all user input is malicious
- Fail securely by default
- Principle of least privilege

### Security-First Mindset
- Security is not optional
- Prevention over detection
- Secure by design, not as an afterthought
- Regular security audits

### Quality Standards
- Code should be self-documenting
- Follow SOLID principles
- Maintain high test coverage
- Zero tolerance for known vulnerabilities

## Workflow Phases

### Phase 1: Pre-Review Analysis

#### 1.1 Context Gathering
**Objective**: Understand the code being reviewed

**Information to Collect**:
- What is the purpose of this code?
- What files/components are being reviewed?
- What is the security context? (authentication, data handling, user input)
- What are the dependencies?
- What is the data flow?
- Are there any third-party integrations?

**Review Scope**:
- [ ] New feature implementation
- [ ] Bug fix
- [ ] Refactoring
- [ ] Security patch
- [ ] Performance optimization
- [ ] Dependency update

**Deliverable**: Review scope and context document

#### 1.2 Reference Standards
**Objective**: Align review with project and industry standards

**Project Standards**:
- `@/.windsurf/rules/angular-core-standards.md`: Angular patterns
- `@/.windsurf/rules/code-quality.md`: Quality standards
- `@/.windsurf/rules/testing-standards.md`: Testing requirements
- `@/AGENTS.md`: Architectural principles

**Industry Standards**:
- OWASP Top 10 (2021)
- Angular Security Best Practices
- TypeScript Security Guidelines
- CWE (Common Weakness Enumeration)

**Deliverable**: Standards checklist

### Phase 2: Security Analysis

#### 2.1 OWASP Top 10 Analysis

##### A01:2021 – Broken Access Control
**What to Check**:
- [ ] Authorization checks on all protected routes
- [ ] Server-side access control enforcement
- [ ] No client-side only authorization
- [ ] Proper role-based access control (RBAC)
- [ ] Prevention of IDOR (Insecure Direct Object References)
- [ ] No privilege escalation vulnerabilities
- [ ] Proper session management

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Client-side only authorization
if (user.role === 'admin') {
  // Show admin features
}

// ❌ BAD: Direct object reference without authorization
getUser(userId: string) {
  return this.http.get(`/api/users/${userId}`);
}

// ✅ GOOD: Server-side authorization with proper checks
@Injectable()
export class UserService {
  getUser(userId: string) {
    // Server validates user has permission to access this user
    return this.http.get(`/api/users/${userId}`).pipe(
      catchError(error => {
        if (error.status === 403) {
          // Handle unauthorized access
        }
        return throwError(() => error);
      })
    );
  }
}
```

**Security Issues to Report**:
- Missing authorization checks
- Client-side only access control
- Insecure direct object references
- Missing role validation
- Privilege escalation risks

##### A02:2021 – Cryptographic Failures
**What to Check**:
- [ ] No sensitive data in localStorage/sessionStorage
- [ ] Proper encryption for sensitive data
- [ ] Secure token storage
- [ ] No hardcoded secrets or API keys
- [ ] Proper SSL/TLS usage
- [ ] Secure cookie attributes (HttpOnly, Secure, SameSite)

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Storing sensitive data in localStorage
localStorage.setItem('password', userPassword);
localStorage.setItem('apiKey', 'sk-1234567890');

// ❌ BAD: Hardcoded secrets
const API_KEY = 'sk-1234567890abcdef';
const SECRET = 'my-secret-key';

// ❌ BAD: Insecure cookie settings
document.cookie = `token=${authToken}`;

// ✅ GOOD: Secure token storage
@Injectable()
export class StorageService {
  // Use sessionStorage for tokens (better than localStorage)
  // Server should set HttpOnly cookies for sensitive data
  setToken(token: string): void {
    sessionStorage.setItem('token', token);
  }
}

// ✅ GOOD: Environment-based configuration
export const environment = {
  apiUrl: process.env['API_URL'],
  // Never commit actual keys
};
```

**Security Issues to Report**:
- Sensitive data in localStorage
- Hardcoded secrets or credentials
- Insecure data transmission
- Missing encryption
- Weak cryptographic algorithms

##### A03:2021 – Injection
**What to Check**:
- [ ] No SQL injection vulnerabilities
- [ ] Proper HTML sanitization
- [ ] No XSS (Cross-Site Scripting) vulnerabilities
- [ ] Safe DOM manipulation
- [ ] Proper input validation
- [ ] No template injection
- [ ] No command injection

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Unsafe innerHTML binding
@Component({
  template: `<div [innerHTML]="userInput"></div>`
})
export class UnsafeComponent {
  userInput = '<script>alert("XSS")</script>';
}

// ❌ BAD: Direct DOM manipulation without sanitization
element.innerHTML = userInput;

// ❌ BAD: Dynamic template creation
const template = `<div>${userInput}</div>`;

// ✅ GOOD: Using Angular's built-in sanitization
@Component({
  template: `<div [innerHTML]="sanitizedHtml"></div>`
})
export class SafeComponent {
  private sanitizer = inject(DomSanitizer);
  
  get sanitizedHtml() {
    return this.sanitizer.sanitize(
      SecurityContext.HTML,
      this.userInput
    );
  }
}

// ✅ GOOD: Using text interpolation (auto-escaped)
@Component({
  template: `<div>{{ userInput }}</div>`
})
```

**Security Issues to Report**:
- Unsafe innerHTML usage
- Direct DOM manipulation
- Missing input sanitization
- Template injection risks
- XSS vulnerabilities

##### A04:2021 – Insecure Design
**What to Check**:
- [ ] Proper error handling (no sensitive info in errors)
- [ ] Secure defaults
- [ ] Fail securely
- [ ] Defense in depth
- [ ] Threat modeling considered
- [ ] Security requirements defined

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Exposing sensitive error details
catchError(error => {
  console.error('Database error:', error.stack);
  return throwError(() => error);
})

// ❌ BAD: Insecure defaults
@Injectable()
export class ConfigService {
  debugMode = true; // Should be false by default
  allowCORS = true; // Should be restrictive by default
}

// ✅ GOOD: Secure error handling
catchError(error => {
  console.error('Operation failed');
  // Log detailed error server-side only
  this.logger.error('Detailed error', error);
  return throwError(() => new Error('Operation failed'));
})

// ✅ GOOD: Secure defaults
@Injectable()
export class ConfigService {
  debugMode = environment.production ? false : true;
  corsOrigins = environment.allowedOrigins || [];
}
```

**Security Issues to Report**:
- Insecure default configurations
- Missing threat modeling
- Inadequate security requirements
- Lack of defense in depth

##### A05:2021 – Security Misconfiguration
**What to Check**:
- [ ] No debug mode in production
- [ ] Proper CORS configuration
- [ ] Security headers configured
- [ ] No unnecessary features enabled
- [ ] Proper error handling
- [ ] No verbose error messages
- [ ] Secure HTTP headers

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Debug mode in production
export const environment = {
  production: true,
  debug: true, // Should be false
  verbose: true
};

// ❌ BAD: Overly permissive CORS
const corsOptions = {
  origin: '*', // Allows all origins
  credentials: true
};

// ❌ BAD: Exposing stack traces
@Injectable()
export class ErrorHandler {
  handleError(error: any) {
    alert(error.stack); // Exposes internal details
  }
}

// ✅ GOOD: Proper production configuration
export const environment = {
  production: true,
  debug: false,
  logging: 'error' // Only log errors
};

// ✅ GOOD: Restrictive CORS
const corsOptions = {
  origin: ['https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST']
};
```

**Security Issues to Report**:
- Debug mode enabled in production
- Permissive CORS settings
- Missing security headers
- Verbose error messages
- Unnecessary features enabled

##### A06:2021 – Vulnerable and Outdated Components
**What to Check**:
- [ ] All dependencies up to date
- [ ] No known vulnerabilities in dependencies
- [ ] Regular security audits
- [ ] Proper version pinning
- [ ] No deprecated packages

**Commands to Run**:
```bash
# Check for vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Fix vulnerabilities
npm audit fix
```

**Security Issues to Report**:
- Outdated dependencies with known vulnerabilities
- Use of deprecated packages
- Missing security patches
- Unpatched vulnerabilities

##### A07:2021 – Identification and Authentication Failures
**What to Check**:
- [ ] Strong password requirements
- [ ] Secure session management
- [ ] Proper token handling
- [ ] No credential stuffing vulnerabilities
- [ ] Account lockout mechanisms
- [ ] Multi-factor authentication support
- [ ] Secure password reset

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Weak password validation
validatePassword(password: string): boolean {
  return password.length >= 6;
}

// ❌ BAD: Storing passwords in plain text
savePassword(password: string) {
  localStorage.setItem('password', password);
}

// ❌ BAD: No session timeout
@Injectable()
export class AuthService {
  login(credentials: LoginDto) {
    // No session timeout configured
  }
}

// ✅ GOOD: Strong password validation
validatePassword(password: string): boolean {
  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  
  return password.length >= minLength &&
         hasUpperCase &&
         hasLowerCase &&
         hasNumbers &&
         hasSpecialChar;
}

// ✅ GOOD: Secure session management
@Injectable()
export class AuthService {
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private refreshTokenTimeout: any;
  
  login(credentials: LoginDto) {
    return this.api.post('/auth/login', credentials).pipe(
      tap(response => {
        this.setSession(response);
        this.startSessionTimeout();
      })
    );
  }
  
  private startSessionTimeout() {
    this.refreshTokenTimeout = setTimeout(() => {
      this.logout();
    }, this.sessionTimeout);
  }
}
```

**Security Issues to Report**:
- Weak password requirements
- Insecure session management
- Missing account lockout
- No session timeout
- Weak authentication mechanisms

##### A08:2021 – Software and Data Integrity Failures
**What to Check**:
- [ ] Proper input validation
- [ ] Data integrity checks
- [ ] Secure deserialization
- [ ] No unsigned/unverified updates
- [ ] Proper CI/CD pipeline security

**Code Patterns to Flag**:
```typescript
// ❌ BAD: No input validation
updateUser(userData: any) {
  return this.http.put('/api/users', userData);
}

// ❌ BAD: Trusting client-side data
processPayment(amount: number) {
  // Amount comes from client, can be manipulated
  return this.http.post('/api/payment', { amount });
}

// ✅ GOOD: Proper input validation
updateUser(userData: UpdateUserDto) {
  // Validate data structure
  if (!this.isValidUserData(userData)) {
    throw new Error('Invalid user data');
  }
  
  return this.http.put('/api/users', userData);
}

// ✅ GOOD: Server-side validation
processPayment(itemId: string, quantity: number) {
  // Server calculates amount based on item and quantity
  return this.http.post('/api/payment', { itemId, quantity });
}
```

**Security Issues to Report**:
- Missing input validation
- Trusting client-side data
- Insecure deserialization
- No data integrity checks

##### A09:2021 – Security Logging and Monitoring Failures
**What to Check**:
- [ ] Proper error logging
- [ ] Security event logging
- [ ] No sensitive data in logs
- [ ] Monitoring and alerting configured
- [ ] Audit trail for critical operations

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Logging sensitive data
console.log('User logged in:', user.password, user.email);
console.log('API Key:', apiKey);

// ❌ BAD: No error logging
catchError(error => {
  return throwError(() => error);
})

// ✅ GOOD: Secure logging
@Injectable()
export class LoggerService {
  logSecurityEvent(event: string, details?: any) {
    // Remove sensitive data before logging
    const sanitized = this.sanitizeLogData(details);
    console.log(`[SECURITY] ${event}`, sanitized);
  }
  
  private sanitizeLogData(data: any): any {
    const sensitive = ['password', 'token', 'apiKey', 'secret'];
    const sanitized = { ...data };
    
    sensitive.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
```

**Security Issues to Report**:
- Logging sensitive data
- Missing security event logging
- No audit trail
- Inadequate monitoring

##### A10:2021 – Server-Side Request Forgery (SSRF)
**What to Check**:
- [ ] Validate and sanitize URLs
- [ ] Whitelist allowed domains
- [ ] No user-controlled URLs
- [ ] Proper URL parsing

**Code Patterns to Flag**:
```typescript
// ❌ BAD: User-controlled URL
fetchData(url: string) {
  return this.http.get(url); // User can specify any URL
}

// ❌ BAD: No URL validation
loadImage(imageUrl: string) {
  return this.http.get(imageUrl);
}

// ✅ GOOD: Whitelist allowed domains
@Injectable()
export class ApiService {
  private allowedDomains = [
    'https://api.yourdomain.com',
    'https://cdn.yourdomain.com'
  ];
  
  fetchData(endpoint: string) {
    const fullUrl = `${this.allowedDomains[0]}${endpoint}`;
    return this.http.get(fullUrl);
  }
  
  isAllowedUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return this.allowedDomains.some(domain => 
        url.startsWith(domain)
      );
    } catch {
      return false;
    }
  }
}
```

**Security Issues to Report**:
- User-controlled URLs
- Missing URL validation
- No domain whitelist
- SSRF vulnerabilities

#### 2.2 Angular-Specific Security Issues

##### XSS Prevention
**What to Check**:
- [ ] No unsafe innerHTML usage
- [ ] Proper DomSanitizer usage
- [ ] No bypassSecurityTrust* without justification
- [ ] Template interpolation used correctly

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Bypassing security without proper justification
bypassSecurity(html: string) {
  return this.sanitizer.bypassSecurityTrustHtml(html);
}

// ❌ BAD: Using Renderer to insert unsafe HTML
this.renderer.setProperty(element, 'innerHTML', userInput);

// ✅ GOOD: Proper sanitization
sanitizeHtml(html: string) {
  return this.sanitizer.sanitize(SecurityContext.HTML, html);
}
```

##### CSRF/XSRF Protection
**What to Check**:
- [ ] HttpClient used for all HTTP requests
- [ ] XSRF token configuration
- [ ] Proper cookie settings
- [ ] State-changing operations protected

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Using native fetch instead of HttpClient
fetch('/api/data', {
  method: 'POST',
  body: JSON.stringify(data)
});

// ✅ GOOD: Using HttpClient (automatic XSRF protection)
this.http.post('/api/data', data).subscribe();
```

### Phase 3: Bug Detection

#### 3.1 Logic Errors

**Common Patterns to Check**:
- [ ] Off-by-one errors
- [ ] Null/undefined handling
- [ ] Type coercion issues
- [ ] Async/await misuse
- [ ] Promise rejection handling
- [ ] Observable subscription leaks

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Not handling null/undefined
getUserName(user: User) {
  return user.profile.name; // Will throw if user or profile is null
}

// ❌ BAD: Async/await without error handling
async loadData() {
  const data = await this.service.getData(); // No try-catch
  this.data = data;
}

// ❌ BAD: Subscription leak
ngOnInit() {
  this.service.getData().subscribe(data => {
    this.data = data;
  }); // No unsubscribe
}

// ✅ GOOD: Proper null handling
getUserName(user: User | null): string {
  return user?.profile?.name ?? 'Unknown';
}

// ✅ GOOD: Async with error handling
async loadData() {
  try {
    const data = await this.service.getData();
    this.data = data;
  } catch (error) {
    this.handleError(error);
  }
}

// ✅ GOOD: Proper subscription management
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

**Bugs to Report**:
- Null pointer exceptions
- Unhandled promise rejections
- Memory leaks from subscriptions
- Type coercion bugs
- Off-by-one errors

#### 3.2 Race Conditions

**What to Check**:
- [ ] Concurrent state updates
- [ ] Multiple async operations
- [ ] Shared mutable state
- [ ] Event handler conflicts

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Race condition in state updates
updateCounter() {
  this.counter = this.counter + 1; // Not atomic
}

// ❌ BAD: Multiple concurrent requests
loadData() {
  this.service.getData().subscribe(data => this.data = data);
  this.service.getData().subscribe(data => this.data = data);
  // Which one wins?
}

// ✅ GOOD: Using switchMap to cancel previous requests
searchTerm$ = new Subject<string>();

ngOnInit() {
  this.searchTerm$.pipe(
    debounceTime(300),
    switchMap(term => this.service.search(term)),
    takeUntil(this.destroy$)
  ).subscribe(results => this.results = results);
}
```

**Bugs to Report**:
- Race conditions in state updates
- Concurrent request conflicts
- Shared mutable state issues

#### 3.3 Edge Cases

**What to Check**:
- [ ] Empty array/object handling
- [ ] Boundary conditions
- [ ] Maximum/minimum values
- [ ] Special characters in strings
- [ ] Large dataset handling

**Code Patterns to Flag**:
```typescript
// ❌ BAD: No empty array check
getFirstItem(items: any[]) {
  return items[0]; // Undefined if empty
}

// ❌ BAD: No boundary check
getPage(pageNumber: number) {
  return this.pages[pageNumber]; // What if out of bounds?
}

// ✅ GOOD: Proper edge case handling
getFirstItem<T>(items: T[]): T | undefined {
  return items.length > 0 ? items[0] : undefined;
}

getPage(pageNumber: number) {
  if (pageNumber < 0 || pageNumber >= this.pages.length) {
    throw new Error('Invalid page number');
  }
  return this.pages[pageNumber];
}
```

**Bugs to Report**:
- Missing edge case handling
- Boundary condition errors
- Empty data structure issues

### Phase 4: Performance Analysis

#### 4.1 Performance Anti-Patterns

**What to Check**:
- [ ] No default change detection (use OnPush)
- [ ] No function calls in templates
- [ ] Proper trackBy for *ngFor
- [ ] No unnecessary re-renders
- [ ] Lazy loading implemented
- [ ] Proper memoization

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Default change detection
@Component({
  // No changeDetection specified
})

// ❌ BAD: Function calls in template
@Component({
  template: `<div>{{ calculateTotal() }}</div>`
})

// ❌ BAD: No trackBy function
@Component({
  template: `
    @for (item of items) {
      <div>{{ item.name }}</div>
    }
  `
})

// ✅ GOOD: OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// ✅ GOOD: Computed property instead of function
@Component({
  template: `<div>{{ total }}</div>`
})
export class Component {
  get total() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}

// ✅ GOOD: TrackBy function
@Component({
  template: `
    @for (item of items; track trackById($index, item)) {
      <div>{{ item.name }}</div>
    }
  `
})
export class Component {
  trackById(index: number, item: any) {
    return item.id;
  }
}
```

**Performance Issues to Report**:
- Default change detection usage
- Function calls in templates
- Missing trackBy functions
- Unnecessary re-renders
- No lazy loading

#### 4.2 Memory Leaks

**What to Check**:
- [ ] All subscriptions cleaned up
- [ ] Event listeners removed
- [ ] Timers cleared
- [ ] No circular references

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Subscription leak
ngOnInit() {
  this.service.getData().subscribe();
  // Never unsubscribed
}

// ❌ BAD: Event listener leak
ngOnInit() {
  window.addEventListener('resize', this.onResize);
  // Never removed
}

// ❌ BAD: Timer leak
ngOnInit() {
  setInterval(() => this.update(), 1000);
  // Never cleared
}

// ✅ GOOD: Proper cleanup
private destroy$ = new Subject<void>();
private resizeListener: any;
private intervalId: any;

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe();
    
  this.resizeListener = this.onResize.bind(this);
  window.addEventListener('resize', this.resizeListener);
  
  this.intervalId = setInterval(() => this.update(), 1000);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
  
  window.removeEventListener('resize', this.resizeListener);
  clearInterval(this.intervalId);
}
```

**Performance Issues to Report**:
- Subscription leaks
- Event listener leaks
- Timer leaks
- Memory leaks

### Phase 5: Code Quality Analysis

#### 5.1 TypeScript Best Practices

**What to Check**:
- [ ] No `any` type usage
- [ ] Proper type annotations
- [ ] No type assertions without justification
- [ ] Strict null checks
- [ ] No implicit any

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Using any
function processData(data: any) {
  return data.value;
}

// ❌ BAD: Type assertion without justification
const value = data as string;

// ❌ BAD: Implicit any
function getData(id) { // id has implicit any
  return fetch(`/api/${id}`);
}

// ✅ GOOD: Proper typing
function processData(data: DataType): string {
  return data.value;
}

// ✅ GOOD: Type guard instead of assertion
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

if (isString(data)) {
  // TypeScript knows data is string here
}
```

**Quality Issues to Report**:
- Use of `any` type
- Missing type annotations
- Unsafe type assertions
- Implicit any usage

#### 5.2 Angular Best Practices

**What to Check**:
- [ ] Standalone components used
- [ ] OnPush change detection
- [ ] Modern control flow (@if, @for)
- [ ] inject() instead of constructor injection
- [ ] Proper service patterns

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Using NgModules
@NgModule({
  declarations: [Component],
  imports: [CommonModule]
})

// ❌ BAD: Constructor injection
constructor(private service: DataService) {}

// ❌ BAD: Old control flow
<div *ngIf="isVisible">Content</div>

// ✅ GOOD: Standalone component
@Component({
  standalone: true,
  imports: [CommonModule]
})

// ✅ GOOD: inject() function
private service = inject(DataService);

// ✅ GOOD: Modern control flow
@if (isVisible) {
  <div>Content</div>
}
```

**Quality Issues to Report**:
- NgModule usage
- Constructor injection
- Old control flow syntax
- Not following Angular 18 patterns

#### 5.3 Code Smells

**What to Check**:
- [ ] Long methods (>50 lines)
- [ ] Large classes (>300 lines)
- [ ] Deep nesting (>3 levels)
- [ ] Duplicate code
- [ ] Magic numbers/strings
- [ ] Complex conditionals

**Code Patterns to Flag**:
```typescript
// ❌ BAD: Magic numbers
if (user.age > 18) { }
setTimeout(() => {}, 3000);

// ❌ BAD: Deep nesting
if (condition1) {
  if (condition2) {
    if (condition3) {
      if (condition4) {
        // Too deep
      }
    }
  }
}

// ✅ GOOD: Named constants
const LEGAL_AGE = 18;
const DEBOUNCE_TIME = 3000;

if (user.age > LEGAL_AGE) { }
setTimeout(() => {}, DEBOUNCE_TIME);

// ✅ GOOD: Early returns to reduce nesting
if (!condition1) return;
if (!condition2) return;
if (!condition3) return;
// Flat code
```

**Quality Issues to Report**:
- Code smells
- Poor readability
- High complexity
- Maintainability issues

### Phase 6: Review Documentation

#### 6.1 Review Report Template

```markdown
# Code Review Report

## Summary
- **Reviewer**: [Name]
- **Date**: [Date]
- **Files Reviewed**: [List of files]
- **Overall Status**: ✅ Approved / ⚠️ Approved with Comments / ❌ Changes Required

## Critical Issues (Must Fix)
### Security Vulnerabilities
1. **[CRITICAL] XSS Vulnerability in UserProfileComponent**
   - **File**: `user-profile.component.ts:45`
   - **Issue**: Unsafe innerHTML binding without sanitization
   - **Risk**: High - Allows arbitrary script execution
   - **Fix**: Use DomSanitizer or text interpolation
   ```typescript
   // Current (UNSAFE)
   <div [innerHTML]="userBio"></div>
   
   // Recommended
   <div>{{ userBio }}</div>
   // OR
   <div [innerHTML]="sanitizedBio"></div>
   ```

2. **[CRITICAL] Hardcoded API Key**
   - **File**: `api.service.ts:12`
   - **Issue**: API key hardcoded in source code
   - **Risk**: High - Credential exposure
   - **Fix**: Move to environment configuration
   ```typescript
   // Current (UNSAFE)
   const API_KEY = 'sk-1234567890';
   
   // Recommended
   const API_KEY = environment.apiKey;
   ```

### Bugs
1. **[HIGH] Memory Leak in DashboardComponent**
   - **File**: `dashboard.component.ts:67`
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

## High Priority Issues (Should Fix)
### Performance
1. **[MEDIUM] Missing OnPush Change Detection**
   - **File**: `job-list.component.ts:8`
   - **Issue**: Using default change detection
   - **Impact**: Unnecessary re-renders
   - **Fix**: Add OnPush strategy

### Code Quality
1. **[MEDIUM] Type Safety Issue**
   - **File**: `user.service.ts:34`
   - **Issue**: Using `any` type
   - **Impact**: Loss of type safety
   - **Fix**: Define proper interface

## Low Priority Issues (Nice to Have)
### Code Style
1. **[LOW] Missing JSDoc Comments**
   - **File**: `helper.service.ts`
   - **Issue**: Public methods lack documentation
   - **Fix**: Add JSDoc comments

## Positive Observations
- ✅ Excellent test coverage (92%)
- ✅ Proper error handling in most places
- ✅ Good separation of concerns
- ✅ Consistent code style

## Recommendations
1. Run `npm audit` to check for vulnerable dependencies
2. Consider implementing rate limiting for API calls
3. Add integration tests for authentication flow
4. Update TypeScript to latest version

## Security Checklist
- [x] No XSS vulnerabilities
- [ ] No hardcoded secrets (1 found)
- [x] Proper authentication checks
- [x] CSRF protection enabled
- [x] Input validation present
- [ ] All dependencies up to date

## Next Steps
1. Fix all critical issues
2. Address high priority items
3. Re-submit for review
4. Schedule security audit

---
**Review Completed**: [Date]
```

#### 6.2 Comment Templates

**Security Issue Comment**:
```markdown
🔒 **SECURITY**: [Severity] - [Issue Type]

**Issue**: [Description]
**Risk**: [Impact]
**CWE**: [CWE-XXX if applicable]
**OWASP**: [OWASP category]

**Vulnerable Code**:
```typescript
[code snippet]
```

**Recommended Fix**:
```typescript
[fixed code]
```

**References**:
- [Link to documentation]
- [Link to best practices]
```

**Bug Comment**:
```markdown
🐛 **BUG**: [Severity] - [Bug Type]

**Issue**: [Description]
**Impact**: [What breaks]
**Reproduction**: [Steps to reproduce]

**Current Behavior**:
[What happens now]

**Expected Behavior**:
[What should happen]

**Suggested Fix**:
```typescript
[code fix]
```
```

**Performance Comment**:
```markdown
⚡ **PERFORMANCE**: [Impact Level]

**Issue**: [Description]
**Impact**: [Performance cost]
**Measurement**: [Metrics if available]

**Current Implementation**:
```typescript
[code snippet]
```

**Optimized Implementation**:
```typescript
[improved code]
```

**Expected Improvement**: [Estimated gain]
```

**Code Quality Comment**:
```markdown
📝 **CODE QUALITY**: [Priority]

**Issue**: [Description]
**Category**: [Code smell, Best practice, etc.]
**Impact**: [Maintainability, Readability, etc.]

**Suggestion**:
```typescript
[improved code]
```

**Benefits**:
- [Benefit 1]
- [Benefit 2]
```

## Integration with Project

### Reference Project Standards
- `@/.windsurf/rules/angular-core-standards.md`
- `@/.windsurf/rules/code-quality.md`
- `@/.windsurf/rules/testing-standards.md`
- `@/AGENTS.md`

### Use Existing Tools
```bash
# Run linter
npm run lint

# Run tests
npm test

# Check for vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Type check
npx tsc --noEmit
```

### Automated Checks
- ESLint for code quality
- npm audit for vulnerabilities
- TypeScript compiler for type safety
- Unit tests for functionality
- E2E tests for user flows

## Best Practices Summary

### Security
- ✅ Never trust user input
- ✅ Sanitize all output
- ✅ Use parameterized queries
- ✅ Implement proper authentication
- ✅ Follow principle of least privilege
- ✅ Keep dependencies updated
- ✅ Use HTTPS everywhere
- ✅ Implement CSRF protection

### Bug Prevention
- ✅ Handle null/undefined
- ✅ Validate all inputs
- ✅ Clean up subscriptions
- ✅ Handle errors properly
- ✅ Test edge cases
- ✅ Use TypeScript strictly

### Performance
- ✅ Use OnPush change detection
- ✅ Implement lazy loading
- ✅ Use trackBy functions
- ✅ Avoid function calls in templates
- ✅ Clean up resources
- ✅ Optimize bundle size

### Code Quality
- ✅ Follow SOLID principles
- ✅ Write self-documenting code
- ✅ Keep functions small
- ✅ Avoid code duplication
- ✅ Use meaningful names
- ✅ Write tests

## Checklist

### Pre-Review
- [ ] Understand code context
- [ ] Review related files
- [ ] Check test coverage
- [ ] Run automated checks

### Security Review
- [ ] OWASP Top 10 checked
- [ ] XSS vulnerabilities checked
- [ ] CSRF protection verified
- [ ] Authentication reviewed
- [ ] Authorization reviewed
- [ ] Input validation checked
- [ ] Output encoding verified
- [ ] Dependencies audited

### Bug Review
- [ ] Logic errors checked
- [ ] Null handling verified
- [ ] Error handling reviewed
- [ ] Edge cases considered
- [ ] Race conditions checked
- [ ] Memory leaks identified

### Performance Review
- [ ] Change detection optimized
- [ ] Subscriptions managed
- [ ] Lazy loading implemented
- [ ] Bundle size checked
- [ ] Memory usage reviewed

### Quality Review
- [ ] TypeScript best practices
- [ ] Angular patterns followed
- [ ] Code smells identified
- [ ] Documentation adequate
- [ ] Tests comprehensive

### Documentation
- [ ] Review report created
- [ ] Issues categorized
- [ ] Fixes recommended
- [ ] Examples provided
- [ ] References included

---

**This skill ensures comprehensive code review with focus on security, bugs, performance, and quality following OWASP guidelines and Angular best practices.**
