import { Injectable } from '@angular/core';
import { AnalyticsUser, EventProperties } from '../../models/analytics.models';
import { AnalyticsEvent } from '../../models/analytics-events.enum';

@Injectable({
  providedIn: 'root'
})
export abstract class AnalyticsService {
  abstract initialize(): void;
  abstract identify(user: AnalyticsUser): void;
  abstract track(event: AnalyticsEvent | string, properties?: EventProperties): void;
  abstract trackPageView(pageName: string, properties?: EventProperties): void;
  abstract setUserProperties(properties: Partial<AnalyticsUser>): void;
  abstract incrementUserProperty(property: string, value?: number): void;
  abstract reset(): void;
  abstract optOut(): void;
  abstract optIn(): void;
  abstract hasOptedOut(): boolean;
}
