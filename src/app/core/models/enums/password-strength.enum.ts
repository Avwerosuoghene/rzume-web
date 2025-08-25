export enum PasswordStrength {
  NONE = 'none',
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong'
}

export enum PasswordStrengthThreshold {
  WEAK = 2,
  MEDIUM = 3,
  STRONG = 4
}

export const PASSWORD_STRENGTH_LEVELS: Record<number, string> = {
  0: 'Too short',
  1: 'Very weak',
  2: 'Weak',
  3: 'Medium',
  4: 'Strong',
  5: 'Very strong'
} as const;
