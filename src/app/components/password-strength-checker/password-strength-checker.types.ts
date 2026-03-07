import { PasswordStrength } from '../../core/models/enums/password-strength.enum';

export interface PasswordRequirement {
  name: string;
  validator: (password: string) => boolean;
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  validCriteria: PasswordRequirement[];
  invalidCriteria: PasswordRequirement[];
  strength: PasswordStrength;
  score: number;
}

export type RequirementStatus = 'pending' | 'valid' | 'invalid';
