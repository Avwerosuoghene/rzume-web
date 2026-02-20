export enum AnalyticsEvent {
  // Authentication Events
  AUTH_SIGNUP_INITIATED = 'auth_signup_initiated',
  AUTH_SIGNUP_COMPLETED = 'auth_signup_completed',
  AUTH_SIGNUP_FAILED = 'auth_signup_failed',
  AUTH_SIGNIN_INITIATED = 'auth_signin_initiated',
  AUTH_SIGNIN_COMPLETED = 'auth_signin_completed',
  AUTH_SIGNIN_FAILED = 'auth_signin_failed',
  AUTH_LOGOUT = 'auth_logout',
  AUTH_GOOGLE_OAUTH_INITIATED = 'auth_google_oauth_initiated',
  AUTH_GOOGLE_OAUTH_COMPLETED = 'auth_google_oauth_completed',
  AUTH_PASSWORD_RESET_REQUESTED = 'auth_password_reset_requested',
  AUTH_PASSWORD_RESET_COMPLETED = 'auth_password_reset_completed',
  AUTH_PASSWORD_RESET_FAILED = 'auth_password_reset_failed',
  AUTH_EMAIL_VERIFICATION_INITIATED = 'auth_email_verification_initiated',
  AUTH_EMAIL_VERIFICATION_COMPLETED = 'auth_email_verification_completed',

  // Job Application Events
  JOB_APPLICATION_CREATED = 'job_application_created',
  JOB_APPLICATION_CREATE_FAILED = 'job_application_create_failed',
  JOB_APPLICATION_UPDATED = 'job_application_updated',
  JOB_APPLICATION_UPDATE_FAILED = 'job_application_update_failed',
  JOB_APPLICATION_DELETED = 'job_application_deleted',
  JOB_APPLICATION_DELETE_FAILED = 'job_application_delete_failed',
  JOB_APPLICATION_STATUS_CHANGED = 'job_application_status_changed',
  JOB_APPLICATION_STATUS_CHANGE_FAILED = 'job_application_status_change_failed',
  JOB_APPLICATION_BULK_DELETED = 'job_application_bulk_deleted',
  JOB_APPLICATION_BULK_DELETE_FAILED = 'job_application_bulk_delete_failed',
  JOB_SEARCH_INITIATED = 'job_search_initiated',
  JOB_SEARCH_FAILED = 'job_search_failed',
  JOB_FILTER_APPLIED = 'job_filter_applied',

  // Navigation Events
  PAGE_VIEWED = 'page_viewed', // Generic fallback
  HOME_PAGE_LOADED = 'home_page_loaded',
  LOGIN_PAGE_LOADED = 'login_page_loaded',
  SIGNUP_PAGE_LOADED = 'signup_page_loaded',
  ONBOARD_PAGE_LOADED = 'onboard_page_loaded',
  DASHBOARD_PAGE_LOADED = 'dashboard_page_loaded',
  PROFILE_PAGE_LOADED = 'profile_page_loaded',
  RESET_PASSWORD_PAGE_LOADED = 'reset_password_page_loaded',
  EMAIL_CONFIRMATION_PAGE_LOADED = 'email_confirmation_page_loaded',
  FORGOT_PASSWORD_PAGE_LOADED = 'forgot_password_page_loaded',

  DASHBOARD_LOAD_FAILED = 'dashboard_load_failed',

  // Profile Management Events
  PROFILE_UPDATED = 'profile_updated',
  PROFILE_UPDATE_FAILED = 'profile_update_failed',
  PROFILE_PHOTO_UPLOADED = 'profile_photo_uploaded',
  PROFILE_PHOTO_UPLOAD_FAILED = 'profile_photo_upload_failed',

  // API Events
  API_CALL_SUCCESS = 'api_call_success',
  API_CALL_FAILED = 'api_call_failed',

  // Error Events
  ERROR_OCCURRED = 'error_occurred'
}

export enum SignupMethod {
  EMAIL = 'email',
  GOOGLE = 'google'
}

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet'
}
