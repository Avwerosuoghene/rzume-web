import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthRoutes, RootRoutes } from '../models/enums/application.routes.enums';
import { LoaderService, UserService } from '../services';
import { AuthHelperService } from '../services/auth-helper.service';
import { TokenStorageUtil } from '../helpers/token-storage.util';
import { CompositeAnalyticsService } from '../services/analytics/composite-analytics.service';
import { AnalyticsEvent } from '../models/analytics-events.enum';
import { TokenValidationCacheService } from '../services/token-validation-cache.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  private readonly VALIDATION_TIMEOUT = 10000; // 10 seconds

  constructor(
    private userService: UserService,
    private authHelper: AuthHelperService,
    private router: Router,
    private loaderService: LoaderService,
    private analytics: CompositeAnalyticsService,
    private cacheService: TokenValidationCacheService
  ) { }

  async canActivate(): Promise<boolean> {
    // Quick token existence check - no server call needed
    if (!TokenStorageUtil.hasToken()) {
      this.analytics.track(AnalyticsEvent.AUTH_GUARD_NO_TOKEN, {
        redirect_to: 'signin',
        timestamp: new Date().toISOString()
      });
      await this.navigateToSignIn();
      return false;
    }

    const cachedResult = this.cacheService.isCachedValid();
    
    if (cachedResult !== null) {
      this.analytics.track(AnalyticsEvent.AUTH_GUARD_VALIDATION_SUCCESS, {
        source: 'cache',
        timestamp: new Date().toISOString()
      });
      
      // Refresh user data in background for security (non-blocking)
      this.refreshUserDataInBackground();
      
      return cachedResult;
    }

    // Cache miss - validate with server
    try {
      this.loaderService.showLoader();
      const tokenIsActive = await this.getActiveToken();
      
      // Cache the result for future navigations
      this.cacheService.setCacheResult(tokenIsActive);
      
      return tokenIsActive;
    } catch (error) {
      const isTimeout = error instanceof Error && error.message.includes('timeout');
      
      this.analytics.track(
        isTimeout ? AnalyticsEvent.AUTH_GUARD_VALIDATION_TIMEOUT : AnalyticsEvent.AUTH_GUARD_VALIDATION_ERROR,
        {
          error_message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }
      );
      
      this.cacheService.clearCache();
      
      await this.navigateToSignIn();
      return false;
    } finally {
      this.loaderService.hideLoader();
    }
  }

  private async getActiveToken(): Promise<boolean> {
    try {
      // Race between validation and timeout
      const isValid = await Promise.race([
        this.userService.getActiveUser(),
        this.createTimeout()
      ]);
      
      if (isValid) {
        this.analytics.track(AnalyticsEvent.AUTH_GUARD_VALIDATION_SUCCESS, {
          source: 'server',
          timestamp: new Date().toISOString()
        });
        return true;
      } else {
        this.analytics.track(AnalyticsEvent.AUTH_GUARD_VALIDATION_FAILED, {
          reason: 'invalid_token',
          timestamp: new Date().toISOString()
        });
        return false;
      }
    } catch (error) {
      throw error;
    }
  }


  private refreshUserDataInBackground(): void {
    if (!TokenStorageUtil.hasToken()) {
      this.cacheService.clearCache();
      return;
    }

    this.userService.getActiveUser()
      .then(() => {
        // User data refreshed successfully
      })
      .catch(() => {
        // If background refresh fails, clear cache to force full validation next time
        this.cacheService.clearCache();
      });
  }

  private createTimeout(): Promise<boolean> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Token validation timeout after 10 seconds'));
      }, this.VALIDATION_TIMEOUT);
    });
  }

  private async navigateToSignIn(): Promise<void> {
    const signInRoute = `/${RootRoutes.auth}/${AuthRoutes.signin}`;
    await this.router.navigate([signInRoute]);
  }
}
