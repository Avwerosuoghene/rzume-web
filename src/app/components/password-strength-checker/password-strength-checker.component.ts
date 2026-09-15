import { Component, computed, signal } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PasswordUtility, type PasswordStrengthResult } from '../../core/helpers/password.util';
import { PasswordStrength } from '../../core/models/enums/password-strength.enum';
import { PASSWORD_CRITERIA_CONFIG, PASSWORD_STRENGTH_THRESHOLDS } from '../../core/models/constants/password.constants';
import {
  PasswordRequirement,
  ValidationResult,
  RequirementStatus
} from './password-strength-checker.types';
import {
  PASSWORD_CHECKER_ARIA_STATUS,
  STRENGTH_PERCENTAGE_MULTIPLIER
} from './password-strength-checker.constants';

@Component({
  selector: 'app-password-strength-checker',
  standalone: true,
  imports: [NgClass, CommonModule, MatIconModule],
  templateUrl: './password-strength-checker.component.html',
  styleUrl: './password-strength-checker.component.scss'
})
export class PasswordStrengthCheckerComponent {
  protected readonly passwordRequirements = signal<readonly PasswordRequirement[]>(PASSWORD_CRITERIA_CONFIG);
  protected readonly validationResult = signal<ValidationResult>({
    isValid: false,
    validCriteria: [],
    invalidCriteria: [],
    strength: PasswordStrength.NONE,
    score: 0
  });

  protected readonly isVisible = signal(false);
  protected readonly PasswordStrength = PasswordStrength;

  readonly strengthPercentage = computed(() => {
    const score = this.validationResult().score;
    return score * STRENGTH_PERCENTAGE_MULTIPLIER;
  });

  checkPasswordStrength(password: string): PasswordStrengthResult {
    const result = password.length > 0
      ? PasswordUtility.checkPasswordStrength(password)
      : this.getEmptyStrengthResult();

    this.validatePasswordWithRequirements(password);
    return result;
  }

  validatePasswordWithRequirements(password: string): ValidationResult {
    const criteria = this.passwordRequirements();
    const validCriteria: PasswordRequirement[] = [];
    const invalidCriteria: PasswordRequirement[] = [];

    if (password.length > 0) {
      criteria.forEach(requirement => {
        if (requirement.validator(password)) {
          validCriteria.push(requirement);
        } else {
          invalidCriteria.push(requirement);
        }
      });
    }

    const score = validCriteria.length;
    const strength = this.determineStrengthLevel(score);
    const isValid = validCriteria.length === criteria.length && password.length > 0;

    const result: ValidationResult = {
      isValid,
      validCriteria,
      invalidCriteria,
      strength,
      score
    };

    this.validationResult.set(result);

    return result;
  }

  private determineStrengthLevel(score: number): PasswordStrength {
    if (score <= PASSWORD_STRENGTH_THRESHOLDS.WEAK) {
      return PasswordStrength.WEAK;
    }
    return score <= PASSWORD_STRENGTH_THRESHOLDS.MEDIUM
      ? PasswordStrength.MEDIUM
      : PasswordStrength.STRONG;
  }

  getRequirementStatus(requirement: PasswordRequirement): RequirementStatus {
    const result = this.validationResult();
    const hasInput = result.validCriteria.length > 0 || result.invalidCriteria.length > 0;

    if (!hasInput) return 'pending';
    return result.validCriteria.includes(requirement) ? 'valid' : 'invalid';
  }

  getRequirementAriaLabel(requirement: PasswordRequirement): string {
    const status = this.getRequirementStatus(requirement);
    const statusText = status === 'valid'
      ? PASSWORD_CHECKER_ARIA_STATUS.VALID
      : status === 'invalid'
        ? PASSWORD_CHECKER_ARIA_STATUS.INVALID
        : PASSWORD_CHECKER_ARIA_STATUS.PENDING;
    return `${requirement.description}: ${statusText}`;
  }

  show(): void {
    this.isVisible.set(true);
  }

  hide(): void {
    this.isVisible.set(false);
  }

  private getEmptyStrengthResult(): PasswordStrengthResult {
    return {
      score: 0,
      strength: PasswordStrength.NONE
    };
  }
}
