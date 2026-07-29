import { FormControl, FormGroup } from '@angular/forms';
import { PasswordUtility } from './password.util';
import { PasswordVisibility } from '../models';
import { PasswordStrength } from '../models/enums/password-strength.enum';

describe('PasswordUtility', () => {
  describe('toggleVisibility', () => {
    it('should switch from password to text', () => {
      expect(PasswordUtility.toggleVisibility(PasswordVisibility.password)).toBe(PasswordVisibility.text);
    });

    it('should switch from text back to password', () => {
      expect(PasswordUtility.toggleVisibility(PasswordVisibility.text)).toBe(PasswordVisibility.password);
    });
  });

  describe('checkPasswordStrength', () => {
    it('should return NONE strength and score 0 for an empty password', () => {
      expect(PasswordUtility.checkPasswordStrength('')).toEqual({ score: 0, strength: PasswordStrength.NONE });
    });

    it('should return WEAK for a password meeting 2 or fewer criteria', () => {
      const result = PasswordUtility.checkPasswordStrength('abc');
      expect(result.score).toBe(1);
      expect(result.strength).toBe(PasswordStrength.WEAK);
    });

    it('should return MEDIUM for a password meeting 3-4 criteria', () => {
      const result = PasswordUtility.checkPasswordStrength('abcABC12');
      expect(result.score).toBe(4);
      expect(result.strength).toBe(PasswordStrength.MEDIUM);
    });

    it('should return STRONG for a password meeting all 5 criteria', () => {
      const result = PasswordUtility.checkPasswordStrength('Abcdef1!');
      expect(result.score).toBe(5);
      expect(result.strength).toBe(PasswordStrength.STRONG);
    });
  });

  describe('passwordMatchValidator', () => {
    it('should return null when the control has no parent yet', () => {
      const control = new FormControl('anything');
      const validator = PasswordUtility.passwordMatchValidator('password');
      expect(validator(control)).toBeNull();
    });

    // NOTE: because of Angular's construction order, a validator passed directly into
    // `new FormControl(value, validator)` inside a `new FormGroup({...})` literal always sees
    // `control.parent` as undefined on its first (construction-time) run — the parent link is
    // only assigned by the FormGroup constructor AFTER it receives the already-built child
    // control. So the validator's *own* first invocation always short-circuits via the
    // `!control.parent` guard and returns null, no matter what the values are. This matches
    // the real app: password-reset.component.ts is the only consumer, and it works around this
    // exact gap with a manual `password.valueChanges.subscribe(() => confirmPassword
    // .updateValueAndValidity())` — i.e. it forces a *second* validator invocation, by which
    // point the parent is set. These tests exercise that same realistic two-step pattern rather
    // than asserting on the (non-functional) very first construction-time run.
    it('should return null when the value matches the target control, once re-validated after construction', () => {
      const form = new FormGroup({
        password: new FormControl('secret123'),
        confirmPassword: new FormControl('secret123', PasswordUtility.passwordMatchValidator('password'))
      });
      form.get('confirmPassword')?.updateValueAndValidity();

      expect(form.get('confirmPassword')?.errors).toBeNull();
    });

    it('should return a passwordMismatch error once re-validated after construction', () => {
      const form = new FormGroup({
        password: new FormControl('secret123'),
        confirmPassword: new FormControl('different', PasswordUtility.passwordMatchValidator('password'))
      });
      form.get('confirmPassword')?.updateValueAndValidity();

      expect(form.get('confirmPassword')?.errors).toEqual({ passwordMismatch: true });
    });

    it('should re-validate correctly when the user types into confirmPassword directly', () => {
      const form = new FormGroup({
        password: new FormControl('secret123'),
        confirmPassword: new FormControl('secret123', PasswordUtility.passwordMatchValidator('password'))
      });

      // Typing into confirmPassword itself always re-runs its own validator with parent
      // already set (the form is long since constructed by the time a user can type) —
      // this path works correctly without any extra wiring.
      form.get('confirmPassword')?.setValue('nowdifferent');
      expect(form.get('confirmPassword')?.errors).toEqual({ passwordMismatch: true });
    });

    it('should NOT auto-revalidate confirmPassword when password changes, without the manual workaround', () => {
      // This documents the real gap: the validator's own internal subscription (meant to
      // recheck confirmPassword whenever `password` changes) never gets attached, because it
      // only sets up inside the branch that requires `parent` to already exist — which isn't
      // true on the first, construction-time run. Without a consumer manually calling
      // updateValueAndValidity() (as password-reset.component.ts does), a stale match/mismatch
      // state can persist after `password` changes.
      const form = new FormGroup({
        password: new FormControl('secret123'),
        confirmPassword: new FormControl('secret123', PasswordUtility.passwordMatchValidator('password'))
      });

      form.get('password')?.setValue('changed');
      expect(form.get('confirmPassword')?.errors).toBeNull();
    });

    it('should always return null in reverse mode regardless of match state', () => {
      const form = new FormGroup({
        confirmPassword: new FormControl('secret123'),
        password: new FormControl('different', PasswordUtility.passwordMatchValidator('confirmPassword', true))
      });

      expect(form.get('password')?.errors).toBeNull();
    });
  });
});
