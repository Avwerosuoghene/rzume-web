
export const PASSWORD_CRITERIA = {
  MIN_LENGTH: 8,
  HAS_UPPERCASE: /[A-Z]/,
  HAS_LOWERCASE: /[a-z]/,
  HAS_NUMBER: /[0-9]/,
  HAS_SPECIAL_CHAR: /[!@#$%^&*(),.?":{}|<>]/
} as const;

export const PASSWORD_CRITERIA_CONFIG = [
  { 
    name: 'length', 
    validator: (password: string) => password.length >= PASSWORD_CRITERIA.MIN_LENGTH,
    description: `At least ${PASSWORD_CRITERIA.MIN_LENGTH} characters`
  },
  { 
    name: 'uppercase', 
    validator: (password: string) => PASSWORD_CRITERIA.HAS_UPPERCASE.test(password),
    description: 'At least one uppercase letter'
  },
  { 
    name: 'lowercase', 
    validator: (password: string) => PASSWORD_CRITERIA.HAS_LOWERCASE.test(password),
    description: 'At least one lowercase letter'
  },
  { 
    name: 'number', 
    validator: (password: string) => PASSWORD_CRITERIA.HAS_NUMBER.test(password),
    description: 'At least one number'
  },
  { 
    name: 'special', 
    validator: (password: string) => PASSWORD_CRITERIA.HAS_SPECIAL_CHAR.test(password),
    description: 'At least one special character'
  }
] as const;

export const PASSWORD_STRENGTH_THRESHOLDS = {
  WEAK: 2,
  MEDIUM: 4,
  STRONG: 5
} as const;
