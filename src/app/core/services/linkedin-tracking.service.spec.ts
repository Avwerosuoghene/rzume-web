import { TestBed } from '@angular/core/testing';
import { LinkedInTrackingService, LinkedInConversionEvent } from './linkedin-tracking.service';
import { ConfigService } from './config.service';

describe('LinkedInTrackingService', () => {
  let service: LinkedInTrackingService;
  let configServiceMock: jasmine.SpyObj<ConfigService>;

  beforeEach(() => {
    configServiceMock = jasmine.createSpyObj('ConfigService', [], {
      isAnalyticsEnabled: true,
      linkedInPartnerId: '98462'
    });

    TestBed.configureTestingModule({
      providers: [
        LinkedInTrackingService,
        { provide: ConfigService, useValue: configServiceMock }
      ]
    });

    service = TestBed.inject(LinkedInTrackingService);
  });

  afterEach(() => {
    delete (window as any).lintrk;
    delete (window as any)._linkedin_data_partner_ids;
  });

  describe('Initialization', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize when LinkedIn script is loaded', async () => {
      (window as any).lintrk = jasmine.createSpy('lintrk');

      const isReady = await service.isReady();
      expect(isReady).toBe(true);
    });

    it('should timeout after max attempts if script never loads', async () => {
      const isReady = await service.isReady();
      expect(isReady).toBe(false);
    });

    it('should return partner ID from config', () => {
      expect(service.getPartnerId()).toBe('98462');
    });

    it('should return empty string if config not loaded', () => {
      Object.defineProperty(configServiceMock, 'linkedInPartnerId', {
        get: () => { throw new Error('Config not loaded'); }
      });
      
      expect(service.getPartnerId()).toBe('');
    });

    it('should return initialization status synchronously', () => {
      const status = service.getInitializationStatus();
      expect(typeof status).toBe('boolean');
    });
  });

  describe('Configuration Integration', () => {
    it('should not track when analytics is disabled', async () => {
      Object.defineProperty(configServiceMock, 'isAnalyticsEnabled', {
        get: () => false
      });

      (window as any).lintrk = jasmine.createSpy('lintrk');
      await service.isReady();

      await service.trackSignup();
      expect((window as any).lintrk).not.toHaveBeenCalled();
    });

    it('should track when analytics is enabled', async () => {
      Object.defineProperty(configServiceMock, 'isAnalyticsEnabled', {
        get: () => true
      });

      (window as any).lintrk = jasmine.createSpy('lintrk');
      await service.isReady();

      await service.trackSignup();
      expect((window as any).lintrk).toHaveBeenCalled();
    });

    it('should handle config service errors gracefully', async () => {
      Object.defineProperty(configServiceMock, 'isAnalyticsEnabled', {
        get: () => { throw new Error('Config not loaded'); }
      });

      (window as any).lintrk = jasmine.createSpy('lintrk');
      await service.isReady();

      await service.trackSignup();
      expect((window as any).lintrk).not.toHaveBeenCalled();
    });
  });

  describe('trackConversion', () => {
    beforeEach(async () => {
      (window as any).lintrk = jasmine.createSpy('lintrk');
      await service.isReady();
    });

    it('should track conversion with conversion ID', async () => {
      const conversionId = 12345;
      const data: LinkedInConversionEvent = {
        value: 100,
        currency: 'USD'
      };

      await service.trackConversion(conversionId, data);

      expect((window as any).lintrk).toHaveBeenCalledWith('track', {
        conversion_id: conversionId,
        value: 100,
        currency: 'USD'
      });
    });

    it('should track conversion without conversion ID', async () => {
      const data: LinkedInConversionEvent = {
        value: 50,
        currency: 'EUR'
      };

      await service.trackConversion(undefined, data);

      expect((window as any).lintrk).toHaveBeenCalledWith('track', {
        value: 50,
        currency: 'EUR'
      });
    });

    it('should not track if LinkedIn script is not loaded', async () => {
      delete (window as any).lintrk;

      await service.trackConversion(undefined, { value: 100 });

      // Should not throw error, just silently fail
      expect(true).toBe(true);
    });

    it('should handle tracking errors gracefully', async () => {
      (window as any).lintrk = jasmine.createSpy('lintrk').and.throwError('Tracking error');

      await service.trackConversion(undefined, { value: 100 });

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('trackSignup', () => {
    beforeEach(async () => {
      (window as any).lintrk = jasmine.createSpy('lintrk');
      await service.isReady();
    });

    it('should track signup without value', async () => {
      await service.trackSignup();

      expect((window as any).lintrk).toHaveBeenCalledWith('track', {
        value: undefined,
        currency: 'USD'
      });
    });

    it('should track signup with value', async () => {
      await service.trackSignup(100);

      expect((window as any).lintrk).toHaveBeenCalledWith('track', {
        value: 100,
        currency: 'USD'
      });
    });
  });

  describe('trackPurchase', () => {
    beforeEach(async () => {
      (window as any).lintrk = jasmine.createSpy('lintrk');
      await service.isReady();
    });

    it('should track purchase with default currency', async () => {
      await service.trackPurchase(99.99);

      expect((window as any).lintrk).toHaveBeenCalledWith('track', {
        value: 99.99,
        currency: 'USD'
      });
    });

    it('should track purchase with custom currency', async () => {
      await service.trackPurchase(50, 'EUR');

      expect((window as any).lintrk).toHaveBeenCalledWith('track', {
        value: 50,
        currency: 'EUR'
      });
    });

    it('should not track purchase with zero value', async () => {
      await service.trackPurchase(0);

      expect((window as any).lintrk).not.toHaveBeenCalled();
    });

    it('should not track purchase with negative value', async () => {
      await service.trackPurchase(-10);

      expect((window as any).lintrk).not.toHaveBeenCalled();
    });
  });

  describe('trackCustomEvent', () => {
    beforeEach(async () => {
      (window as any).lintrk = jasmine.createSpy('lintrk');
      await service.isReady();
    });

    it('should track custom event with all properties', async () => {
      const eventData: LinkedInConversionEvent = {
        conversion_id: 123,
        value: 200,
        currency: 'GBP'
      };

      await service.trackCustomEvent(eventData);

      expect((window as any).lintrk).toHaveBeenCalledWith('track', eventData);
    });

    it('should track custom event with minimal properties', async () => {
      const eventData: LinkedInConversionEvent = {
        value: 10
      };

      await service.trackCustomEvent(eventData);

      expect((window as any).lintrk).toHaveBeenCalledWith('track', eventData);
    });
  });

  describe('Silent Failure Behavior', () => {
    it('should fail silently when tracking is disabled', async () => {
      Object.defineProperty(configServiceMock, 'isAnalyticsEnabled', {
        get: () => false
      });

      (window as any).lintrk = jasmine.createSpy('lintrk');
      await service.isReady();

      await service.trackSignup();
      expect((window as any).lintrk).not.toHaveBeenCalled();
    });

    it('should fail silently when script not loaded', async () => {
      delete (window as any).lintrk;

      await service.trackConversion(undefined, { value: 100 });
      
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('Async Initialization', () => {
    it('should wait for initialization before tracking', async () => {
      const lintrk = jasmine.createSpy('lintrk');
      
      // Simulate delayed script loading
      setTimeout(() => {
        (window as any).lintrk = lintrk;
      }, 50);

      await service.trackSignup();

      expect(lintrk).toHaveBeenCalled();
    });

    it('should handle multiple concurrent tracking calls', async () => {
      (window as any).lintrk = jasmine.createSpy('lintrk');
      await service.isReady();

      const promises = [
        service.trackSignup(),
        service.trackPurchase(100),
        service.trackCustomEvent({ value: 50 })
      ];

      await Promise.all(promises);

      expect((window as any).lintrk).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle window undefined gracefully', async () => {
      const originalWindow = (globalThis as any).window;
      (globalThis as any).window = undefined;

      await service.trackSignup();

      // Should not throw error
      expect(true).toBe(true);

      (globalThis as any).window = originalWindow;
    });

    it('should handle lintrk function errors', async () => {
      (window as any).lintrk = () => {
        throw new Error('Tracking failed');
      };
      await service.isReady();

      await service.trackSignup();

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('Type Safety', () => {
    beforeEach(async () => {
      (window as any).lintrk = jasmine.createSpy('lintrk');
      await service.isReady();
    });

    it('should accept valid conversion event data', async () => {
      const validData: LinkedInConversionEvent = {
        conversion_id: 123,
        value: 100,
        currency: 'USD'
      };

      await service.trackCustomEvent(validData);

      expect((window as any).lintrk).toHaveBeenCalled();
    });

    it('should handle partial conversion event data', async () => {
      const partialData: LinkedInConversionEvent = {
        value: 50
      };

      await service.trackCustomEvent(partialData);

      expect((window as any).lintrk).toHaveBeenCalled();
    });
  });
});
