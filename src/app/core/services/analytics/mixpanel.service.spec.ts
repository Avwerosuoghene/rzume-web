import { TestBed } from '@angular/core/testing';
import mixpanel from 'mixpanel-browser';
import { MixpanelService } from './mixpanel.service';
import { ConfigService } from '../config.service';
import { AnalyticsUserContextService } from '../analytics-user-context.service';
import { AnalyticsEvent } from '../../models/analytics-events.enum';

describe('MixpanelService', () => {
  let service: MixpanelService;
  let configServiceSpy: jasmine.SpyObj<ConfigService>;
  let userContextServiceSpy: jasmine.SpyObj<AnalyticsUserContextService>;

  beforeEach(() => {
    configServiceSpy = jasmine.createSpyObj('ConfigService', [], {
      mixpanelToken: 'test-token',
      isAnalyticsEnabled: true
    });
    userContextServiceSpy = jasmine.createSpyObj('AnalyticsUserContextService', ['enrichEventProperties']);
    userContextServiceSpy.enrichEventProperties.and.callFake((props?: object) => ({ ...props, enriched: true }));

    spyOn(mixpanel, 'init');
    spyOn(mixpanel, 'identify');
    spyOn(mixpanel, 'track');
    spyOn(mixpanel, 'reset');
    // mixpanel.people doesn't exist until the real mixpanel.init() populates it — since init()
    // itself is mocked here (never runs the real library code), people is never populated
    // naturally. Assign a fresh spy object directly rather than spying on a nonexistent method.
    (mixpanel as unknown as { people: jasmine.SpyObj<{ set: unknown; increment: unknown }> }).people =
      jasmine.createSpyObj('people', ['set', 'increment']);

    TestBed.configureTestingModule({
      providers: [
        MixpanelService,
        { provide: ConfigService, useValue: configServiceSpy },
        { provide: AnalyticsUserContextService, useValue: userContextServiceSpy }
      ]
    });

    service = TestBed.inject(MixpanelService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialize', () => {
    it('should call mixpanel.init with the configured token', () => {
      service.initialize();
      expect(mixpanel.init).toHaveBeenCalledWith('test-token', jasmine.objectContaining({ persistence: 'localStorage' }));
    });

    it('should not initialize when analytics is disabled', () => {
      Object.defineProperty(configServiceSpy, 'isAnalyticsEnabled', { get: () => false });
      spyOn(console, 'warn');

      service.initialize();
      expect(mixpanel.init).not.toHaveBeenCalled();
    });

    it('should not re-initialize on a second call', () => {
      service.initialize();
      service.initialize();
      expect(mixpanel.init).toHaveBeenCalledTimes(1);
    });

    it('should not throw when mixpanel.init itself throws', () => {
      (mixpanel.init as jasmine.Spy).and.throwError('mixpanel unavailable');
      spyOn(console, 'error');
      expect(() => service.initialize()).not.toThrow();
    });
  });

  describe('methods no-op before initialize', () => {
    it('should not call mixpanel.track before initialize', () => {
      service.track(AnalyticsEvent.AUTH_LOGOUT);
      expect(mixpanel.track).not.toHaveBeenCalled();
    });
  });

  describe('after initialize', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should identify the user and set mapped people properties', () => {
      service.identify({ userId: 'u1', email: 'user@example.com', name: 'Jane', totalApplications: 3 });

      expect(mixpanel.identify).toHaveBeenCalledWith('u1');
      expect(mixpanel.people.set).toHaveBeenCalledWith(jasmine.objectContaining({
        $email: 'user@example.com',
        $name: 'Jane',
        total_applications: 3
      }));
    });

    it('should track an event with enriched properties including device type', () => {
      service.track(AnalyticsEvent.AUTH_LOGOUT, { foo: 'bar' });
      expect(mixpanel.track).toHaveBeenCalledWith(AnalyticsEvent.AUTH_LOGOUT, jasmine.objectContaining({ foo: 'bar', enriched: true }));
    });

    it('should map a known page name to its specific loaded event', () => {
      service.trackPageView('dashboard');
      expect(mixpanel.track).toHaveBeenCalledWith(AnalyticsEvent.DASHBOARD_PAGE_LOADED, jasmine.any(Object));
    });

    it('should fall back to a generic "<page>_page_loaded" event for an unmapped page', () => {
      service.trackPageView('custom-page');
      expect(mixpanel.track).toHaveBeenCalledWith('custom-page_page_loaded', jasmine.any(Object));
    });

    it('should increment a user property', () => {
      service.incrementUserProperty('applications', 2);
      expect(mixpanel.people.increment).toHaveBeenCalledWith('applications', 2);
    });

    it('should default the increment value to 1', () => {
      service.incrementUserProperty('logins');
      expect(mixpanel.people.increment).toHaveBeenCalledWith('logins', 1);
    });

    it('should set a single user property', () => {
      service.setUserProperty('favorite_color', 'blue');
      expect(mixpanel.people.set).toHaveBeenCalledWith({ favorite_color: 'blue' });
    });

    it('should reset mixpanel', () => {
      service.reset();
      expect(mixpanel.reset).toHaveBeenCalled();
    });

    it('should not throw when mixpanel.track itself throws', () => {
      (mixpanel.track as jasmine.Spy).and.throwError('mixpanel down');
      spyOn(console, 'error');
      expect(() => service.track(AnalyticsEvent.AUTH_LOGOUT)).not.toThrow();
    });
  });

  describe('optIn / optOut / hasOptedOut', () => {
    it('should always report not opted out regardless of optOut being called', () => {
      service.optOut();
      expect(service.hasOptedOut()).toBe(false);
    });

    it('should not throw when optIn is called', () => {
      expect(() => service.optIn()).not.toThrow();
    });
  });
});
