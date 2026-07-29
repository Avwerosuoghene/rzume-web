import { TestBed } from '@angular/core/testing';
import { AnalyticsUserContextService } from './analytics-user-context.service';
import { User } from '../models/interface/authentication.models';

describe('AnalyticsUserContextService', () => {
  let service: AnalyticsUserContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AnalyticsUserContextService] });
    service = TestBed.inject(AnalyticsUserContextService);
  });

  describe('initial state', () => {
    it('should start unauthenticated with no user info', () => {
      expect(service.getUserContext()).toEqual({ isAuthenticated: false });
    });
  });

  describe('updateUserFromAuth', () => {
    it('should populate the context from the user and mark authenticated', () => {
      const user = { email: 'user@example.com', firstName: 'Jane', lastName: 'Doe' } as User;
      service.updateUserFromAuth(user);

      const context = service.getUserContext();
      expect(context.email).toBe('user@example.com');
      expect(context.username).toBe('user@example.com');
      expect(context.userId).toBe('user@example.com');
      expect(context.firstName).toBe('Jane');
      expect(context.lastName).toBe('Doe');
      expect(context.isAuthenticated).toBe(true);
      expect(context.signupDate).toBeDefined();
    });

    // NOTE: this documents real, current behavior that is likely a bug — see
    // test-backfill-findings.md #14. `updateUserFromAuth` is called from both actual
    // signup/login success AND generic profile refresh (handleUserUpdate), and it
    // unconditionally overwrites `signupDate` to "now" every single time. So this
    // "signupDate" is really "the last time this method ran," not a fixed signup timestamp.
    it('should overwrite signupDate to the current time on every call, not just the first', (done) => {
      const user = { email: 'user@example.com' } as User;
      service.updateUserFromAuth(user);
      const firstSignupDate = service.getUserContext().signupDate;

      setTimeout(() => {
        service.updateUserFromAuth(user);
        const secondSignupDate = service.getUserContext().signupDate;
        expect(secondSignupDate).not.toBe(firstSignupDate);
        done();
      }, 5);
    });
  });

  describe('updateAuthEmail', () => {
    it('should update email/username/userId while preserving the rest of the context', () => {
      service.updateAuthEmail('new@example.com');

      const context = service.getUserContext();
      expect(context.email).toBe('new@example.com');
      expect(context.username).toBe('new@example.com');
      expect(context.userId).toBe('new@example.com');
      expect(context.isAuthenticated).toBe(false);
    });
  });

  describe('clearUserContext', () => {
    it('should reset to the unauthenticated default state', () => {
      service.updateUserFromAuth({ email: 'user@example.com' } as User);
      service.clearUserContext();

      expect(service.getUserContext()).toEqual({ isAuthenticated: false });
    });
  });

  describe('getUserContext$', () => {
    it('should emit the current context to new subscribers', (done) => {
      service.updateAuthEmail('user@example.com');
      service.getUserContext$().subscribe(context => {
        expect(context.email).toBe('user@example.com');
        done();
      });
    });
  });

  describe('enrichEventProperties', () => {
    it('should merge user context fields into the given properties', () => {
      service.updateUserFromAuth({ email: 'user@example.com', firstName: 'Jane' } as User);
      const result = service.enrichEventProperties({ custom: 'value' });

      expect(result.custom).toBe('value');
      expect(result.user_email).toBe('user@example.com');
      expect(result.user_first_name).toBe('Jane');
      expect(result.user_authenticated).toBe(true);
      expect(result.user_id).toBe('user@example.com');
      expect(result.timestamp).toBeDefined();
    });

    it('should not include user_id when not authenticated', () => {
      const result = service.enrichEventProperties();
      expect(result.user_id).toBeUndefined();
      expect(result.user_authenticated).toBe(false);
    });
  });
});
