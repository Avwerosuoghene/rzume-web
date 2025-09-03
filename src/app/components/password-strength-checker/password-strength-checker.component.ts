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
  protected readonly strengthResult = signal<PasswordStrengthResult>({
    score: 0,
    strength: PasswordStrength.NONE
  });
  
  protected readonly PasswordStrength = PasswordStrength;

  readonly strengthBars = computed(() => 
    Array.from({ length: this.strengthResult().score }, (_, index) => index + 1)
  );
 
  checkPasswordStrength(password: string): PasswordStrengthResult {
    const result = password.length > 0 
      ? PasswordUtility.checkPasswordStrength(password)
      : this.getEmptyStrengthResult();
    
    this.strengthResult.set(result);
    return result;
  }

  private getEmptyStrengthResult(): PasswordStrengthResult {
    return {
      score: 0,
      strength: PasswordStrength.NONE
    };
  }
}
