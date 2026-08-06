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
  [key: string]: unknown;
}

export interface AnalyticsConfig {
  token: string;
  debug?: boolean;
  track_pageview?: boolean;
  persistence?: string;
  api_host?: string;
  loaded?: (mixpanel: unknown) => void;
}

export interface MixpanelUserProperties {
  $email?: string;
  $name?: string;
  signup_date?: Date;
  subscription_status?: string;
  total_applications?: number;
  device_type?: string;
}

export interface GoogleTagUserProperties {
  email?: string;
  subscription_status?: string;
}

export interface EnrichedEventProperties extends EventProperties {
  user_email?: string;
  user_username?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_authenticated: boolean;
  timestamp: string;
  user_id?: string;
}
