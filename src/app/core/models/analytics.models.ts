export interface AnalyticsUser {
  userId: string;
  email?: string;
  name?: string;
  signupDate?: Date;
  subscriptionStatus?: string;
  totalApplications?: number;
  deviceType?: string;
}

export interface EventProperties {
  [key: string]: any;
}

export interface AnalyticsConfig {
  token: string;
  debug?: boolean;
  track_pageview?: boolean;
  persistence?: string;
  api_host?: string;
  loaded?: (mixpanel: any) => void;
}
