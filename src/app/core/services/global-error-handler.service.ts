import { ErrorHandler, Injectable } from '@angular/core';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsEvent } from '../models/analytics-events.enum';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private analyticsService: AnalyticsService) {}

  handleError(error: Error): void {
    // Track the error in analytics
    this.analyticsService.track(AnalyticsEvent.ERROR_OCCURRED, {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack?.substring(0, 500), // Limit stack trace length
      timestamp: new Date().toISOString()
    });

    // Log to console for debugging
    console.error('Global error caught:', error);
  }
}
