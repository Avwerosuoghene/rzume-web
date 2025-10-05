import { AbstractControl, FormGroup } from '@angular/forms';

export class FormValidationUtil {

  static getFieldError(
    formGroup: FormGroup,
    fieldName: string,
    customMessages?: { [key: string]: string }
  ): string {
    const control = formGroup.get(fieldName);
    
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    const errors = control.errors;
    const fieldLabel = this.formatFieldLabel(fieldName);

    if (customMessages) {
      for (const errorKey in errors) {
        const customKey = `${fieldName}_${errorKey}`;
        if (customMessages[customKey]) {
          return customMessages[customKey];
        }
      }
    }

    // Required error
    if (errors['required']) {
      return this.getRequiredErrorMessage(fieldName, fieldLabel);
    }

    // Email error
    if (errors['email']) {
      return 'Please enter a valid email address';
    }

    // Min length error
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `${fieldLabel} must be at least ${requiredLength} characters`;
    }

    // Max length error
    if (errors['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;
      return `${fieldLabel} must not exceed ${requiredLength} characters`;
    }

    // Min error (for numbers)
    if (errors['min']) {
      const min = errors['min'].min;
      return `${fieldLabel} must be at least ${min}`;
    }

    // Max error (for numbers)
    if (errors['max']) {
      const max = errors['max'].max;
      return `${fieldLabel} must not exceed ${max}`;
    }

    // Pattern error
    if (errors['pattern']) {
      return this.getPatternErrorMessage(fieldName, fieldLabel);
    }

    // Password mismatch error
    if (errors['passwordMismatch']) {
      return 'Passwords do not match';
    }

    // Custom validator errors
    if (errors['invalidFormat']) {
      return `${fieldLabel} format is invalid`;
    }

    return '';
  }


  private static getRequiredErrorMessage(fieldName: string, fieldLabel: string): string {
    const specialCases: { [key: string]: string } = {
      'confirmPassword': 'Please re-enter your password',
      'termsChecked': 'You must accept the terms and conditions',
      'rememberMe': 'Please check this field'
    };

    return specialCases[fieldName] || `${fieldLabel} is required`;
  }

  /**
   * Gets the pattern error message for specific fields
   */
  private static getPatternErrorMessage(fieldName: string, fieldLabel: string): string {
    const patternMessages: { [key: string]: string } = {
      'email': 'Please enter a valid email address',
      'phone': 'Please enter a valid phone number',
      'userName': 'Username can only contain letters, numbers, and underscores',
      'url': 'Please enter a valid URL'
    };

    return patternMessages[fieldName] || `${fieldLabel} format is invalid`;
  }


  private static formatFieldLabel(fieldName: string): string {
    const words = fieldName.replace(/([A-Z])/g, ' $1').trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  static markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Checks if a specific field has an error
   */
  static hasFieldError(formGroup: FormGroup, fieldName: string): boolean {
    const control = formGroup.get(fieldName);
    return !!(control && control.touched && control.errors);
  }

  /**
   * Gets all error messages for a form
   */
  static getAllFormErrors(formGroup: FormGroup): { [key: string]: string } {
    const errors: { [key: string]: string } = {};
    
    Object.keys(formGroup.controls).forEach(key => {
      const error = this.getFieldError(formGroup, key);
      if (error) {
        errors[key] = error;
      }
    });

    return errors;
  }
}
