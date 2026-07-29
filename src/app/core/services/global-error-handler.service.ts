import { ErrorHandler, Injectable } from '@angular/core';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsEvent } from '../models/analytics-events.enum';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private analyticsService: AnalyticsService) {}

  handleError(error: unknown): void {
    // JavaScript allows throwing any value (throw null, throw 'a string', a rejected
    // promise with a non-Error reason, etc.) — normalize before reading Error-only fields,
    // since this handler is the app's last line of defense and must not itself crash.
    const normalizedError = error instanceof Error ? error : new Error(String(error));

    // Track the error in analytics — guarded so a broken analytics provider can't prevent
    // the console log below (the more fundamental fallback) from running.
    try {
      this.analyticsService.track(AnalyticsEvent.ERROR_OCCURRED, {
        error_message: normalizedError.message,
        error_name: normalizedError.name,
        error_stack: normalizedError.stack?.substring(0, 500), // Limit stack trace length
        timestamp: new Date().toISOString()
      });
    } catch (trackingError) {
      console.error('Failed to track error in analytics:', trackingError);
    }

    // Log to console for debugging
    console.error('Global error caught:', error);
  }
}
