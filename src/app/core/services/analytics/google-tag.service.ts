import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsUser, EventProperties } from '../../models/analytics.models';
import { AnalyticsEvent } from '../../models/analytics-events.enum';
import { ConfigService } from '../config.service';
import { AnalyticsUserContextService } from '../analytics-user-context.service';

declare var gtag: Function;

@Injectable({
    providedIn: 'root'
})
export class GoogleTagService extends AnalyticsService {
    private initialized = false;

    constructor(
        private configService: ConfigService,
        private userContextService: AnalyticsUserContextService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        super();
    }

    initialize(): void {
        if (this.initialized || !isPlatformBrowser(this.platformId)) {
            return;
        }

        try {
            const gTagId = this.configService.googleTagId;
            const isEnabled = this.configService.isAnalyticsEnabled;

            if (!gTagId || !isEnabled) {
                console.warn('Google Tag: Analytics disabled or Tag ID not configured');
                return;
            }

            this.loadGTagScript(gTagId);
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize Google Tag:', error);
        }
    }

    private loadGTagScript(gTagId: string): void {
        // Add external script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gTagId}`;
        document.head.appendChild(script);

        // Add inline script
        const inlineScript = document.createElement('script');
        inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gTagId}', { 'send_page_view': false });
    `;
        document.head.appendChild(inlineScript);
    }

    identify(user: AnalyticsUser): void {
        if (!this.initialized || !isPlatformBrowser(this.platformId)) {
            return;
        }

        try {
            const gTagId = this.configService.googleTagId;

            const userProperties: any = {};
            if (user.email) userProperties.email = user.email;
            if (user.subscriptionStatus) userProperties.subscription_status = user.subscriptionStatus;

            gtag('set', 'user_properties', userProperties);

            // Also set the user ID directly if supported
            gtag('config', gTagId, {
                'user_id': user.userId
            });
        } catch (error) {
            console.error('Google Tag identify error:', error);
        }
    }

    track(event: AnalyticsEvent | string, properties?: EventProperties): void {
        if (!this.initialized || !isPlatformBrowser(this.platformId)) {
            return;
        }

        try {
            // Enrich properties with user context similar to Mixpanel
            const enrichedProperties = this.userContextService.enrichEventProperties(properties);
            gtag('event', event, enrichedProperties);
        } catch (error) {
            console.error('Google Tag track error:', error);
        }
    }

    trackPageView(pageName: string, properties?: EventProperties): void {
        if (!this.initialized || !isPlatformBrowser(this.platformId)) {
            return;
        }

        try {
            const enrichedProperties = this.userContextService.enrichEventProperties({
                page_title: pageName,
                page_location: window.location.href,
                page_path: window.location.pathname,
                ...properties
            });

            gtag('event', 'page_view', enrichedProperties);
        } catch (error) {
            console.error('Google Tag trackPageView error:', error);
        }
    }

    setUserProperties(properties: Partial<AnalyticsUser>): void {
        if (!this.initialized || !isPlatformBrowser(this.platformId)) {
            return;
        }

        try {
            const userProps: any = {};
            if (properties.email) userProps.email = properties.email;
            if (properties.subscriptionStatus) userProps.subscription_status = properties.subscriptionStatus;

            gtag('set', 'user_properties', userProps);
        } catch (error) {
            console.error('Google Tag setUserProperties error:', error);
        }
    }

    incrementUserProperty(property: string, value: number = 1): void {
        if (!this.initialized || !isPlatformBrowser(this.platformId)) {
            return;
        }

        // Google Tag doesn't have a direct "increment" like Mixpanel
        this.track('increment_property', { property, value });
    }

    reset(): void {
        if (!this.initialized || !isPlatformBrowser(this.platformId)) {
            return;
        }

        // Resetting user_id to undefined
        const gTagId = this.configService.googleTagId;

        gtag('config', gTagId, {
            'user_id': undefined
        });

        gtag('set', 'user_properties', {
            'email': undefined,
            'subscription_status': undefined
        });
    }

    optIn(): void {
        // Analytics is generally handled by enabled flag in config
    }

    optOut(): void {
        // Analytics is generally handled by enabled flag in config
    }

    hasOptedOut(): boolean {
        return false;
    }
}
