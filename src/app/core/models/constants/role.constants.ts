export const ROLE_LIMIT = 2;
export const ROLE_DOCUMENT_MAX_SIZE = 500 * 1024; // 500KB
export const ROLE_DOCUMENT_TYPES = ['application/pdf'] as const;

export const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'government', label: 'Government' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'other', label: 'Other' }
] as const;

export type IndustryValue = typeof INDUSTRIES[number]['value'];

export const ROLE_EMPTY_STATES = {
  NO_ROLES: {
    icon: 'folder_open',
    title: 'No roles added yet',
    message: 'Click \'Add new role\' to start.'
  }
} as const;

export const ROLE_FORM_LABELS = {
  JOB_ROLE: 'Job Role',
  INDUSTRY: 'Industry',
  DOCUMENTS: 'Documents',
  ADD_JOB_ROLE: 'Add Job Role'
} as const;

export const ROLE_VALIDATION = {
  JOB_ROLE_MIN_LENGTH: 2,
  JOB_ROLE_MAX_LENGTH: 100,
  MAX_FILE_SIZE: ROLE_DOCUMENT_MAX_SIZE,
  ALLOWED_FILE_TYPES: ROLE_DOCUMENT_TYPES
} as const;

export const ROLE_ERROR_MESSAGES = {
  JOB_ROLE_REQUIRED: 'Job role is required',
  JOB_ROLE_MIN_LENGTH: `Job role must be at least ${ROLE_VALIDATION.JOB_ROLE_MIN_LENGTH} characters`,
  JOB_ROLE_MAX_LENGTH: `Job role cannot exceed ${ROLE_VALIDATION.JOB_ROLE_MAX_LENGTH} characters`,
  INDUSTRY_REQUIRED: 'Industry is required',
  FILE_TOO_LARGE: `File size must not exceed ${ROLE_DOCUMENT_MAX_SIZE / 1024}KB`,
  INVALID_FILE_TYPE: 'Only PDF files are allowed',
  LOAD_FAILED: 'Failed to load roles. Please try again.'
} as const;

export const ROLE_DIALOG_CONFIG = {
  TITLE: 'Add New Role',
  EDIT_TITLE: 'Edit Role',
  SUBMIT_BUTTON_TEXT: 'Add Job Role',
  SAVE_BUTTON_TEXT: 'Save',
  FILE_RESTRICTIONS_TEXT: `PDF only (max. ${ROLE_DOCUMENT_MAX_SIZE / 1024}kb per document)`
} as const;

export const ROLE_DELETE_CONFIRM = {
  TITLE: 'Remove Role',
  MESSAGE: 'Are you sure you want to delete this Role?'
} as const;

export const ROLE_DOCUMENT_DELETE_CONFIRM = {
  TITLE: 'Delete Document',
  MESSAGE: 'Are you sure you want to remove this document from the role?'
} as const;
