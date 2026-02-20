import { Injectable } from '@angular/core';
import mixpanel from 'mixpanel-browser';
import { AnalyticsService } from './analytics.service';
import { AnalyticsUser, EventProperties } from '../../models/analytics.models';
import { AnalyticsEvent } from '../../models/analytics-events.enum';
import { ConfigService } from '../config.service';
import { AnalyticsUserContextService } from '../analytics-user-context.service';

@Injectable({
  providedIn: 'root'
})
export class MixpanelService extends AnalyticsService {
  private initialized = false;
  private readonly OPT_OUT_KEY = 'mixpanel_opt_out';

  constructor(
    private configService: ConfigService,
    private userContextService: AnalyticsUserContextService
  ) {
    super();
  }

  initialize(): void {
    if (this.initialized) {
      return;
    }

    try {
      const token = this.configService.mixpanelToken;
      const isEnabled = this.configService.isAnalyticsEnabled;

      if (!token || !isEnabled) {
        console.warn('Mixpanel: Analytics disabled or token not configured');
        return;
      }

      // Default analytics consent to true - always enabled
      localStorage.setItem(this.OPT_OUT_KEY, 'false');

      mixpanel.init(token, {
        debug: false,
        track_pageview: false,
        persistence: 'localStorage',
        ignore_dnt: true
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Mixpanel:', error);
    }
  }

  identify(user: AnalyticsUser): void {
    if (!this.initialized) {
      return;
    }

    try {
      mixpanel.identify(user.userId);

      const userProperties: any = {};
      if (user.email) userProperties.$email = user.email;
      if (user.name) userProperties.$name = user.name;
      if (user.signupDate) userProperties.signup_date = user.signupDate;
      if (user.subscriptionStatus) userProperties.subscription_status = user.subscriptionStatus;
      if (user.totalApplications !== undefined) userProperties.total_applications = user.totalApplications;
      if (user.deviceType) userProperties.device_type = user.deviceType;

      mixpanel.people.set(userProperties);
    } catch (error) {
      console.error('Mixpanel identify error:', error);
    }
  }

  track(event: AnalyticsEvent | string, properties?: EventProperties): void {
    if (!this.initialized) {
      return;
    }

    try {
      // Enrich properties with user context
      const enrichedProperties = this.userContextService.enrichEventProperties({
        ...properties,
        device_type: this.getDeviceType()
      });

      mixpanel.track(event, enrichedProperties);
    } catch (error) {
      console.error('Mixpanel track error:', error);
    }
  }

  trackPageView(pageName: string, properties?: EventProperties): void {
    const eventName = this.mapPageToEvent(pageName);

    // Enrich with user context automatically
    const enrichedProperties = this.userContextService.enrichEventProperties({
      page_name: pageName,
      ...properties
    });

    this.track(eventName, enrichedProperties);
  }

  private mapPageToEvent(pageName: string): string {
    const mapping: Record<string, string> = {
      'home': AnalyticsEvent.HOME_PAGE_LOADED,
      'login': AnalyticsEvent.LOGIN_PAGE_LOADED,
      'signup': AnalyticsEvent.SIGNUP_PAGE_LOADED,
      'register': AnalyticsEvent.SIGNUP_PAGE_LOADED,
      'onboard': AnalyticsEvent.ONBOARD_PAGE_LOADED,
      'dashboard': AnalyticsEvent.DASHBOARD_PAGE_LOADED,
      'profile-management': AnalyticsEvent.PROFILE_PAGE_LOADED,
      'profile': AnalyticsEvent.PROFILE_PAGE_LOADED,
      'reset-password': AnalyticsEvent.RESET_PASSWORD_PAGE_LOADED,
      'email-confirmation': AnalyticsEvent.EMAIL_CONFIRMATION_PAGE_LOADED,
      'request-pass-reset': AnalyticsEvent.FORGOT_PASSWORD_PAGE_LOADED
    };

    return mapping[pageName] || `${pageName}_page_loaded`;
  }

  setUserProperties(properties: Partial<AnalyticsUser>): void {
    if (!this.initialized) {
      return;
    }

    try {
      const userProps: any = {};
      if (properties.email) userProps.$email = properties.email;
      if (properties.name) userProps.$name = properties.name;
      if (properties.signupDate) userProps.signup_date = properties.signupDate;
      if (properties.subscriptionStatus) userProps.subscription_status = properties.subscriptionStatus;
      if (properties.totalApplications !== undefined) userProps.total_applications = properties.totalApplications;
      if (properties.deviceType) userProps.device_type = properties.deviceType;

      mixpanel.people.set(userProps);
    } catch (error) {
      console.error('Mixpanel set user properties error:', error);
    }
  }

  setUserProperty(property: string, value: any): void {
    if (!this.initialized) {
      return;
    }

    try {
      const userProps: any = {};
      userProps[property] = value;

      mixpanel.people.set(userProps);
    } catch (error) {
      console.error('Mixpanel set user property error:', error);
    }
  }

  incrementUserProperty(property: string, value: number = 1): void {
    if (!this.initialized) {
      return;
    }

    try {
      mixpanel.people.increment(property, value);
    } catch (error) {
      console.error('Mixpanel increment error:', error);
    }
  }

  reset(): void {
    if (!this.initialized) {
      return;
    }

    try {
      mixpanel.reset();
    } catch (error) {
      console.error('Mixpanel reset error:', error);
    }
  }

  optIn(): void {
    localStorage.setItem(this.OPT_OUT_KEY, 'false');
  }

  optOut(): void {
    // Opt-out functionality disabled - analytics always enabled
  }

  hasOptedOut(): boolean {
    // Always return false - analytics always enabled
    return false;
  }

  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 599) return 'mobile';
    if (width < 950) return 'tablet';
    return 'desktop';
  }
}
