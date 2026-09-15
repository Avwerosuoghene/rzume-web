export const PASSWORD_CHECKER_ARIA_STATUS = {
  VALID: 'met',
  INVALID: 'not met',
  PENDING: 'pending'
} as const;

export const STRENGTH_PERCENTAGE_MULTIPLIER = 20; // 5 requirements * 20 = 100%
