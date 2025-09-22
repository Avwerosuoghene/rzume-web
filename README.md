
# Rzume - Job Application Tracking System

**Rzume** is a modern web application built with Angular 18 for tracking and managing job applications. It features a clean, responsive UI using Angular Material, secure user authentication with Google OAuth, and a fully automated deployment pipeline to Google Cloud Run.

---

## Project Overview

This application provides a centralized platform for job seekers to organize their application process. Users can sign up, log in, and manage a list of job applications, tracking details such as the company name, position, and application status.

### Key Features:
- **User Authentication**: Secure sign-up and sign-in with email/password and Google OAuth.
- **Dashboard**: A central hub to view, add, and manage all job applications.
- **State Management**: Reactive state management for a seamless user experience.
- **Automated Deployments**: CI/CD pipeline for automated testing and deployment.

## Tech Stack & Requirements

- **Framework**: Angular 18.2.0
- **UI Library**: Angular Material 18.2.0
- **Language**: TypeScript 5.5.4
- **State Management**: RxJS 7.8.0
- **Authentication**: Google OAuth (`@abacritt/angularx-social-login`) & JWT (`@auth0/angular-jwt`)
- **Testing**: Karma, Jasmine, and Cypress
- **Node.js**: v20.x
- **Package Manager**: npm

## Project Structure

```
rzume_web/
├── .github/workflows/      # CI/CD pipeline for Google Cloud Run
├── src/app/
│   ├── components/         # Reusable UI components (tables, dialogs)
│   ├── core/               # Core logic: services, guards, interceptors, models
│   ├── pages/              # Main application pages (auth, dashboard)
│   └── environments/       # Environment-specific configuration
├── scripts/                # Utility scripts (e.g., config creation)
├── Dockerfile              # Multi-stage Dockerfile for building and serving the app
├── angular.json            # Angular project configuration
└── package.json            # Project dependencies and scripts
```

- **`src/app/core/services`**: Contains the business logic, including API communication, authentication, and state management.
- **`src/app/pages`**: Holds the main views of the application, such as the login page and the main dashboard.
- **`Dockerfile`**: Defines the containerization process for production deployment.
- **`.github/workflows/deploy.yml`**: Automates testing and deployment to Google Cloud Run.

## Setup & Installation Instructions

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd rzume_web
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure your environment:**
    Create a development environment file by copying the example:
    ```bash
    cp src/environments/environment.ts src/environments/environment.development.ts
    ```
    Then, update `src/environments/environment.development.ts` with your backend API URL and Google Client ID.

4.  **Run the application locally:**
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:4200`.

## Available Scripts

-   **`npm start`**: Starts the development server.
-   **`npm run build`**: Builds the application for production.
-   **`npm test`**: Runs unit tests using Karma and Jasmine.
-   **`npm run test:ci`**: Runs unit tests in a headless browser for CI environments.
-   **`npm run cy:open`**: Opens the Cypress E2E test runner.

## Deployment Guide

This project is configured for automated deployment to **Google Cloud Run** via GitHub Actions.

### Automated Deployment

The CI/CD pipeline, defined in `.github/workflows/deploy.yml`, handles the entire process:
1.  **Trigger**: The workflow runs automatically on every push to the `main` or `master` branch.
2.  **Test**: It installs dependencies and runs the unit test suite.
3.  **Build**: It builds a Docker image of the application using the provided `Dockerfile`.
4.  **Push**: The image is pushed to Google Artifact Registry.
5.  **Deploy**: The new image is deployed to Google Cloud Run.

### Manual Deployment

To deploy manually, you can build and run the Docker container:

1.  **Build the Docker image:**
    ```bash
    docker build -t rzume-web . \
      --build-arg API_URL=<your_api_url> \
      --build-arg GOOGLE_CLIENT_ID=<your_google_client_id>
    ```

2.  **Run the container:**
    ```bash
    docker run -p 8080:8080 rzume-web
    ```

## Features / Modules

-   **Authentication**: A complete authentication module that includes sign-up, sign-in, password reset, and Google OAuth integration.
-   **Dashboard**: The main view for authenticated users, displaying a list of job applications with functionalities for adding, editing, and deleting entries.
-   **Profile Management**: A dedicated section for users to manage their profile information.
-   **Shared Components**: A collection of reusable UI components, including a customizable table, dialogs, and search inputs to ensure a consistent user experience.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the MIT License.
- **Web Server**: Nginx Alpine
- **Development Server**: Angular Dev Server (port 4200)
- **Production Port**: 3000 (Nginx)

### Backend Integration
- **API Base URL**: https://localhost:7103
- **Authentication**: JWT Bearer tokens
- **HTTP Client**: Angular HttpClient with interceptors

## Component Map

### Core Services (`src/app/core/services/`)
- **`api.service.ts`**: Centralized HTTP client with error handling, JWT integration
- **`authentication.service.ts`**: User authentication and session management
- **`google-auth.service.ts`**: Google OAuth integration and token handling
- **`job-application.service.ts`**: Job application CRUD operations
- **`profile-management.service.ts`**: User profile management
- **`storage.service.ts`**: Browser storage utilities (localStorage/sessionStorage)
- **`dialog.service.ts`**: Material Dialog management
- **`loader.service.ts`**: Global loading state management

### UI Components (`src/app/components/`)
- **`google-sign-in/`**: Google OAuth sign-in button component
- **`custom-table/`**: Reusable data table with Material Design
- **`job-add-dialog/`**: Modal for adding/editing job applications
- **`job-status-change/`**: Job application status update component
- **`filter-dropdown/`**: Advanced filtering controls
- **`custom-search-input/`**: Search functionality component
- **`password-strength-checker/`**: Password validation UI
- **`circular-loader/`**: Loading spinner components

### Page Modules (`src/app/pages/`)
- **`authentication/`**: Login, signup, password reset flows
- **`main/`**: Dashboard and job application management
- **`empty/`**: 404 and error pages

### Core Models (`src/app/core/models/`)
- **`interface/`**: TypeScript interfaces for API contracts
- **`enums/`**: Application enumerations and constants
- **`constants/`**: Route definitions and configuration
- **`types/`**: Custom type definitions

### Guards (`src/app/core/guards/`)
- **`auth.guard.service.ts`**: Route protection for authenticated users

## Data Flow & Sequence

### User Authentication Flow
1. **Google Sign-In**: User clicks Google sign-in button
2. **OAuth Redirect**: Google OAuth popup/redirect flow
3. **Token Exchange**: Frontend receives Google token, sends to backend API
4. **JWT Generation**: Backend validates Google token, returns JWT
5. **Session Storage**: JWT stored in browser sessionStorage
6. **Route Protection**: AuthGuard validates JWT for protected routes

### Job Application Management Flow
1. **Dashboard Load**: Authenticated user accesses main dashboard
2. **Data Fetch**: API call to retrieve user's job applications
3. **Table Display**: Applications rendered in custom Material table
4. **CRUD Operations**: Create, update, delete applications via API
5. **Real-time Updates**: UI updates reflect API responses immediately

### API Request/Response Examples

**Authentication Request:**
```typescript
POST /api/auth/google-signin
{
  "userToken": "google_oauth_token_here"
}
```

**Authentication Response:**
```typescript
{
  "user": {
    "email": "user@example.com",
    "userName": "John Doe",
    "onBoardingStage": 1,
    "emailConfirmed": true
  },
  "token": "jwt_token_here",
  "message": "Login successful"
}
```

**Job Application Creation:**
```typescript
POST /api/job-applications
Authorization: Bearer <jwt_token>
{
  "position": "Software Engineer",
  "companyName": "Tech Corp",
  "jobLink": "https://example.com/job",
  "status": "Applied"
}
```

## Setup Instructions

### Prerequisites
- **Node.js**: 22.3.0 or higher
- **npm**: 10.0.0 or higher
- **Angular CLI**: 18.2.0
- **Docker**: Latest (for containerized deployment)

### Local Development Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd rzume_web
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp src/environments/environment.example.ts src/environments/environment.development.ts
# Edit environment.development.ts with your configuration
```

4. **Start Development Server**
```bash
npm start
# Application available at http://localhost:4200
```

5. **Run Tests**
```bash
# Unit tests
npm test

# E2E tests with Cypress
npm run cy:open

# E2E tests with Playwright
npx playwright test
```

### Docker Deployment

**Build and Run Container:**
```bash
# Build image
docker build -t rzume-web .

# Run container
docker run -p 3000:80 rzume-web
```

**Docker Compose Example:**
```yaml
version: '3.8'
services:
  rzume-web:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - api-backend
  
  api-backend:
    image: <backend-api-image>
    ports:
      - "7103:7103"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
```

### Production Deployment

**Kubernetes Deployment Example:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rzume-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rzume-web
  template:
    metadata:
      labels:
        app: rzume-web
    spec:
      containers:
      - name: rzume-web
        image: <registry>/rzume-web:latest
        ports:
        - containerPort: 80
        env:
        - name: API_BASE_URL
          value: "https://api.rzume.com"
---
apiVersion: v1
kind: Service
metadata:
  name: rzume-web-service
spec:
  selector:
    app: rzume-web
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## Configuration & Environment

### Environment Variables Template (`.env.example`)

```typescript
export const environment = {
  production: false,
  // Backend API base URL
  apiBaseUrl: 'https://localhost:7103',
  
  // Google OAuth Client ID
  googleClientId: 'your-google-client-id.apps.googleusercontent.com',
  
  // Optional: Additional configuration
  enableAnalytics: false,
  logLevel: 'debug'
};
```

### Required Configuration Keys
- **`apiBaseUrl`**: Backend API endpoint URL
- **`googleClientId`**: Google OAuth 2.0 client identifier
- **`production`**: Environment flag for build optimization

## Running Tests

### Unit Tests
```bash
# Run once
npm test

# Watch mode
ng test --watch

# Coverage report
ng test --code-coverage
```

### Integration Tests
```bash
# Cypress interactive mode
npm run cy:open

# Cypress headless
npx cypress run

# Playwright tests
npx playwright test

# Playwright UI mode
npx playwright test --ui
```

### Test Structure
- **Unit Tests**: `src/**/*.spec.ts`
- **E2E Tests**: `cypress/e2e/**/*.cy.ts`
- **Playwright Tests**: `tests/**/*.spec.ts`

## CI/CD

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22.3.0'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: ng lint
    
    - name: Unit tests
      run: npm test -- --watch=false --browsers=ChromeHeadless
    
    - name: Build
      run: npm run build
    
    - name: E2E tests
      run: npx playwright test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v4
    
    - name: Build Docker image
      run: docker build -t rzume-web:${{ github.sha }} .
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push rzume-web:${{ github.sha }}
    
    - name: Deploy to production
      run: |
        # Add deployment commands here
        echo "Deploying to production..."
```

## Monitoring & Observability

### Recommended Metrics
- **Performance**: Core Web Vitals, bundle size, load times
- **User Engagement**: Page views, session duration, conversion rates
- **Errors**: JavaScript errors, failed API calls, authentication failures
- **Infrastructure**: Container health, memory usage, response times

### Logging Strategy
- **Frontend**: Console logging with log levels (error, warn, info, debug)
- **API Calls**: Request/response logging with correlation IDs
- **Authentication**: Login attempts, token refresh events
- **User Actions**: Job application CRUD operations

### Alerting Hooks
- **Error Rate**: >5% API error rate triggers alert
- **Performance**: Page load time >3s triggers investigation
- **Authentication**: Failed login rate >10% triggers security review

## Contribution Guide

### Repository Structure
```
rzume_web/
├── src/app/
│   ├── components/          # Reusable UI components
│   ├── core/               # Services, models, guards
│   ├── pages/              # Feature modules
│   └── styles/             # Global styles
├── cypress/                # E2E tests
├── tests/                  # Playwright tests
├── public/                 # Static assets
└── docker/                 # Docker configuration
```

### Branch Strategy
- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: Individual feature development
- **`hotfix/*`**: Critical production fixes

### Development Workflow
1. **Fork & Clone**: Create personal fork and clone locally
2. **Feature Branch**: Create branch from `develop`
3. **Development**: Implement feature with tests
4. **Testing**: Run full test suite locally
5. **Pull Request**: Submit PR to `develop` branch
6. **Code Review**: Address review feedback
7. **Merge**: Squash and merge after approval

### Code Standards
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Angular recommended rules
- **Formatting**: Prettier with 2-space indentation
- **Testing**: Minimum 80% code coverage
- **Commits**: Conventional commit format

### Commit Message Convention
```
type(scope): description

feat(auth): add Google OAuth integration
fix(api): resolve token refresh issue
docs(readme): update setup instructions
test(auth): add unit tests for login service
```

## Usage Examples

### Authentication Flow
```bash
# Navigate to application
curl -X GET http://localhost:4200

# Google sign-in (handled by frontend)
# User clicks Google sign-in button
# Redirected to Google OAuth
# Returns with JWT token
```

### API Usage Examples
```bash
# Get user profile
curl -X GET https://localhost:7103/api/user/profile \
  -H "Authorization: Bearer <jwt_token>"

# Create job application
curl -X POST https://localhost:7103/api/job-applications \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Frontend Developer",
    "companyName": "Tech Startup",
    "status": "Applied"
  }'

# Update application status
curl -X PUT https://localhost:7103/api/job-applications/123 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "Interview"}'
```

### Frontend Component Usage
```typescript
// Using the job application service
import { JobApplicationService } from './core/services';

constructor(private jobService: JobApplicationService) {}

createApplication() {
  const payload = {
    position: 'Software Engineer',
    companyName: 'Example Corp',
    status: ApplicationStatus.Applied
  };
  
  this.jobService.createApplication(payload).subscribe({
    next: (response) => console.log('Application created', response),
    error: (error) => console.error('Creation failed', error)
  });
}
```

## Troubleshooting & FAQs

### Common Setup Issues

**Q: `npm install` fails with permission errors**
A: Use `npm ci` instead, or configure npm to use a different directory:
```bash
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

**Q: Angular CLI not found after installation**
A: Install globally or use npx:
```bash
npm install -g @angular/cli
# or
npx ng serve
```

**Q: Google OAuth not working in development**
A: Ensure your Google Client ID is configured for localhost:4200:
1. Go to Google Cloud Console
2. Add `http://localhost:4200` to authorized origins
3. Update environment.development.ts with correct client ID

**Q: API calls failing with CORS errors**
A: Configure your backend to allow requests from localhost:4200:
```typescript
// Backend CORS configuration example
app.use(cors({
  origin: ['http://localhost:4200', 'https://yourdomain.com'],
  credentials: true
}));
```

**Q: Docker build fails**
A: Check Node.js version compatibility:
```dockerfile
# Use specific Node version
FROM node:22.3.0-alpine AS build
```

### Performance Issues

**Q: Large bundle size**
A: Analyze and optimize:
```bash
npm run analyze-bundle
# Review the generated report
# Consider lazy loading modules
```

**Q: Slow initial load**
A: Enable lazy loading for feature modules:
```typescript
const routes: Routes = [
  {
    path: 'feature',
    loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule)
  }
];
```

### Authentication Issues

**Q: JWT token expires frequently**
A: Implement token refresh mechanism:
```typescript
// Add token refresh logic in authentication service
refreshToken(): Observable<string> {
  return this.http.post<{token: string}>('/api/auth/refresh', {})
    .pipe(map(response => response.token));
}
```

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Maintainers

- **Primary Maintainer**: [Your Name] (your.email@example.com)
- **Technical Lead**: [Tech Lead Name] (tech.lead@example.com)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes and version history.

### Adding Release Notes
1. Update CHANGELOG.md with new features, fixes, and breaking changes
2. Follow semantic versioning (MAJOR.MINOR.PATCH)
3. Tag releases in Git with version numbers
4. Generate release notes from commit history

## Architecture Verification Checklist

Use this checklist to verify the architecture is correctly implemented:

### Frontend Architecture
- [ ] Angular 18 application builds successfully (`npm run build`)
- [ ] All components follow Angular style guide conventions
- [ ] Services are properly injected and singleton where appropriate
- [ ] Guards protect authenticated routes (`/main/*`)
- [ ] Environment configuration works for dev/prod builds

### Authentication & Security
- [ ] Google OAuth integration works in browser
- [ ] JWT tokens are stored securely in sessionStorage
- [ ] API calls include Authorization header with Bearer token
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Token refresh mechanism handles expired tokens

### API Integration
- [ ] HTTP client service handles all CRUD operations
- [ ] Error handling displays user-friendly messages
- [ ] API base URL configurable via environment
- [ ] Request/response interfaces match backend contracts
- [ ] Loading states managed consistently across components

### Testing & Quality
- [ ] Unit tests pass (`npm test`)
- [ ] E2E tests cover critical user flows
- [ ] Code coverage meets minimum threshold (80%)
- [ ] Linting passes without errors (`ng lint`)
- [ ] Build optimization works for production

### Deployment & DevOps
- [ ] Docker container builds and runs successfully
- [ ] Nginx serves static files correctly
- [ ] Environment variables injected properly
- [ ] Health checks respond correctly
- [ ] CI/CD pipeline executes without errors

### Performance & UX
- [ ] Initial bundle size under 1MB
- [ ] Lazy loading implemented for feature modules
- [ ] Material Design components render correctly
- [ ] Responsive design works on mobile devices
- [ ] Loading indicators provide user feedback
