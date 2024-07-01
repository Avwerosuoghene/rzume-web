export const PasswordCriteria: Array<{name: string, validator: (password: string) => boolean}> = [
  { name: 'Length', validator: (password: string) => password.length >= 8 },
  { name: 'Uppercase', validator: (password: string) => /[A-Z]/.test(password) },
  { name: 'Lowercase', validator: (password: string) => /[a-z]/.test(password) },
  { name: 'Number', validator: (password: string) => /[0-9]/.test(password) },
  { name: 'Special Character', validator: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password) }
];

export const PasswordStrengthLevels = [ 'Weak', 'Medium', 'Medium', 'Strong', 'Strong'];

