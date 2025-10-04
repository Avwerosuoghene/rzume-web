export enum PROFILE_TABS {
  PROFILE = 'profile',
  DOCUMENTS = 'documents'
}

export interface ProfileTabConfig {
  id: string;
  label: string;
  icon?: string;
}

export const PROFILE_TAB_CONFIGS: ProfileTabConfig[] = [
  { id: PROFILE_TABS.PROFILE, label: 'Profile' },
  { id: PROFILE_TABS.DOCUMENTS, label: 'Documents' }
];

export const PROFILE_FORM_LABELS = {
  PROFILE_PHOTO: 'Profile photo',
  CHANGE_PHOTO: 'Change Photo',
  PERSONAL_INFO: 'Personal Information',
  PERSONAL_INFO_DESCRIPTION: 'Update your personal details here.',
  FIRST_NAME: 'First name',
  LAST_NAME: 'Last name',
  EMAIL_ADDRESS: 'Email address',
  SAVE_CHANGES: 'Save Changes'
} as const;

export const PROFILE_VALIDATION = {
  FIRST_NAME_MIN_LENGTH: 2,
  FIRST_NAME_MAX_LENGTH: 50,
  LAST_NAME_MIN_LENGTH: 2,
  LAST_NAME_MAX_LENGTH: 50,
  EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  MAX_FILE_SIZE: 1 * 1024 * 1024, 
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
} as const;

export const PROFILE_ERROR_MESSAGES = {
  FIRST_NAME_REQUIRED: 'First name is required',
  FIRST_NAME_MIN_LENGTH: `First name must be at least ${PROFILE_VALIDATION.FIRST_NAME_MIN_LENGTH} characters`,
  FIRST_NAME_MAX_LENGTH: `First name cannot exceed ${PROFILE_VALIDATION.FIRST_NAME_MAX_LENGTH} characters`,
  LAST_NAME_REQUIRED: 'Last name is required',
  LAST_NAME_MIN_LENGTH: `Last name must be at least ${PROFILE_VALIDATION.LAST_NAME_MIN_LENGTH} characters`,
  LAST_NAME_MAX_LENGTH: `Last name cannot exceed ${PROFILE_VALIDATION.LAST_NAME_MAX_LENGTH} characters`,
  EMAIL_REQUIRED: 'Email address is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  FILE_TOO_LARGE: 'File size must not exceed 1MB',
  INVALID_FILE_TYPE: 'Only JPEG, PNG, and WebP images are allowed'
} as const;

export const DOCUMENT_TYPES = {
  RESUME: 'resume',
  COVER_LETTER: 'cover_letter',
  CERTIFICATE: 'certificate',
  OTHER: 'other'
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DOCUMENT_TYPES.RESUME]: 'Resume',
  [DOCUMENT_TYPES.COVER_LETTER]: 'Cover Letter',
  [DOCUMENT_TYPES.CERTIFICATE]: 'Certificate',
  [DOCUMENT_TYPES.OTHER]: 'Other'
};

export const DOCUMENT_VALIDATION = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, 
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
} as const;

export const PROFILE_EMPTY_STATES = {
  NO_DOCUMENTS: {
    title: 'No documents uploaded',
    message: 'Upload your resume, cover letters, and other documents to get started.',
    actionText: 'Upload Document'
  }
} as const;

export const ACCEPTED_IMAGE_TYPES = PROFILE_VALIDATION.ALLOWED_IMAGE_TYPES.join(',');
