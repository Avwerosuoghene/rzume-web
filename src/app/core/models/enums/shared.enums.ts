export enum ApplicationStatus {
  Applied = 'Applied',
  Wishlist = 'Wishlist',
  Submitted = 'Submitted',
  InProgress = 'InProgress',
  OfferReceived = 'OfferReceived',
  Rejected = 'Rejected',
  All = ''
}

export enum onBoardStages {
  first = 0,
  second = 1,
  third = 2,
  fourth = 3
}

export enum IconStat {
  success = 'done',
  failed = 'close',
  warn = 'warning',
}

export enum SessionStorageKeys {
  userMail = 'userMail',
  authToken = 'authToken',
  userData = 'userData',
  subscriptionFeatures = 'subscriptionFeatures'
}

export enum SubscriptionFeatureKeys {
  CvUploadLimit = 'cv_upload_limit',
  JobAppLimit = 'job_app_limit',
  StorageMb = 'storage_mb'
}

export enum EmptyStateIcon {
  NoApplications = 'work_outline',
  NoResults = 'search_off',
}

export enum BorderRadius {
  small = 8,
  medium = 14,
  large = 24,
  extraLarge = 68
}








