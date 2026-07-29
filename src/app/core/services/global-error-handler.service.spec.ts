import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandler } from './global-error-handler.service';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsEvent } from '../models/analytics-events.enum';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  beforeEach(() => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['track']);

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: AnalyticsService, useValue: analyticsServiceSpy }
      ]
    });

    handler = TestBed.inject(GlobalErrorHandler);
    spyOn(console, 'error');
  });

  it('should track a real Error with its message, name, and truncated stack', () => {
    const error = new Error('something broke');
    handler.handleError(error);

    expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.ERROR_OCCURRED, jasmine.objectContaining({
      error_message: 'something broke',
      error_name: 'Error'
    }));
  });

  it('should log the original error to the console', () => {
    const error = new Error('something broke');
    handler.handleError(error);
    expect(console.error).toHaveBeenCalledWith('Global error caught:', error);
  });

  it('should not throw and should still track when a bare string is thrown', () => {
    expect(() => handler.handleError('a plain string error')).not.toThrow();
    expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.ERROR_OCCURRED, jasmine.objectContaining({
      error_message: 'a plain string error'
    }));
  });

  it('should not throw and should still track when null is thrown', () => {
    expect(() => handler.handleError(null)).not.toThrow();
    expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.ERROR_OCCURRED, jasmine.objectContaining({
      error_message: 'null'
    }));
  });

  it('should not throw and should still track when undefined is thrown', () => {
    expect(() => handler.handleError(undefined)).not.toThrow();
    expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.ERROR_OCCURRED, jasmine.objectContaining({
      error_message: 'undefined'
    }));
  });

  it('should not throw and should still track when a plain object is thrown', () => {
    expect(() => handler.handleError({ code: 500 })).not.toThrow();
    expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.ERROR_OCCURRED, jasmine.objectContaining({
      error_message: '[object Object]'
    }));
  });

  it('should not throw, and should still log the original error, even if the analytics service itself throws', () => {
    analyticsServiceSpy.track.and.throwError('analytics down');
    const error = new Error('original');

    expect(() => handler.handleError(error)).not.toThrow();
    expect(console.error).toHaveBeenCalledWith('Global error caught:', error);
  });

  it('should truncate a very long stack trace to 500 characters', () => {
    const error = new Error('boom');
    error.stack = 'x'.repeat(1000);
    handler.handleError(error);

    const call = analyticsServiceSpy.track.calls.mostRecent();
    expect((call.args[1] as { error_stack: string }).error_stack).toHaveSize(500);
  });
});
