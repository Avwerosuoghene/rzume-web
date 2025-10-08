# FormInputComponent

A reusable, configurable form input component that supports multiple input types with consistent styling and validation across the application.

## Features

- ✅ **Multiple Input Types**: text, email, password, url, tel, number, date, textarea, select
- ✅ **Floating Label Animation**: Automatic label animation using `appFloatingLabel` directive
- ✅ **Form Control Integration**: Implements `ControlValueAccessor` for seamless reactive forms integration
- ✅ **Validation Support**: Built-in error handling with customizable error messages
- ✅ **Material Datepicker**: Integrated Material datepicker for date inputs
- ✅ **Global Styling**: Inherits from global `.form-field` and `.form-input` styles
- ✅ **Accessibility**: Proper label associations and ARIA support
- ✅ **Type-Safe Configuration**: Strongly typed configuration interfaces

---

## Installation

The component is already available in the components barrel export:

```typescript
import { FormInputComponent } from '@app/components';
```

---

## Usage

### Basic Text Input

```typescript
import { FormInputComponent } from '@app/components';
import { FormInputType } from '@app/core/models';

@Component({
  template: `
    <app-form-input 
      [config]="emailConfig" 
      [control]="form.get('email')">
    </app-form-input>
  `
})
export class MyComponent {
  emailConfig: FormInputConfig = {
    id: 'email',
    label: 'Email Address',
    type: FormInputType.EMAIL,
    placeholder: 'Enter your email',
    required: true
  };
}
```

### Select Dropdown

```typescript
selectConfig: FormInputSelectConfig = {
  id: 'status',
  label: 'Application Status',
  type: FormInputType.SELECT,
  required: true,
  options: [
    { value: 'applied', label: 'Applied' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer' }
  ]
};
```

### Date Picker

```typescript
dateConfig: FormInputDateConfig = {
  id: 'applicationDate',
  label: 'Date Applied',
  type: FormInputType.DATE,
  placeholder: 'Select date',
  max: new Date()
};
```

### Textarea

```typescript
notesConfig: FormInputConfig = {
  id: 'notes',
  label: 'Notes',
  type: FormInputType.TEXTAREA,
  placeholder: 'Add notes',
  rows: 5,
  maxLength: 500
};
```

---

## Configuration

### FormInputConfig Interface

```typescript
interface FormInputConfig {
  id: string;                    // Required: Unique identifier
  label: string;                 // Required: Field label
  type: FormInputType;           // Required: Input type
  placeholder?: string;          // Optional: Placeholder text
  required?: boolean;            // Optional: Required validation
  disabled?: boolean;            // Optional: Disable input
  readonly?: boolean;            // Optional: Read-only mode
  size?: FormInputSize;          // Optional: Input size
  rows?: number;                 // Optional: Textarea rows (default: 3)
  maxLength?: number;            // Optional: Max character length
  minLength?: number;            // Optional: Min character length
  pattern?: string;              // Optional: Regex pattern
  errorMessages?: Record<string, string>; // Optional: Custom error messages
}
```

### FormInputType Enum

```typescript
enum FormInputType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  URL = 'url',
  TEL = 'tel',
  NUMBER = 'number',
  DATE = 'date',
  TEXTAREA = 'textarea',
  SELECT = 'select'
}
```

### SelectOption Interface

```typescript
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
```

---

## Custom Error Messages

```typescript
config: FormInputConfig = {
  id: 'password',
  label: 'Password',
  type: FormInputType.PASSWORD,
  required: true,
  minLength: 8,
  errorMessages: {
    required: 'Password is required',
    minlength: 'Password must be at least 8 characters'
  }
};
```

---

## Default Error Messages

The component provides default error messages for common validation errors:

- `required`: "This field is required"
- `email`: "Please enter a valid email address"
- `minlength`: "Input is too short"
- `maxlength`: "Input is too long"
- `pattern`: "Invalid format"
- `min`: "Value is too low"
- `max`: "Value is too high"

---

## Reactive Forms Integration

```typescript
import { FormBuilder, Validators } from '@angular/forms';

export class MyComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    status: ['', Validators.required]
  });

  emailConfig: FormInputConfig = {
    id: 'email',
    label: 'Email',
    type: FormInputType.EMAIL,
    required: true
  };

  constructor(private fb: FormBuilder) {}
}
```

```html
<form [formGroup]="form">
  <app-form-input 
    [config]="emailConfig" 
    [control]="form.get('email')">
  </app-form-input>
</form>
```

---

## Styling

The component inherits global styles from:
- `.form-field` - Field wrapper styles
- `.form-input` - Input element styles
- `.form-select` - Select dropdown styles
- `.error-message` - Error message styles

Component-specific styles can be added to `form-input.component.scss`.

---

## Architecture

### File Structure

```
src/app/
├── components/
│   └── form-input/
│       ├── form-input.component.ts
│       ├── form-input.component.html
│       ├── form-input.component.scss
│       └── README.md
├── core/
│   ├── models/
│   │   ├── enums/
│   │   │   └── form-input.enums.ts
│   │   ├── interface/
│   │   │   └── form-input.interface.ts
│   │   └── constants/
│   │       └── form-input.constants.ts
│   └── directives/
│       └── floating-label.directive.ts
└── styles.scss (global form styles)
```

### Dependencies

- **Angular Forms**: `ControlValueAccessor` implementation
- **Angular Material**: Datepicker component
- **FloatingLabelDirective**: Custom directive for label animation
- **Global Styles**: `.form-field`, `.form-input` classes

---

## Examples

### Complete Form Example

```typescript
@Component({
  selector: 'app-job-form',
  template: `
    <form [formGroup]="jobForm" (ngSubmit)="onSubmit()">
      <div class="form-input-container">
        <app-form-input 
          [config]="companyConfig" 
          [control]="jobForm.get('company')">
        </app-form-input>

        <app-form-input 
          [config]="roleConfig" 
          [control]="jobForm.get('role')">
        </app-form-input>

        <app-form-input 
          [config]="statusConfig" 
          [control]="jobForm.get('status')">
        </app-form-input>

        <app-form-input 
          [config]="dateConfig" 
          [control]="jobForm.get('applicationDate')">
        </app-form-input>

        <button type="submit" [disabled]="jobForm.invalid">
          Submit
        </button>
      </div>
    </form>
  `
})
export class JobFormComponent {
  jobForm = this.fb.group({
    company: ['', Validators.required],
    role: ['', Validators.required],
    status: ['', Validators.required],
    applicationDate: [new Date(), Validators.required]
  });

  companyConfig: FormInputConfig = {
    id: 'company',
    label: 'Company',
    type: FormInputType.TEXT,
    placeholder: 'Enter company name',
    required: true
  };

  roleConfig: FormInputConfig = {
    id: 'role',
    label: 'Job Role',
    type: FormInputType.TEXT,
    placeholder: 'Enter job role',
    required: true
  };

  statusConfig: FormInputSelectConfig = {
    id: 'status',
    label: 'Application Status',
    type: FormInputType.SELECT,
    required: true,
    options: [
      { value: 'applied', label: 'Applied' },
      { value: 'interview', label: 'Interview' },
      { value: 'offer', label: 'Offer' }
    ]
  };

  dateConfig: FormInputDateConfig = {
    id: 'applicationDate',
    label: 'Date Applied',
    type: FormInputType.DATE,
    max: new Date()
  };

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.jobForm.valid) {
      console.log(this.jobForm.value);
    }
  }
}
```

---

## Benefits

1. **Consistency**: All form inputs have the same look and behavior
2. **Reusability**: Single component for all input types
3. **Maintainability**: Centralized input logic and styling
4. **Type Safety**: Strongly typed configuration prevents errors
5. **Validation**: Built-in error handling with customization
6. **Accessibility**: Proper labels and ARIA attributes
7. **Performance**: Optimized with OnPush change detection (future enhancement)

---

## Future Enhancements

- [ ] Add input masking support (phone numbers, currency)
- [ ] Add autocomplete/typeahead functionality
- [ ] Add file upload input type
- [ ] Add multi-select support
- [ ] Add custom validation functions
- [ ] Add loading state for async validation
- [ ] Add OnPush change detection strategy
- [ ] Add unit tests

---

## Migration Guide

### Before (Manual Input)

```html
<div class="form-field">
  <label for="email">Email</label>
  <div class="input-wrapper">
    <input
      id="email"
      type="email"
      class="form-input"
      formControlName="email"
      appFloatingLabel
    />
  </div>
  <span *ngIf="form.get('email')?.errors" class="error-message">
    Email is required
  </span>
</div>
```

### After (FormInputComponent)

```html
<app-form-input 
  [config]="emailConfig" 
  [control]="form.get('email')">
</app-form-input>
```

```typescript
emailConfig: FormInputConfig = {
  id: 'email',
  label: 'Email',
  type: FormInputType.EMAIL,
  required: true
};
```

---

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
