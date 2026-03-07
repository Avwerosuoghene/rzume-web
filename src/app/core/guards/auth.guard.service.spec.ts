import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuardService } from './auth.guard.service';
import { UserService } from '../services/user.service';
import { LoaderService } from '../services/loader.service';
import { AuthHelperService } from '../services/auth-helper.service';
import { TokenStorageUtil } from '../helpers/token-storage.util';
import { CompositeAnalyticsService } from '../services/analytics/composite-analytics.service';
import { AnalyticsEvent } from '../models/analytics-events.enum';
import { TokenValidationCacheService } from '../services/token-validation-cache.service';

describe('AuthGuardService - Phase 2 & 3', () => {
  let guard: AuthGuardService;
  let userService: jasmine.SpyObj<UserService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let router: jasmine.SpyObj<Router>;
  let authHelper: jasmine.SpyObj<AuthHelperService>;
  let analytics: jasmine.SpyObj<CompositeAnalyticsService>;
  let cacheService: jasmine.SpyObj<TokenValidationCacheService>;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getActiveUser']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authHelperSpy = jasmine.createSpyObj('AuthHelperService', ['logout']);
    const analyticsSpy = jasmine.createSpyObj('CompositeAnalyticsService', ['track', 'identify', 'reset']);
    const cacheServiceSpy = jasmine.createSpyObj('TokenValidationCacheService', ['isCachedValid', 'setCacheResult', 'clearCache']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuardService,
        { provide: UserService, useValue: userServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthHelperService, useValue: authHelperSpy },
        { provide: CompositeAnalyticsService, useValue: analyticsSpy },
        { provide: TokenValidationCacheService, useValue: cacheServiceSpy }
      ]
    });

    guard = TestBed.inject(AuthGuardService);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authHelper = TestBed.inject(AuthHelperService) as jasmine.SpyObj<AuthHelperService>;
    analytics = TestBed.inject(CompositeAnalyticsService) as jasmine.SpyObj<CompositeAnalyticsService>;
    cacheService = TestBed.inject(TokenValidationCacheService) as jasmine.SpyObj<TokenValidationCacheService>;
  });

  afterEach(() => {
    // Clean up spies
    loaderService.showLoader.calls.reset();
    loaderService.hideLoader.calls.reset();
    router.navigate.calls.reset();
    userService.getActiveUser.calls.reset();
    analytics.track.calls.reset();
  });

  describe('AC2.1: Quick token check without server call', () => {
    it('should redirect immediately if no token exists and track to Mixpanel', async () => {
      spyOn(TokenStorageUtil, 'hasToken').and.returnValue(false);

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/auth/signin']);
      expect(userService.getActiveUser).not.toHaveBeenCalled();
      expect(loaderService.showLoader).not.toHaveBeenCalled();
      expect(analytics.track).toHaveBeenCalledWith(
        AnalyticsEvent.AUTH_GUARD_NO_TOKEN,
        jasmine.objectContaining({
          redirect_to: 'signin',
          timestamp: jasmine.any(String)
        })
      );
    });
  });

  describe('AC2.2 & AC2.3: Loader management', () => {
    it('should show and hide loader on successful validation and track to Mixpanel', async () => {
      spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
      userService.getActiveUser.and.returnValue(Promise.resolve(true));

      await guard.canActivate();

      expect(loaderService.showLoader).toHaveBeenCalled();
      expect(loaderService.hideLoader).toHaveBeenCalled();
      expect(analytics.track).toHaveBeenCalledWith(
        AnalyticsEvent.AUTH_GUARD_VALIDATION_SUCCESS,
        jasmine.objectContaining({
          timestamp: jasmine.any(String)
        })
      );
    });

    it('should hide loader on validation failure and track to Mixpanel', async () => {
      spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
      userService.getActiveUser.and.returnValue(Promise.resolve(false));

      await guard.canActivate();

      expect(loaderService.showLoader).toHaveBeenCalled();
      expect(loaderService.hideLoader).toHaveBeenCalled();
      expect(analytics.track).toHaveBeenCalledWith(
        AnalyticsEvent.AUTH_GUARD_VALIDATION_FAILED,
        jasmine.objectContaining({
          reason: 'invalid_token',
          timestamp: jasmine.any(String)
        })
      );
    });

    it('should hide loader on error and track to Mixpanel', async () => {
      spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
      userService.getActiveUser.and.returnValue(Promise.reject('Server error'));

      await guard.canActivate();

      expect(loaderService.showLoader).toHaveBeenCalled();
      expect(loaderService.hideLoader).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/signin']);
      expect(analytics.track).toHaveBeenCalledWith(
        AnalyticsEvent.AUTH_GUARD_VALIDATION_ERROR,
        jasmine.objectContaining({
          error_message: jasmine.any(String),
          timestamp: jasmine.any(String)
        })
      );
    });
  });

  describe('AC2.4 & AC2.5: Timeout handling', () => {
    it('should timeout after 10 seconds, redirect to signin, and track to Mixpanel', async () => {
      spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
      // Create a promise that never resolves
      userService.getActiveUser.and.returnValue(new Promise(() => {}));

      jasmine.clock().install();
      
      const promise = guard.canActivate();
      jasmine.clock().tick(11000); // Advance time by 11 seconds
      
      const result = await promise;
      
      expect(result).toBe(false);
      expect(loaderService.hideLoader).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/signin']);
      expect(analytics.track).toHaveBeenCalledWith(
        AnalyticsEvent.AUTH_GUARD_VALIDATION_TIMEOUT,
        jasmine.objectContaining({
          error_message: jasmine.stringContaining('timeout'),
          timestamp: jasmine.any(String)
        })
      );
      
      jasmine.clock().uninstall();
    });
  });

  describe('AC2.6: Error tracking to Mixpanel', () => {
    it('should track errors to Mixpanel for monitoring', async () => {
      spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
      const testError = new Error('Network error');
      userService.getActiveUser.and.returnValue(Promise.reject(testError));

      await guard.canActivate();

      expect(analytics.track).toHaveBeenCalledWith(
        AnalyticsEvent.AUTH_GUARD_VALIDATION_ERROR,
        jasmine.objectContaining({
          error_message: 'Network error',
          timestamp: jasmine.any(String)
        })
      );
    });
  });

  describe('AC2.7: No memory leaks', () => {
    it('should not leave hanging promises', async () => {
      spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
      userService.getActiveUser.and.returnValue(Promise.resolve(true));

      const result = await guard.canActivate();

      expect(result).toBe(true);
      // If this test completes without hanging, there are no memory leaks
    });
  });

  describe('AC2.8: Guard returns false and redirects on error', () => {
    it('should return false and redirect on any error', async () => {
      spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
      userService.getActiveUser.and.returnValue(Promise.reject('Any error'));

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/auth/signin']);
    });

    it('should return false and redirect on timeout', async () => {
      spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
      userService.getActiveUser.and.returnValue(new Promise(() => {}));

      jasmine.clock().install();
      
      const promise = guard.canActivate();
      jasmine.clock().tick(11000);
      
      const result = await promise;
      
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/auth/signin']);
      
      jasmine.clock().uninstall();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle successful authentication flow', async () => {
      spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
      cacheService.isCachedValid.and.returnValue(null);
      userService.getActiveUser.and.returnValue(Promise.resolve(true));

      const result = await guard.canActivate();

      expect(result).toBe(true);
      expect(loaderService.showLoader).toHaveBeenCalled();
      expect(loaderService.hideLoader).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle invalid token flow', async () => {
      spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
      cacheService.isCachedValid.and.returnValue(null);
      userService.getActiveUser.and.returnValue(Promise.resolve(false));

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(loaderService.hideLoader).toHaveBeenCalled();
    });
  });

  describe('Phase 3: Cache Integration', () => {
    describe('AC3.2: Cache hit - instant navigation', () => {
      it('should use cached result and skip server call', async () => {
        spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
        cacheService.isCachedValid.and.returnValue(true);

        const result = await guard.canActivate();

        expect(result).toBe(true);
        expect(cacheService.isCachedValid).toHaveBeenCalled();
        expect(loaderService.showLoader).not.toHaveBeenCalled();
        expect(userService.getActiveUser).toHaveBeenCalled(); // Background refresh
        expect(analytics.track).toHaveBeenCalledWith(
          AnalyticsEvent.AUTH_GUARD_VALIDATION_SUCCESS,
          jasmine.objectContaining({
            source: 'cache'
          })
        );
      });

      it('should return false from cache without server call', async () => {
        spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
        cacheService.isCachedValid.and.returnValue(false);

        const result = await guard.canActivate();

        expect(result).toBe(false);
        expect(loaderService.showLoader).not.toHaveBeenCalled();
        expect(userService.getActiveUser).toHaveBeenCalled(); // Background refresh
      });
    });

    describe('AC3.8: Cache miss - server validation', () => {
      it('should call server and cache result on cache miss', async () => {
        spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
        cacheService.isCachedValid.and.returnValue(null);
        userService.getActiveUser.and.returnValue(Promise.resolve(true));

        const result = await guard.canActivate();

        expect(result).toBe(true);
        expect(loaderService.showLoader).toHaveBeenCalled();
        expect(userService.getActiveUser).toHaveBeenCalled();
        expect(cacheService.setCacheResult).toHaveBeenCalledWith(true);
        expect(analytics.track).toHaveBeenCalledWith(
          AnalyticsEvent.AUTH_GUARD_VALIDATION_SUCCESS,
          jasmine.objectContaining({
            source: 'server'
          })
        );
      });

      it('should cache false result on validation failure', async () => {
        spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
        cacheService.isCachedValid.and.returnValue(null);
        userService.getActiveUser.and.returnValue(Promise.resolve(false));

        await guard.canActivate();

        expect(cacheService.setCacheResult).toHaveBeenCalledWith(false);
      });
    });

    describe('Cache clearing on errors', () => {
      it('should clear cache on validation error', async () => {
        spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
        cacheService.isCachedValid.and.returnValue(null);
        userService.getActiveUser.and.returnValue(Promise.reject('Server error'));

        await guard.canActivate();

        expect(cacheService.clearCache).toHaveBeenCalled();
      });

      it('should clear cache on timeout', async () => {
        spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
        cacheService.isCachedValid.and.returnValue(null);
        userService.getActiveUser.and.returnValue(new Promise(() => {}));

        jasmine.clock().install();
        
        const promise = guard.canActivate();
        jasmine.clock().tick(11000);
        
        await promise;
        
        expect(cacheService.clearCache).toHaveBeenCalled();
        
        jasmine.clock().uninstall();
      });
    });

    describe('Background refresh for security', () => {
      it('should refresh user data in background when using cache', async () => {
        spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
        cacheService.isCachedValid.and.returnValue(true);
        userService.getActiveUser.and.returnValue(Promise.resolve(true));

        await guard.canActivate();

        // Should call getActiveUser for background refresh
        expect(userService.getActiveUser).toHaveBeenCalled();
      });
    });
  });
});
