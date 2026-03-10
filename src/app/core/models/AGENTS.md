# Models and Types Guidelines

When working with models, interfaces, and types in this directory:

## File Organization

### Constants (`constants/`)
- Define application-wide constants
- Use UPPER_SNAKE_CASE for constant names
- Group related constants together
- Export through barrel files

### Enums (`enums/`)
- Use PascalCase for enum names
- Use descriptive enum values
- Prefer string enums over numeric enums
- Document enum purpose

### Interfaces (`interface/`)
- Use PascalCase for interface names
- Define clear, typed interfaces
- Avoid `any` type
- Use optional properties with `?` when appropriate

## Naming Conventions

### Interfaces
```typescript
// Data Transfer Objects
export interface CreateUserDto { }
export interface UpdateUserDto { }
export interface UserResponseDto { }

// Domain Models
export interface User { }
export interface JobApplication { }
export interface Profile { }

// Configuration Objects
export interface AppConfig { }
export interface ApiUrls { }
```

### Enums
```typescript
export enum ApplicationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected'
}

export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest'
}
```

### Constants
```typescript
export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  JOBS: '/job-applications'
} as const;

export const PAGINATION_DEFAULTS = {
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
  totalPages: 0
} as const;
```

## Type Safety

### Strict Typing
- Always provide explicit types
- Use union types for multiple possibilities
- Use intersection types for combining types
- Leverage TypeScript utility types

### Type Definitions
```typescript
// Union types
type Status = 'pending' | 'approved' | 'rejected';

// Intersection types
type UserWithProfile = User & Profile;

// Utility types
type PartialUser = Partial<User>;
type ReadonlyUser = Readonly<User>;
type UserKeys = keyof User;
```

## Interface Design

### Best Practices
- Keep interfaces focused and cohesive
- Use composition over inheritance
- Define optional properties explicitly
- Document complex interfaces

### Example
```typescript
/**
 * Represents a job application in the system
 */
export interface JobApplication {
  id: string;
  userId: string;
  companyName: string;
  position: string;
  status: ApplicationStatus;
  appliedDate: Date;
  notes?: string;
  resumeId?: string;
}

/**
 * Filter criteria for job applications
 */
export interface JobApplicationFilter {
  searchQuery?: string;
  status?: ApplicationStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedItem<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
```

## Constants Organization

### Route Constants
```typescript
export enum RootRoutes {
  auth = 'auth',
  main = 'main'
}

export enum AuthRoutes {
  login = 'login',
  register = 'register',
  resetPassword = 'reset-password'
}
```

### Configuration Constants
```typescript
export const APP_CONFIG = {
  apiTimeout: 30000,
  retryAttempts: 3,
  cacheExpiration: 300000
} as const;
```

## Barrel Exports
- Export all public interfaces through `index.ts`
- Group related exports together
- Use named exports (not default exports)
- Keep exports organized and maintainable
