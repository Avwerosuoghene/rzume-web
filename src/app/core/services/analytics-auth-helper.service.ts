import { Injectable } from '@angular/core';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsUserContextService } from './analytics-user-context.service';
import { AnalyticsEvent, SignupMethod } from '../models/analytics-events.enum';
import { User } from '../models/interface/authentication.models';
import { SigninResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsAuthHelperService {
  constructor(
    private analyticsService: AnalyticsService,
    private userContextService: AnalyticsUserContextService
  ) {}

  // Handle authentication initiation (signup/login)
  handleAuthInit(email: string, method: SignupMethod, event: AnalyticsEvent): void {
    // Update user context with email during auth
    this.userContextService.updateAuthEmail(email);

    // Track auth initiation
    this.analyticsService.track(event, {
      signup_method: method,
      signin_method: method
    });
  }

  // Handle successful authentication completion
  handleAuthSuccess(user: User, method: SignupMethod, event: AnalyticsEvent): void {
    // Update user context with full user information
    this.userContextService.updateUserFromAuth(user);
    
    // Track successful authentication
    this.analyticsService.track(event, {
      signup_method: method,
      signin_method: method
    });

    // Identify user in analytics
    this.analyticsService.identify({
      userId: user.email,
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      subscriptionStatus: 'free',
      totalApplications: 0
    });
  }

  // Handle authentication failure
  handleAuthFailure(error: any, method: SignupMethod, event: AnalyticsEvent): void {
    this.analyticsService.track(event, {
      error_message: error.message || 'Unknown error',
      signup_method: method,
      signin_method: method
    });
  }

  // Handle logout
  handleLogout(): void {
    // Clear user context
    this.userContextService.clearUserContext();
    
    // Track logout
    this.analyticsService.track(AnalyticsEvent.AUTH_LOGOUT);
    this.analyticsService.reset();
  }

  // Handle user profile update (from /api/auth/me)
  handleUserUpdate(user: User): void {
    this.userContextService.updateUserFromAuth(user);
  }
}
