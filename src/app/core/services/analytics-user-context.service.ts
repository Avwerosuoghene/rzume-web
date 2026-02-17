import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/interface/authentication.models';

export interface AnalyticsUserContext {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  isAuthenticated: boolean;
  signupDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsUserContextService {
  private userContext$ = new BehaviorSubject<AnalyticsUserContext>({
    isAuthenticated: false
  });

  constructor() {}

  // Get current user context
  getUserContext(): AnalyticsUserContext {
    return this.userContext$.value;
  }

  // Get user context as observable
  getUserContext$(): Observable<AnalyticsUserContext> {
    return this.userContext$.asObservable();
  }

  // Update user context from /api/auth/me response
  updateUserFromAuth(user: User): void {
    const context: AnalyticsUserContext = {
      email: user.email,
      username: user.email, // Use email as username for now
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.email, // Use email as userId since User model doesn't have id
      isAuthenticated: true,
      signupDate: new Date().toISOString()
    };

    this.userContext$.next(context);
  }

  // Update context during authentication (signup/login) with email
  updateAuthEmail(email: string): void {
    const currentContext = this.userContext$.value;
    const updatedContext: AnalyticsUserContext = {
      ...currentContext,
      email,
      username: email,
      userId: email
    };

    this.userContext$.next(updatedContext);
  }

  // Clear user context (logout)
  clearUserContext(): void {
    this.userContext$.next({
      isAuthenticated: false
    });
  }

  // Enrich event properties with user context
  enrichEventProperties(properties?: any): any {
    const userContext = this.getUserContext();
    
    // Always include available user information
    const enrichedProperties = {
      ...properties,
      user_email: userContext.email,
      user_username: userContext.username,
      user_first_name: userContext.firstName,
      user_last_name: userContext.lastName,
      user_authenticated: userContext.isAuthenticated,
      timestamp: new Date().toISOString()
    };

    // Only include user_id if authenticated
    if (userContext.isAuthenticated && userContext.userId) {
      enrichedProperties.user_id = userContext.userId;
    }

    return enrichedProperties;
  }
}
