import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigService]
    });

    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('before config is loaded', () => {
    it('should report isConfigLoaded as false', () => {
      expect(service.isConfigLoaded()).toBe(false);
    });

    it('should throw when reading apiUrls', () => {
      expect(() => service.apiUrls).toThrowError('Config not loaded');
    });

    it('should throw when reading featureFlags', () => {
      expect(() => service.featureFlags).toThrowError('Config not loaded');
    });

    it('should throw when reading mixpanelToken', () => {
      expect(() => service.mixpanelToken).toThrowError('Config not loaded');
    });

    it('should throw when reading googleTagId', () => {
      expect(() => service.googleTagId).toThrowError('Config not loaded');
    });

    // NOTE: inconsistent with apiUrls/featureFlags/mixpanelToken/googleTagId above — these three
    // gracefully default instead of throwing. See test-backfill-findings.md #22.
    it('should default isAnalyticsEnabled to false rather than throwing', () => {
      expect(service.isAnalyticsEnabled).toBe(false);
    });

    it('should default linkedInPartnerId to an empty string rather than throwing', () => {
      expect(service.linkedInPartnerId).toBe('');
    });

    it('should default landingPageUrl to the fallback constant rather than throwing', () => {
      expect(service.landingPageUrl).toBe('https://rzume.site/about');
    });
  });

  describe('loadConfig - success', () => {
    it('should load config and expose it via the getters', async () => {
      const loadPromise = service.loadConfig();
      httpMock.expectOne('/assets/config/config.json').flush({
        apiUrls: { backend: 'https://api.example.com' },
        featureFlags: { enableProfileManagement: true },
        analytics: { mixpanelToken: 'mp-token', googleTagId: 'gt-id', enabled: true, linkedInPartnerId: 'li-1' },
        landingPageUrl: 'https://custom.example.com'
      });
      await loadPromise;

      expect(service.isConfigLoaded()).toBe(true);
      expect(service.apiUrls.backend).toBe('https://api.example.com');
      expect(service.mixpanelToken).toBe('mp-token');
      expect(service.isAnalyticsEnabled).toBe(true);
      expect(service.landingPageUrl).toBe('https://custom.example.com');
    });

    it('should only make one HTTP request even if called multiple times concurrently', async () => {
      const p1 = service.loadConfig();
      const p2 = service.loadConfig();

      httpMock.expectOne('/assets/config/config.json').flush({ apiUrls: {} });
      await Promise.all([p1, p2]);

      httpMock.verify();
    });
  });

  describe('loadConfig - failure (documents a real resilience gap, see findings log #22)', () => {
    it('should swallow the error, log it, and leave config permanently unloaded — no retry on a later call', async () => {
      spyOn(console, 'error');

      const firstAttempt = service.loadConfig();
      httpMock.expectOne('/assets/config/config.json').error(new ProgressEvent('error'));
      await firstAttempt;

      expect(service.isConfigLoaded()).toBe(false);
      expect(() => service.apiUrls).toThrowError('Config not loaded');

      // Calling loadConfig() again does NOT retry the request — it returns the same
      // already-resolved (but failed) promise. This is the real gap: a transient failure
      // during initial load leaves the app permanently unable to load config afterward.
      await service.loadConfig();
      httpMock.expectNone('/assets/config/config.json');
      expect(service.isConfigLoaded()).toBe(false);
    });
  });

  describe('waitForConfig', () => {
    it('should resolve once loadConfig completes', async () => {
      const loadPromise = service.loadConfig();
      const waitPromise = service.waitForConfig();

      httpMock.expectOne('/assets/config/config.json').flush({ apiUrls: {} });
      await Promise.all([loadPromise, waitPromise]);

      expect(service.isConfigLoaded()).toBe(true);
    });

    it('should resolve immediately if loadConfig was never called', async () => {
      await expectAsync(service.waitForConfig()).toBeResolved();
    });
  });
});
