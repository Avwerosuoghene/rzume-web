export interface AppConfigApiUrls {
  backend: string;
  googleAuth: string;
}

export interface AppConfigFeatureFlags {
  enableProfileManagement: boolean;
}

export interface AppConfigAnalytics {
  mixpanelToken?: string;
  googleTagId?: string;
  linkedInPartnerId?: string;
  enabled?: boolean;
}

export interface AppConfig {
  apiUrls: AppConfigApiUrls;
  featureFlags: AppConfigFeatureFlags;
  analytics?: AppConfigAnalytics;
  landingPageUrl?: string;
}
