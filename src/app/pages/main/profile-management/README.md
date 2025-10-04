# Profile Management Module

## Overview
The Profile Management module provides a comprehensive interface for users to manage their profile information and documents. Built following SOLID principles and a mobile-first approach.

## Architecture

### Component Structure
```
profile-management/
├── profile-management.component.ts    # Parent container component
├── profile-management.component.html
├── profile-management.component.scss
├── profile-view/                      # Profile information child component
│   ├── profile-view.component.ts
│   ├── profile-view.component.html
│   └── profile-view.component.scss
└── documents-view/                    # Documents management child component
    ├── documents-view.component.ts
    ├── documents-view.component.html
    └── documents-view.component.scss
```

### Reusable Components (src/app/components/)
- **TabNavigationComponent**: Reusable tab navigation with accessibility support
- **ProfilePhotoUploadComponent**: Photo upload with validation and preview

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
- **ProfileManagementComponent**: Manages tab navigation and routing only
- **ProfileViewComponent**: Handles profile data display and editing only
- **DocumentsViewComponent**: Manages document operations only
- **ProfilePhotoUploadComponent**: Handles photo upload UI and validation only
- **TabNavigationComponent**: Manages tab display and selection only

### Open/Closed Principle (OCP)
- Tab system is extensible - new tabs can be added by:
  1. Adding to `PROFILE_TAB_CONFIGS` constant
  2. Creating new child component
  3. Adding conditional render in parent template
- No modification of existing code required

### Liskov Substitution Principle (LSP)
- All child components can be swapped or extended without breaking parent
- Components depend on interfaces, not concrete implementations

### Interface Segregation Principle (ISP)
- Separate interfaces for different concerns:
  - `UpdateProfilePayload` - profile updates
  - `DocumentItem` - document data
  - `UploadDocumentPayload` - document uploads
  - `ProfilePhotoUploadResult` - photo upload results

### Dependency Inversion Principle (DIP)
- Components depend on service abstractions (ProfileManagementService)
- Services depend on ApiService abstraction
- Configuration externalized to constants files

## Features

### Profile View
- ✅ Profile photo upload with validation
- ✅ First name and last name editing
- ✅ Email display (read-only)
- ✅ Form validation with error messages
- ✅ Save changes functionality
- ✅ Loading states
- ✅ Responsive mobile-first design

### Documents View
- ✅ Document list display
- ✅ Empty state with call-to-action
- ✅ Upload document functionality (placeholder)
- ✅ Download document functionality (placeholder)
- ✅ Delete document functionality (placeholder)
- ✅ File size and date formatting
- ✅ Responsive grid layout

## Configuration

### Constants (`profile.constants.ts`)
- **PROFILE_TABS**: Tab identifiers
- **PROFILE_TAB_CONFIGS**: Tab configuration array
- **PROFILE_FORM_LABELS**: All UI labels centralized
- **PROFILE_VALIDATION**: Validation rules (min/max lengths, patterns, file sizes)
- **PROFILE_ERROR_MESSAGES**: Error message templates
- **DOCUMENT_TYPES**: Supported document types
- **PROFILE_EMPTY_STATES**: Empty state configurations

### Validation Rules
- First name: 2-50 characters, required
- Last name: 2-50 characters, required
- Email: Valid email pattern, required (read-only)
- Profile photo: Max 5MB, JPEG/PNG/WebP only
- Documents: Max 10MB, PDF/DOC/DOCX/TXT

## Mobile-First Responsive Design

### Breakpoints
- **Mobile**: < 768px (default)
- **Desktop**: ≥ 768px

### Mobile Optimizations
- Full-width tabs
- Stacked form fields
- Touch-friendly button sizes
- Optimized spacing for small screens

### Desktop Enhancements
- Side-by-side form fields
- Larger padding and spacing
- Multi-column document grid
- Enhanced hover states

## State Management

### Form State
- Reactive forms with Angular FormBuilder
- Real-time validation
- Dirty state tracking for save button
- Form reset on successful save

### Loading States
- Profile data loading
- Photo upload loading
- Form submission loading
- Document operations loading

### Data Flow
1. User data loaded from SessionStorage (authToken)
2. API call to fetch current user profile
3. Form populated with user data
4. User edits form
5. Validation runs on each change
6. Submit triggers API call
7. Success/error handling

## API Integration

### Endpoints Used
- `GET api/auth/getactiveuser` - Fetch current user
- `PUT api/profilemanagement/update` - Update profile
- `POST api/profilemanagement/upload` - Upload profile photo
- `GET api/profilemanagement/uploads/documents` - Get documents
- `POST api/profilemanagement/uploads/documents` - Upload document
- `DELETE api/profilemanagement/uploads/documents/:id` - Delete document

### Service Methods
```typescript
profileService.update(payload)
profileService.uploadProfilePhoto(file)
profileService.getDocuments()
profileService.uploadDocument(payload)
profileService.deleteDocument(payload)
```

## Accessibility

### ARIA Support
- Tab navigation with proper ARIA roles
- `role="tablist"` on tab container
- `role="tab"` on tab buttons
- `role="tabpanel"` on content panels
- `aria-selected` state management
- `aria-controls` linking tabs to panels

### Keyboard Navigation
- Tab key navigation
- Enter/Space to activate tabs
- Focus indicators on all interactive elements

### Screen Reader Support
- Descriptive labels for all form fields
- Error messages announced
- Loading states communicated

## Testing Recommendations

### Unit Tests
- Form validation logic
- Tab switching behavior
- Photo upload validation
- Error message display
- API service integration

### Integration Tests
- Complete profile update flow
- Photo upload flow
- Document management flow
- Tab navigation flow

### E2E Tests
- User can update profile
- User can upload photo
- User can manage documents
- Mobile responsive behavior

## Future Enhancements

### Planned Features
- [ ] Actual photo upload to backend
- [ ] Document upload dialog with drag-and-drop
- [ ] Document preview functionality
- [ ] Profile completion percentage
- [ ] Avatar customization options
- [ ] Bulk document operations
- [ ] Document search and filtering
- [ ] Document categories/tags

### Performance Optimizations
- [ ] Lazy load document thumbnails
- [ ] Image compression before upload
- [ ] Pagination for large document lists
- [ ] Caching of profile data

### UX Improvements
- [ ] Success/error toast notifications
- [ ] Unsaved changes warning
- [ ] Inline editing for quick updates
- [ ] Profile preview mode
- [ ] Dark mode support

## Usage Example

```typescript
// In your routing configuration
{
  path: 'profile-management',
  component: ProfileManagementComponent,
  canActivate: [AuthGuardService]
}
```

## Dependencies
- Angular 18.2.0
- Angular Forms (ReactiveFormsModule)
- RxJS 7.8.0
- SessionStorageUtil (custom)
- ProfileManagementService
- AuthenticationService

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
