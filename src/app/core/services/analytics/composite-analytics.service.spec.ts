import { TestBed } from '@angular/core/testing';
import { CompositeAnalyticsService } from './composite-analytics.service';
import { MixpanelService } from './mixpanel.service';
import { GoogleTagService } from './google-tag.service';
import { AnalyticsEvent } from '../../models/analytics-events.enum';

describe('CompositeAnalyticsService', () => {
  let service: CompositeAnalyticsService;
  let mixpanelSpy: jasmine.SpyObj<MixpanelService>;
  let googleTagSpy: jasmine.SpyObj<GoogleTagService>;

  const methods = [
    'initialize', 'identify', 'track', 'trackPageView', 'setUserProperties',
    'incrementUserProperty', 'reset', 'optIn', 'optOut', 'hasOptedOut'
  ];

  beforeEach(() => {
    mixpanelSpy = jasmine.createSpyObj('MixpanelService', methods);
    googleTagSpy = jasmine.createSpyObj('GoogleTagService', methods);

    TestBed.configureTestingModule({
      providers: [
        CompositeAnalyticsService,
        { provide: MixpanelService, useValue: mixpanelSpy },
        { provide: GoogleTagService, useValue: googleTagSpy }
      ]
    });

    service = TestBed.inject(CompositeAnalyticsService);
  });

  describe('fan-out to both services (happy path)', () => {
    it('should call track on both services', () => {
      service.track(AnalyticsEvent.AUTH_LOGOUT, { foo: 'bar' });
      expect(mixpanelSpy.track).toHaveBeenCalledWith(AnalyticsEvent.AUTH_LOGOUT, { foo: 'bar' });
      expect(googleTagSpy.track).toHaveBeenCalledWith(AnalyticsEvent.AUTH_LOGOUT, { foo: 'bar' });
    });

    it('should call identify on both services', () => {
      const user = { userId: '1' };
      service.identify(user);
      expect(mixpanelSpy.identify).toHaveBeenCalledWith(user);
      expect(googleTagSpy.identify).toHaveBeenCalledWith(user);
    });

    it('should call initialize on both services', () => {
      service.initialize();
      expect(mixpanelSpy.initialize).toHaveBeenCalled();
      expect(googleTagSpy.initialize).toHaveBeenCalled();
    });
  });

  describe('fault isolation between services', () => {
    it('should still call the second service when the first throws during initialize', () => {
      mixpanelSpy.initialize.and.throwError('mixpanel down');
      service.initialize();
      expect(googleTagSpy.initialize).toHaveBeenCalled();
    });

    it('should still call the second service when the first throws during track', () => {
      mixpanelSpy.track.and.throwError('mixpanel down');
      service.track(AnalyticsEvent.AUTH_LOGOUT);
      expect(googleTagSpy.track).toHaveBeenCalledWith(AnalyticsEvent.AUTH_LOGOUT, undefined);
    });

    it('should still call the second service when the first throws during identify', () => {
      mixpanelSpy.identify.and.throwError('mixpanel down');
      const user = { userId: '1' };
      service.identify(user);
      expect(googleTagSpy.identify).toHaveBeenCalledWith(user);
    });

    it('should still call the second service when the first throws during reset', () => {
      mixpanelSpy.reset.and.throwError('mixpanel down');
      service.reset();
      expect(googleTagSpy.reset).toHaveBeenCalled();
    });
  });

  describe('hasOptedOut', () => {
    // NOTE: uses .every() — only true if ALL services report opted out. Currently unused
    // anywhere in the app (confirmed via grep), so this semantics choice has no live impact
    // today, but is worth a deliberate decision (vs. .some()) before anything relies on it —
    // see test-backfill-findings.md.
    it('should return true only when every service reports opted out', () => {
      mixpanelSpy.hasOptedOut.and.returnValue(true);
      googleTagSpy.hasOptedOut.and.returnValue(true);
      expect(service.hasOptedOut()).toBe(true);
    });

    it('should return false when only some services report opted out', () => {
      mixpanelSpy.hasOptedOut.and.returnValue(true);
      googleTagSpy.hasOptedOut.and.returnValue(false);
      expect(service.hasOptedOut()).toBe(false);
    });
  });
});
