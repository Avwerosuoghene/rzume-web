import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { ApiService } from './api.service';
import { AnalyticsAuthHelperService } from './analytics-auth-helper.service';
import { AnalyticsEvent, SignupMethod } from '../models/analytics-events.enum';
import { APIResponse, SigninResponse, User } from '../models';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let analyticsAuthHelperSpy: jasmine.SpyObj<AnalyticsAuthHelperService>;

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['post', 'get']);
    analyticsAuthHelperSpy = jasmine.createSpyObj('AnalyticsAuthHelperService', [
      'handleAuthInit', 'handleAuthSuccess', 'handleAuthFailure', 'handleLogout', 'handleUserUpdate'
    ]);

    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: AnalyticsAuthHelperService, useValue: analyticsAuthHelperSpy }
      ]
    });

    service = TestBed.inject(AuthenticationService);
  });

  describe('signup', () => {
    it('should track init, call register, and track success on a successful response', (done) => {
      apiServiceSpy.post.and.returnValue(of({ success: true } as APIResponse));

      service.signup({ email: 'user@example.com', password: 'pw' } as never).subscribe(() => {
        expect(analyticsAuthHelperSpy.handleAuthInit).toHaveBeenCalledWith(
          'user@example.com', SignupMethod.EMAIL, AnalyticsEvent.AUTH_SIGNUP_INITIATED
        );
        expect(apiServiceSpy.post).toHaveBeenCalledWith('api/auth/register', jasmine.any(Object), false);
        expect(analyticsAuthHelperSpy.handleAuthSuccess).toHaveBeenCalledWith(
          jasmine.objectContaining({ email: 'user@example.com' }),
          SignupMethod.EMAIL,
          AnalyticsEvent.AUTH_SIGNUP_COMPLETED
        );
        done();
      });
    });

    it('should not track success when the response is unsuccessful', (done) => {
      apiServiceSpy.post.and.returnValue(of({ success: false } as APIResponse));

      service.signup({ email: 'user@example.com', password: 'pw' } as never).subscribe(() => {
        expect(analyticsAuthHelperSpy.handleAuthSuccess).not.toHaveBeenCalled();
        done();
      });
    });

    it('should track failure and re-throw when the request errors', (done) => {
      const error = new Error('network error');
      apiServiceSpy.post.and.returnValue(throwError(() => error));

      service.signup({ email: 'user@example.com', password: 'pw' } as never).subscribe({
        error: (err) => {
          expect(analyticsAuthHelperSpy.handleAuthFailure).toHaveBeenCalledWith(
            error, SignupMethod.EMAIL, AnalyticsEvent.AUTH_SIGNUP_FAILED
          );
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('login', () => {
    it('should track success with the returned user on successful login', (done) => {
      const user = { email: 'user@example.com' } as User;
      apiServiceSpy.post.and.returnValue(of({ success: true, data: { user } } as APIResponse<SigninResponse>));

      service.login({ email: 'user@example.com', password: 'pw' } as never).subscribe(() => {
        expect(analyticsAuthHelperSpy.handleAuthSuccess).toHaveBeenCalledWith(
          user, SignupMethod.EMAIL, AnalyticsEvent.AUTH_SIGNIN_COMPLETED
        );
        done();
      });
    });

    it('should request with handleResponse=true (unlike signup)', () => {
      apiServiceSpy.post.and.returnValue(of({ success: true } as APIResponse<SigninResponse>));
      service.login({ email: 'user@example.com', password: 'pw' } as never).subscribe();
      expect(apiServiceSpy.post).toHaveBeenCalledWith('api/auth/signin', jasmine.any(Object), true);
    });
  });

  describe('googleLogin', () => {
    it('should track success with the returned user', (done) => {
      const user = { email: 'user@example.com' } as User;
      apiServiceSpy.post.and.returnValue(of({ success: true, data: { user } } as APIResponse<SigninResponse>));

      service.googleLogin({ credential: 'token' } as never).subscribe(() => {
        expect(analyticsAuthHelperSpy.handleAuthSuccess).toHaveBeenCalledWith(
          user, SignupMethod.GOOGLE, AnalyticsEvent.AUTH_GOOGLE_OAUTH_COMPLETED
        );
        done();
      });
    });
  });

  describe('logout', () => {
    it('should call handleLogout and hit the logout endpoint', () => {
      apiServiceSpy.post.and.returnValue(of({ success: true } as APIResponse<boolean>));
      service.logout().subscribe();

      expect(analyticsAuthHelperSpy.handleLogout).toHaveBeenCalled();
      expect(apiServiceSpy.post).toHaveBeenCalledWith('api/auth/signout', {}, false);
    });
  });

  describe('getActiveUser', () => {
    it('should update user context when the response has data', (done) => {
      const user = { email: 'user@example.com' } as User;
      apiServiceSpy.get.and.returnValue(of({ success: true, data: user } as APIResponse<User>));

      service.getActiveUser().subscribe(() => {
        expect(analyticsAuthHelperSpy.handleUserUpdate).toHaveBeenCalledWith(user);
        done();
      });
    });

    it('should request the /me endpoint without a bearer flag (see findings log — this flag is not actually honored by ApiService)', () => {
      apiServiceSpy.get.and.returnValue(of({ success: true, data: {} } as APIResponse<User>));
      service.getActiveUser().subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith(jasmine.objectContaining({
        route: 'api/auth/me',
        withBearer: false
      }));
    });
  });

  describe('generateToken', () => {
    it('should track init and call the resend-confirmation endpoint', () => {
      apiServiceSpy.post.and.returnValue(of({ success: true } as APIResponse<string>));
      service.generateToken({ email: 'user@example.com' } as never).subscribe();

      expect(analyticsAuthHelperSpy.handleAuthInit).toHaveBeenCalledWith(
        'user@example.com', SignupMethod.EMAIL, AnalyticsEvent.AUTH_EMAIL_VERIFICATION_INITIATED
      );
      expect(apiServiceSpy.post).toHaveBeenCalledWith('api/auth/resend-confirmation-email', jasmine.any(Object), true);
    });

    // NOTE: unlike signup/login/googleLogin/resetPassword, this method never tracks
    // success/failure — only the "initiated" event. See test-backfill-findings.md #21.
    it('should not track a completion event even on success (documents the current gap)', () => {
      apiServiceSpy.post.and.returnValue(of({ success: true } as APIResponse<string>));
      service.generateToken({ email: 'user@example.com' } as never).subscribe();

      expect(analyticsAuthHelperSpy.handleAuthSuccess).not.toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    it('should track success with the given email when validation succeeds', (done) => {
      apiServiceSpy.get.and.returnValue(of({ success: true } as APIResponse<SigninResponse>));

      service.validateToken('tok123', 'user@example.com').subscribe(() => {
        expect(analyticsAuthHelperSpy.handleAuthSuccess).toHaveBeenCalledWith(
          jasmine.objectContaining({ email: 'user@example.com' }),
          SignupMethod.EMAIL,
          AnalyticsEvent.AUTH_EMAIL_VERIFICATION_COMPLETED
        );
        done();
      });
    });

    it('should pass the token and email as query params', () => {
      apiServiceSpy.get.and.returnValue(of({ success: true } as APIResponse<SigninResponse>));
      service.validateToken('tok123', 'user@example.com').subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith(jasmine.objectContaining({
        params: [{ name: 'token', value: 'tok123' }, { name: 'email', value: 'user@example.com' }]
      }));
    });
  });

  describe('requestPassReset', () => {
    it('should track init and call the forgot-password endpoint', () => {
      apiServiceSpy.post.and.returnValue(of({ success: true } as APIResponse<boolean>));
      service.requestPassReset({ email: 'user@example.com' } as never).subscribe();

      expect(analyticsAuthHelperSpy.handleAuthInit).toHaveBeenCalledWith(
        'user@example.com', SignupMethod.EMAIL, AnalyticsEvent.AUTH_PASSWORD_RESET_REQUESTED
      );
      expect(apiServiceSpy.post).toHaveBeenCalledWith('api/auth/forgot-password', jasmine.any(Object), true);
    });
  });

  describe('resetPassword', () => {
    it('should track success on a successful reset', (done) => {
      apiServiceSpy.post.and.returnValue(of({ success: true } as APIResponse<boolean>));

      service.resetPassword({ email: 'user@example.com' } as never).subscribe(() => {
        expect(analyticsAuthHelperSpy.handleAuthSuccess).toHaveBeenCalledWith(
          jasmine.objectContaining({ email: 'user@example.com' }),
          SignupMethod.EMAIL,
          AnalyticsEvent.AUTH_PASSWORD_RESET_COMPLETED
        );
        done();
      });
    });

    it('should track failure and re-throw on error', (done) => {
      const error = new Error('reset failed');
      apiServiceSpy.post.and.returnValue(throwError(() => error));

      service.resetPassword({ email: 'user@example.com' } as never).subscribe({
        error: (err) => {
          expect(analyticsAuthHelperSpy.handleAuthFailure).toHaveBeenCalledWith(
            error, SignupMethod.EMAIL, AnalyticsEvent.AUTH_PASSWORD_RESET_FAILED
          );
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('loadGoogleScript', () => {
    afterEach(() => {
      document.getElementById('google-js')?.remove();
    });

    it('should resolve immediately if the script is already present', async () => {
      const existing = document.createElement('script');
      existing.id = 'google-js';
      document.head.appendChild(existing);

      await expectAsync(service.loadGoogleScript()).toBeResolved();
    });

    it('should inject the script and resolve on load', async () => {
      const promise = service.loadGoogleScript();
      const script = document.getElementById('google-js') as HTMLScriptElement;
      expect(script).toBeTruthy();

      script.onload?.(new Event('load'));
      await expectAsync(promise).toBeResolved();
    });

    it('should reject when the script fails to load', async () => {
      const promise = service.loadGoogleScript();
      const script = document.getElementById('google-js') as HTMLScriptElement;

      script.onerror?.(new Event('error'));
      await expectAsync(promise).toBeRejected();
    });
  });
});
