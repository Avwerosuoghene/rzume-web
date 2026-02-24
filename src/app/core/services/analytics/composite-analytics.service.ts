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
        this.services.forEach(service => service.identify(user));
    }

    track(event: AnalyticsEvent | string, properties?: EventProperties): void {
        this.services.forEach(service => service.track(event, properties));
    }

    trackPageView(pageName: string, properties?: EventProperties): void {
        this.services.forEach(service => service.trackPageView(pageName, properties));
    }

    setUserProperties(properties: Partial<AnalyticsUser>): void {
        this.services.forEach(service => service.setUserProperties(properties));
    }

    incrementUserProperty(property: string, value?: number): void {
        this.services.forEach(service => service.incrementUserProperty(property, value));
    }

    reset(): void {
        this.services.forEach(service => service.reset());
    }

    optIn(): void {
        this.services.forEach(service => service.optIn());
    }

    optOut(): void {
        this.services.forEach(service => service.optOut());
    }

    hasOptedOut(): boolean {
        return this.services.every(service => service.hasOptedOut());
    }
}
