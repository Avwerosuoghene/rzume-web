import { Component, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { PasswordUtility, type PasswordStrengthResult } from '../../core/helpers/password.util';
import { PasswordStrength } from '../../core/models/enums/password-strength.enum';
import { PASSWORD_STRENGTH_THRESHOLDS } from '../../core/models/constants/password.constants';

@Component({
  selector: 'app-password-strength-checker',
  standalone: true,
  imports: [NgClass],
  templateUrl: './password-strength-checker.component.html',
  styleUrl: './password-strength-checker.component.scss'
})
export class PasswordStrengthCheckerComponent {
  private readonly strengthResult = signal<PasswordStrengthResult>({
    score: 0,
    strength: PasswordStrength.NONE,
    description: ''
  });

  /**
   * Computed signal for the strength bars to display
   */
  readonly strengthBars = computed(() => 
    Array.from({ length: this.strengthResult().score }, (_, index) => index + 1)
  );

  /**
   * Computed signal for the strength description text
   */
  readonly strengthDescription = computed(() => 
    this.strengthResult().description || ''
  );

  /**
   * Computed signal for the strength CSS class
   */
  readonly strengthClass = computed(() => {
    const score = this.strengthResult().score;
    if (score === 0) return '';
    
    if (score <= PASSWORD_STRENGTH_THRESHOLDS.WEAK) {
      return PasswordStrength.WEAK;
    }
    return score <= PASSWORD_STRENGTH_THRESHOLDS.MEDIUM 
      ? PasswordStrength.MEDIUM 
      : PasswordStrength.STRONG;
  });

  /**
   * Checks the strength of the provided password and updates the component state
   * @param password The password to check
   * @returns The password strength description
   */
  checkPasswordStrength(password: string): string {
    const result = password.length > 0 
      ? PasswordUtility.checkPasswordStrength(password)
      : this.getEmptyStrengthResult();
    
    this.strengthResult.set(result);
    return result.description;
  }

  private getEmptyStrengthResult(): PasswordStrengthResult {
    return {
      score: 0,
      strength: PasswordStrength.NONE,
      description: ''
    };
  }
}
