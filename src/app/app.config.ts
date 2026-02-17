import { APP_INITIALIZER, ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';

import { routes } from './core/models/constants/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { provideClientHydration } from '@angular/platform-browser';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { AnalyticsInterceptor } from './core/interceptors/analytics.interceptor';
import { ConfigService } from './core/services/config.service';
import { SelectivePreloadStrategy } from './core/strategies/selective-preload.strategy';
import { AnalyticsService } from './core/services/analytics/analytics.service';
import { MixpanelService } from './core/services/analytics/mixpanel.service';
import { GlobalErrorHandler } from './core/services/global-error-handler.service';
import { AnalyticsTrackingService } from './core/services/analytics-tracking.service';

// Initialize analytics after config is loaded
function initializeAnalytics(analyticsService: AnalyticsService, configService: ConfigService) {
  return () => {
    return configService.waitForConfig().then(() => {
      analyticsService.initialize();
    });
  };
}

// Initialize analytics tracking after router is available
function initializeAnalyticsTracking(analyticsTrackingService: AnalyticsTrackingService, analyticsService: AnalyticsService) {
  return () => {
    // Wait a bit for analytics to be initialized
    setTimeout(() => {
      analyticsTrackingService.ngOnInit();
    }, 100);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withPreloading(SelectivePreloadStrategy)), 
    provideAnimationsAsync(), 
    provideHttpClient(withInterceptorsFromDi()), 
    provideClientHydration(), 
    provideNativeDateAdapter(),
  {
    provide: 'SocialAuthServiceConfig',
    useFactory: (configService: ConfigService) => {
      return {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(configService.apiUrls.googleAuth, {})
          },
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig;
    },
    deps: [ConfigService]
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AnalyticsInterceptor,
    multi: true,
  },
  {
    provide: APP_INITIALIZER,
    useFactory: (configService: ConfigService) => () => configService.loadConfig(),
    deps: [ConfigService],
    multi: true
  },
  {
    provide: APP_INITIALIZER,
    useFactory: initializeAnalytics,
    deps: [AnalyticsService, ConfigService],
    multi: true
  },
  {
    provide: APP_INITIALIZER,
    useFactory: initializeAnalyticsTracking,
    deps: [AnalyticsTrackingService, AnalyticsService],
    multi: true
  },
  {
    provide: AnalyticsService,
    useClass: MixpanelService
  },
  {
    provide: ErrorHandler,
    useClass: GlobalErrorHandler
  }

  ]
};
