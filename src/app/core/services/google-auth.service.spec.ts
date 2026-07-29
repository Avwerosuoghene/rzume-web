import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { GoogleAuthService } from './google-auth.service';
import { AuthenticationService } from './authentication.service';
import { TokenStorageUtil } from '../helpers/token-storage.util';
import { APIResponse, ErrorResponse, SigninResponse, User } from '../models';

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['googleLogin']);

    TestBed.configureTestingModule({
      providers: [
        GoogleAuthService,
        { provide: Router, useValue: routerSpy },
        { provide: AuthenticationService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(GoogleAuthService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('handleCredentialResponse', () => {
    it('should call googleLogin with the credential as userToken and report success with the token', () => {
      const user = { email: 'user@example.com' } as User;
      authServiceSpy.googleLogin.and.returnValue(of({
        success: true,
        data: { user, token: 'tok-1', persistSession: true }
      } as APIResponse<SigninResponse>));

      const onSuccess = jasmine.createSpy('onSuccess');
      const onError = jasmine.createSpy('onError');

      service.handleCredentialResponse({ credential: 'g-credential' }, onSuccess, onError);

      expect(authServiceSpy.googleLogin).toHaveBeenCalledWith({ userToken: 'g-credential' });
      expect(onSuccess).toHaveBeenCalledWith(true, 'tok-1');
    });

    // Real gap, documented rather than fixed — see test-backfill-findings.md #26. The regular
    // login flow (login.component.ts:161) and email confirmation flow both correctly read
    // `persistSession` from the signin response; this Google flow silently drops it, which
    // this test documents by showing onSuccess's signature has no way to carry it through.
    it('should not surface persistSession to onSuccess even when the response includes it (documents a real drop — see findings log #26)', () => {
      const user = { email: 'user@example.com' } as User;
      authServiceSpy.googleLogin.and.returnValue(of({
        success: true,
        data: { user, token: 'tok-1', persistSession: true }
      } as APIResponse<SigninResponse>));

      const onSuccess = jasmine.createSpy('onSuccess');
      service.handleCredentialResponse({ credential: 'g-credential' }, onSuccess, () => {});

      // onSuccess only ever receives (success, token) — persistSession has nowhere to go.
      expect(onSuccess.calls.mostRecent().args.length).toBe(2);
    });

    it('should call onError when the login call errors', () => {
      const error = { statusCode: 401, errorMessage: 'invalid token' } as ErrorResponse;
      authServiceSpy.googleLogin.and.returnValue(throwError(() => error));

      const onError = jasmine.createSpy('onError');
      service.handleCredentialResponse({ credential: 'bad' }, () => {}, onError);

      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe('handleGoogleAuthResponse', () => {
    it('should store the token as session-only (persistSession hardcoded false — see findings log #26)', () => {
      service.handleGoogleAuthResponse(true, 'tok-1');

      expect(sessionStorage.getItem('authToken')).toBe('tok-1');
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('should navigate to /main on success', () => {
      service.handleGoogleAuthResponse(true, 'tok-1');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/main']);
    });

    it('should not navigate when success is false', () => {
      service.handleGoogleAuthResponse(false, 'tok-1');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should not store a token when none is given', () => {
      spyOn(TokenStorageUtil, 'setToken');
      service.handleGoogleAuthResponse(true, undefined);
      expect(TokenStorageUtil.setToken).not.toHaveBeenCalled();
    });
  });

  describe('loadGoogleScript (static) — confirmed dead code, see findings log #26', () => {
    afterEach(() => {
      document.getElementById('google-js')?.remove();
    });

    it('should resolve immediately if the script already exists', async () => {
      const existing = document.createElement('script');
      existing.id = 'google-js';
      document.head.appendChild(existing);

      await expectAsync(GoogleAuthService.loadGoogleScript()).toBeResolved();
    });

    it('should inject the script and resolve on load', async () => {
      const promise = GoogleAuthService.loadGoogleScript();
      const script = document.getElementById('google-js') as HTMLScriptElement;
      expect(script.src).toContain('accounts.google.com/gsi/client');

      script.onload?.(new Event('load'));
      await expectAsync(promise).toBeResolved();
    });
  });
});
