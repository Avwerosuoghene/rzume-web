import { TestBed } from '@angular/core/testing';
import { AnalyticsAuthHelperService } from './analytics-auth-helper.service';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsUserContextService } from './analytics-user-context.service';
import { AnalyticsEvent, SignupMethod } from '../models/analytics-events.enum';
import { User } from '../models/interface/authentication.models';

describe('AnalyticsAuthHelperService', () => {
  let service: AnalyticsAuthHelperService;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let userContextServiceSpy: jasmine.SpyObj<AnalyticsUserContextService>;

  beforeEach(() => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['track', 'identify', 'reset']);
    userContextServiceSpy = jasmine.createSpyObj('AnalyticsUserContextService', [
      'updateAuthEmail', 'updateUserFromAuth', 'clearUserContext'
    ]);

    TestBed.configureTestingModule({
      providers: [
        AnalyticsAuthHelperService,
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
        { provide: AnalyticsUserContextService, useValue: userContextServiceSpy }
      ]
    });

    service = TestBed.inject(AnalyticsAuthHelperService);
  });

  describe('handleAuthInit', () => {
    it('should update the auth email and track the init event', () => {
      service.handleAuthInit('user@example.com', SignupMethod.EMAIL, AnalyticsEvent.AUTH_SIGNUP_INITIATED);

      expect(userContextServiceSpy.updateAuthEmail).toHaveBeenCalledWith('user@example.com');
      expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.AUTH_SIGNUP_INITIATED, {
        signup_method: SignupMethod.EMAIL,
        signin_method: SignupMethod.EMAIL
      });
    });
  });

  describe('handleAuthSuccess', () => {
    it('should update user context, track success, and identify the user', () => {
      const user = { email: 'user@example.com', firstName: 'Jane', lastName: 'Doe' } as User;

      service.handleAuthSuccess(user, SignupMethod.EMAIL, AnalyticsEvent.AUTH_SIGNUP_COMPLETED);

      expect(userContextServiceSpy.updateUserFromAuth).toHaveBeenCalledWith(user);
      expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.AUTH_SIGNUP_COMPLETED, {
        signup_method: SignupMethod.EMAIL,
        signin_method: SignupMethod.EMAIL
      });
      expect(analyticsServiceSpy.identify).toHaveBeenCalledWith({
        userId: 'user@example.com',
        email: 'user@example.com',
        name: 'Jane Doe',
        subscriptionStatus: 'free',
        totalApplications: 0
      });
    });

    it('should handle a user with no first/last name gracefully', () => {
      const user = { email: 'user@example.com' } as User;
      service.handleAuthSuccess(user, SignupMethod.GOOGLE, AnalyticsEvent.AUTH_GOOGLE_OAUTH_COMPLETED);

      expect(analyticsServiceSpy.identify).toHaveBeenCalledWith(jasmine.objectContaining({ name: '' }));
    });
  });

  describe('handleAuthFailure', () => {
    it('should track the failure event with the error message', () => {
      service.handleAuthFailure(new Error('Invalid credentials'), SignupMethod.EMAIL, AnalyticsEvent.AUTH_SIGNIN_FAILED);

      expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.AUTH_SIGNIN_FAILED, {
        error_message: 'Invalid credentials',
        signup_method: SignupMethod.EMAIL,
        signin_method: SignupMethod.EMAIL
      });
    });

    it('should fall back to "Unknown error" when the error has no message', () => {
      service.handleAuthFailure({}, SignupMethod.EMAIL, AnalyticsEvent.AUTH_SIGNIN_FAILED);

      expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.AUTH_SIGNIN_FAILED, jasmine.objectContaining({
        error_message: 'Unknown error'
      }));
    });

    it('should not throw when the error itself is null or undefined', () => {
      expect(() => service.handleAuthFailure(null, SignupMethod.EMAIL, AnalyticsEvent.AUTH_SIGNIN_FAILED)).not.toThrow();
      expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.AUTH_SIGNIN_FAILED, jasmine.objectContaining({
        error_message: 'Unknown error'
      }));
    });
  });

  describe('handleLogout', () => {
    it('should clear user context, track logout, and reset analytics', () => {
      service.handleLogout();

      expect(userContextServiceSpy.clearUserContext).toHaveBeenCalled();
      expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.AUTH_LOGOUT);
      expect(analyticsServiceSpy.reset).toHaveBeenCalled();
    });
  });

  describe('handleUserUpdate', () => {
    it('should update the user context from the given user', () => {
      const user = { email: 'user@example.com' } as User;
      service.handleUserUpdate(user);

      expect(userContextServiceSpy.updateUserFromAuth).toHaveBeenCalledWith(user);
    });
  });
});
