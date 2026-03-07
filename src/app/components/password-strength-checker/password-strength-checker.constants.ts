export const PASSWORD_CHECKER_MESSAGES = {
  INITIAL: 'Create a strong password to protect your account',
  SUCCESS: 'Excellent! Your password meets all requirements.',
  PROGRESS: (validCount: number, totalCount: number) => 
    `${validCount} of ${totalCount} requirements met. Keep going!`
} as const;

export const PASSWORD_CHECKER_ICONS = {
  VALID: 'check_circle',
  INVALID: 'cancel',
  PENDING: 'radio_button_unchecked'
} as const;

export const PASSWORD_CHECKER_ARIA_STATUS = {
  VALID: 'met',
  INVALID: 'not met',
  PENDING: 'pending'
} as const;

export const STRENGTH_PERCENTAGE_MULTIPLIER = 20; // 5 requirements * 20 = 100%
