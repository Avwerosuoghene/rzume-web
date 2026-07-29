import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { GoogleTagService } from './google-tag.service';
import { ConfigService } from '../config.service';
import { AnalyticsUserContextService } from '../analytics-user-context.service';
import { AnalyticsEvent } from '../../models/analytics-events.enum';

describe('GoogleTagService', () => {
  let service: GoogleTagService;
  let configServiceSpy: jasmine.SpyObj<ConfigService>;
  let userContextServiceSpy: jasmine.SpyObj<AnalyticsUserContextService>;
  let gtagSpy: jasmine.Spy;

  beforeEach(() => {
    configServiceSpy = jasmine.createSpyObj('ConfigService', [], {
      googleTagId: 'GT-TEST123',
      isAnalyticsEnabled: true
    });
    userContextServiceSpy = jasmine.createSpyObj('AnalyticsUserContextService', ['enrichEventProperties']);
    userContextServiceSpy.enrichEventProperties.and.callFake((props?: object) => ({ ...props, enriched: true }));

    gtagSpy = jasmine.createSpy('gtag');
    (globalThis as unknown as { gtag: jasmine.Spy }).gtag = gtagSpy;

    TestBed.configureTestingModule({
      providers: [
        GoogleTagService,
        { provide: ConfigService, useValue: configServiceSpy },
        { provide: AnalyticsUserContextService, useValue: userContextServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(GoogleTagService);
  });

  afterEach(() => {
    (window as unknown as { gtag?: jasmine.Spy }).gtag = undefined;
    document.querySelectorAll('script').forEach(s => {
      if (s.src.includes('googletagmanager')) s.remove();
    });
  });

  describe('initialize', () => {
    it('should inject the gtag script when enabled and a tag id is configured', () => {
      service.initialize();
      const scripts = Array.from(document.head.querySelectorAll('script'));
      expect(scripts.some(s => s.src.includes('GT-TEST123'))).toBe(true);
    });

    it('should not inject a script when analytics is disabled', () => {
      Object.defineProperty(configServiceSpy, 'isAnalyticsEnabled', { get: () => false });
      spyOn(console, 'warn');

      service.initialize();

      const scripts = Array.from(document.head.querySelectorAll('script'));
      expect(scripts.some(s => s.src.includes('GT-TEST123'))).toBe(false);
    });

    it('should not re-initialize on a second call', () => {
      service.initialize();
      const scriptCountAfterFirst = document.head.querySelectorAll('script').length;
      service.initialize();
      expect(document.head.querySelectorAll('script')).toHaveSize(scriptCountAfterFirst);
    });
  });

  describe('methods no-op before initialize', () => {
    it('should not call gtag for track before initialize', () => {
      service.track(AnalyticsEvent.AUTH_LOGOUT);
      expect(gtagSpy).not.toHaveBeenCalled();
    });
  });

  describe('after initialize', () => {
    beforeEach(() => {
      // Don't call the real initialize() here — it injects a real inline <script> that
      // defines its own `function gtag(){...}` in the global scope, which executes
      // immediately on DOM insertion and clobbers the gtagSpy set up above. Set the
      // private flag directly instead, so these tests observe calls to our spy.
      (service as unknown as { initialized: boolean }).initialized = true;
    });

    it('should call gtag with an enriched event for track', () => {
      service.track(AnalyticsEvent.AUTH_LOGOUT, { foo: 'bar' });
      expect(gtagSpy).toHaveBeenCalledWith('event', AnalyticsEvent.AUTH_LOGOUT, jasmine.objectContaining({ foo: 'bar', enriched: true }));
    });

    it('should call gtag with page_view for trackPageView', () => {
      service.trackPageView('dashboard');
      expect(gtagSpy).toHaveBeenCalledWith('event', 'page_view', jasmine.objectContaining({ page_title: 'dashboard' }));
    });

    it('should set user properties and user_id for identify', () => {
      service.identify({ userId: 'u1', email: 'user@example.com', subscriptionStatus: 'free' });
      expect(gtagSpy).toHaveBeenCalledWith('set', 'user_properties', { email: 'user@example.com', subscription_status: 'free' });
      expect(gtagSpy).toHaveBeenCalledWith('config', 'GT-TEST123', { user_id: 'u1' });
    });

    it('should not throw when reset is called and gtag itself throws', () => {
      gtagSpy.and.throwError('gtag not available');
      spyOn(console, 'error');
      expect(() => service.reset()).not.toThrow();
    });

    it('should reset user_id and properties to undefined', () => {
      service.reset();
      expect(gtagSpy).toHaveBeenCalledWith('config', 'GT-TEST123', { user_id: undefined });
      expect(gtagSpy).toHaveBeenCalledWith('set', 'user_properties', { email: undefined, subscription_status: undefined });
    });

    it('should track an increment as a regular event since gtag has no native increment', () => {
      service.incrementUserProperty('applications', 3);
      expect(gtagSpy).toHaveBeenCalledWith('event', 'increment_property', jasmine.objectContaining({ property: 'applications', value: 3 }));
    });

    it('should not throw when gtag itself throws during track', () => {
      gtagSpy.and.throwError('gtag not available');
      spyOn(console, 'error');
      expect(() => service.track(AnalyticsEvent.AUTH_LOGOUT)).not.toThrow();
    });
  });

  describe('opt in/out and hasOptedOut', () => {
    it('should always report not opted out (no per-provider opt-out implemented)', () => {
      expect(service.hasOptedOut()).toBe(false);
    });

    it('should not throw when optIn/optOut are called (currently no-ops)', () => {
      expect(() => { service.optIn(); service.optOut(); }).not.toThrow();
    });
  });
});
