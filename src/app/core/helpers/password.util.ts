import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PasswordVisibility } from '../models';
import { PasswordStrength } from '../models/enums/password-strength.enum';
import { 
  PASSWORD_CRITERIA_CONFIG, 
  PASSWORD_STRENGTH_THRESHOLDS 
} from '../models/constants/password.constants';

export interface PasswordStrengthResult {
  score: number;
  strength: PasswordStrength;
}

export class PasswordUtility {
  private static passwordVisibilityTimer: any;
  
  static toggleVisibility(passwordVisibility: PasswordVisibility): PasswordVisibility {
    if (passwordVisibility === PasswordVisibility.password) {
      clearTimeout(this.passwordVisibilityTimer);
      return PasswordVisibility.text;
    }
    return PasswordVisibility.password;
  }

  static passwordMatchValidator(matchTo: string, reverse = false): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      if (reverse) {
        return this.setupReverseValidation(control, matchTo);
      }

      return this.validatePasswordMatch(control, matchTo);
    };
  }

  static checkPasswordStrength(password: string): PasswordStrengthResult {
    if (!password) {
      return this.getEmptyStrengthResult();
    }

    const score = this.calculatePasswordScore(password);
    
    return {
      score,
      strength:  this.determineStrengthLevel(score),
    };
  }

  private static setupReverseValidation(control: AbstractControl, matchTo: string): null {
    const controlToMatch = control.parent?.get(matchTo);
    if (controlToMatch) {
      const subscription = controlToMatch.valueChanges.subscribe(() => {
        control.updateValueAndValidity();
        subscription.unsubscribe();
      });
    }
    return null;
  }

  private static validatePasswordMatch(control: AbstractControl, matchTo: string): ValidationErrors | null {
    const controlToMatch = control.parent?.get(matchTo);
    
    if (controlToMatch) {
      const subscription = controlToMatch.valueChanges.subscribe(() => {
        control.updateValueAndValidity();
        subscription.unsubscribe();
      });
    }

    return control.value === controlToMatch?.value 
      ? null 
      : { passwordMismatch: true };
  }

  private static calculatePasswordScore(password: string): number {
    return PASSWORD_CRITERIA_CONFIG.reduce(
      (count, criteria) => count + (criteria.validator(password) ? 1 : 0),
      0
    );
  }

  private static determineStrengthLevel(score: number): PasswordStrength {
    if (score <= PASSWORD_STRENGTH_THRESHOLDS.WEAK) {
      return PasswordStrength.WEAK;
    }
    return score <= PASSWORD_STRENGTH_THRESHOLDS.MEDIUM 
      ? PasswordStrength.MEDIUM 
      : PasswordStrength.STRONG;
  }

  private static getEmptyStrengthResult(): PasswordStrengthResult {
    return {
      score: 0,
      strength: PasswordStrength.NONE
    };
  }
}
