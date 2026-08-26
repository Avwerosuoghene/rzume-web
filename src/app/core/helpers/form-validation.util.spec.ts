import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormValidationUtil } from './form-validation.util';

describe('FormValidationUtil', () => {
  describe('noSpacesValidator', () => {
    it('should return null when the value has no spaces', () => {
      const control = new FormControl('nospaces');
      expect(FormValidationUtil.noSpacesValidator(control)).toBeNull();
    });

    it('should return a noSpaces error when the value contains a space', () => {
      const control = new FormControl('has spaces');
      expect(FormValidationUtil.noSpacesValidator(control)).toEqual({ noSpaces: true });
    });

    it('should return null for an empty value', () => {
      const control = new FormControl('');
      expect(FormValidationUtil.noSpacesValidator(control)).toBeNull();
    });
  });

  describe('getFieldError', () => {
    function buildForm(): FormGroup {
      return new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        username: new FormControl('', [Validators.minLength(3), Validators.maxLength(10)]),
        age: new FormControl(0, [Validators.min(18), Validators.max(65)]),
        confirmPassword: new FormControl('', Validators.required),
        termsChecked: new FormControl(false, Validators.requiredTrue),
      });
    }

    it('should return an empty string when the field does not exist', () => {
      expect(FormValidationUtil.getFieldError(buildForm(), 'missingField')).toBe('');
    });

    it('should return an empty string when the field is untouched', () => {
      const form = buildForm();
      expect(FormValidationUtil.getFieldError(form, 'email')).toBe('');
    });

    it('should return an empty string when the field has no errors', () => {
      const form = buildForm();
      form.get('email')?.setValue('valid@example.com');
      form.get('email')?.markAsTouched();
      expect(FormValidationUtil.getFieldError(form, 'email')).toBe('');
    });

    it('should return the special-case required message for confirmPassword', () => {
      const form = buildForm();
      form.get('confirmPassword')?.markAsTouched();
      expect(FormValidationUtil.getFieldError(form, 'confirmPassword')).toBe('Please re-enter your password');
    });

    it('should return the generic required message for a field with no special case', () => {
      const form = buildForm();
      form.get('email')?.markAsTouched();
      expect(FormValidationUtil.getFieldError(form, 'email')).toBe('Email is required');
    });

    it('should return the email format message when the email pattern is invalid', () => {
      const form = buildForm();
      form.get('email')?.setValue('not-an-email');
      form.get('email')?.markAsTouched();
      expect(FormValidationUtil.getFieldError(form, 'email')).toBe('Please enter a valid email address');
    });

    it('should return the minlength message with the required length', () => {
      const form = buildForm();
      form.get('username')?.setValue('ab');
      form.get('username')?.markAsTouched();
      expect(FormValidationUtil.getFieldError(form, 'username')).toBe('Username must be at least 3 characters');
    });

    it('should return the maxlength message with the required length', () => {
      const form = buildForm();
      form.get('username')?.setValue('waytoolongusername');
      form.get('username')?.markAsTouched();
      expect(FormValidationUtil.getFieldError(form, 'username')).toBe('Username must not exceed 10 characters');
    });

    it('should return the min message for a number below the minimum', () => {
      const form = buildForm();
      form.get('age')?.setValue(10);
      form.get('age')?.markAsTouched();
      expect(FormValidationUtil.getFieldError(form, 'age')).toBe('Age must be at least 18');
    });

    it('should return the max message for a number above the maximum', () => {
      const form = buildForm();
      form.get('age')?.setValue(100);
      form.get('age')?.markAsTouched();
      expect(FormValidationUtil.getFieldError(form, 'age')).toBe('Age must not exceed 65');
    });

    it('should prefer a custom message when one is provided for the field/error combination', () => {
      const form = buildForm();
      form.get('email')?.markAsTouched();
      const message = FormValidationUtil.getFieldError(form, 'email', { email_required: 'Custom email message' });
      expect(message).toBe('Custom email message');
    });
  });

  describe('markFormGroupTouched', () => {
    it('should mark every control in the group as touched', () => {
      const form = new FormGroup({
        email: new FormControl(''),
        username: new FormControl('')
      });

      FormValidationUtil.markFormGroupTouched(form);

      expect(form.get('email')?.touched).toBe(true);
      expect(form.get('username')?.touched).toBe(true);
    });

    it('should recurse into nested form groups', () => {
      const form = new FormGroup({
        address: new FormGroup({
          city: new FormControl('')
        })
      });

      FormValidationUtil.markFormGroupTouched(form);

      expect((form.get('address') as FormGroup).get('city')?.touched).toBe(true);
    });
  });

  describe('hasFieldError', () => {
    it('should return false when the field is untouched even with errors', () => {
      const form = new FormGroup({ email: new FormControl('', Validators.required) });
      expect(FormValidationUtil.hasFieldError(form, 'email')).toBe(false);
    });

    it('should return true when the field is touched and has errors', () => {
      const form = new FormGroup({ email: new FormControl('', Validators.required) });
      form.get('email')?.markAsTouched();
      expect(FormValidationUtil.hasFieldError(form, 'email')).toBe(true);
    });

    it('should return false for a field that does not exist', () => {
      const form = new FormGroup({ email: new FormControl('') });
      expect(FormValidationUtil.hasFieldError(form, 'missing')).toBe(false);
    });
  });

  describe('getAllFormErrors', () => {
    it('should collect error messages for every touched, invalid field', () => {
      const form = new FormGroup({
        email: new FormControl('', Validators.required),
        username: new FormControl('valid')
      });
      form.get('email')?.markAsTouched();

      expect(FormValidationUtil.getAllFormErrors(form)).toEqual({ email: 'Email is required' });
    });

    it('should return an empty object when there are no errors', () => {
      const form = new FormGroup({ email: new FormControl('valid@example.com') });
      expect(FormValidationUtil.getAllFormErrors(form)).toEqual({});
    });
  });
});
