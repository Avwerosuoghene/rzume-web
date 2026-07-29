import { Injectable } from '@angular/core';
import { AnalyticsService } from './analytics.service';
import { AnalyticsUser, EventProperties } from '../../models/analytics.models';
import { AnalyticsEvent } from '../../models/analytics-events.enum';
import { MixpanelService } from './mixpanel.service';
import { GoogleTagService } from './google-tag.service';

@Injectable({
    providedIn: 'root'
})
export class CompositeAnalyticsService extends AnalyticsService {
    private services: AnalyticsService[] = [];

    constructor(
        private mixpanelService: MixpanelService,
        private googleTagService: GoogleTagService
    ) {
        super();
        this.services = [this.mixpanelService, this.googleTagService];
    }

    initialize(): void {
        this.services.forEach(service => {
            try {
                service.initialize();
            } catch (e) {
                console.error('Error initializing analytics service', e);
            }
        });
    }

    identify(user: AnalyticsUser): void {
        this.services.forEach(service => {
            try {
                service.identify(user);
            } catch (e) {
                console.error('Error identifying user in analytics service', e);
            }
        });
    }

    track(event: AnalyticsEvent | string, properties?: EventProperties): void {
        this.services.forEach(service => {
            try {
                service.track(event, properties);
            } catch (e) {
                console.error('Error tracking event in analytics service', e);
            }
        });
    }

    trackPageView(pageName: string, properties?: EventProperties): void {
        this.services.forEach(service => {
            try {
                service.trackPageView(pageName, properties);
            } catch (e) {
                console.error('Error tracking page view in analytics service', e);
            }
        });
    }

    setUserProperties(properties: Partial<AnalyticsUser>): void {
        this.services.forEach(service => {
            try {
                service.setUserProperties(properties);
            } catch (e) {
                console.error('Error setting user properties in analytics service', e);
            }
        });
    }

    incrementUserProperty(property: string, value?: number): void {
        this.services.forEach(service => {
            try {
                service.incrementUserProperty(property, value);
            } catch (e) {
                console.error('Error incrementing user property in analytics service', e);
            }
        });
    }

    reset(): void {
        this.services.forEach(service => {
            try {
                service.reset();
            } catch (e) {
                console.error('Error resetting analytics service', e);
            }
        });
    }

    optIn(): void {
        this.services.forEach(service => {
            try {
                service.optIn();
            } catch (e) {
                console.error('Error opting in to analytics service', e);
            }
        });
    }

    optOut(): void {
        this.services.forEach(service => {
            try {
                service.optOut();
            } catch (e) {
                console.error('Error opting out of analytics service', e);
            }
        });
    }

    hasOptedOut(): boolean {
        return this.services.every(service => service.hasOptedOut());
    }
}
