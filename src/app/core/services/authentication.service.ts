import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiRoutes } from '../models/constants/api.routes';
import { HttpHeaders } from '@angular/common/http';
import { APIResponse, ApiUrlParam, GetRequestParams, GOOGLE_SCRIPT_ID, GOOGLE_SCRIPT_SRC, GoogleSignInPayload, SigninResponse, AuthRequest, User, ValidateUserResponse, GenerateEmailToken, GetRequestOptions, RequestPassResetPayload, ResetPassword } from '../models';
import { AnalyticsAuthHelperService } from './analytics-auth-helper.service';
import { AnalyticsEvent, SignupMethod } from '../models/analytics-events.enum';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private apiService: ApiService,
    private analyticsAuthHelper: AnalyticsAuthHelperService
  ) { }


  signup(payload: AuthRequest) {
    this.analyticsAuthHelper.handleAuthInit(
      payload.email, 
      SignupMethod.EMAIL, 
      AnalyticsEvent.AUTH_SIGNUP_INITIATED
    );

    return this.apiService.post<APIResponse>(
      ApiRoutes.auth.register, payload, false
    ).pipe(
      tap(response => {
        if (response.success) {
          this.analyticsAuthHelper.handleAuthSuccess(
            { email: payload.email, firstName: '', lastName: '' } as User,
            SignupMethod.EMAIL,
            AnalyticsEvent.AUTH_SIGNUP_COMPLETED
          );
        }
      }),
      catchError(error => {
        this.analyticsAuthHelper.handleAuthFailure(
          error, 
          SignupMethod.EMAIL, 
          AnalyticsEvent.AUTH_SIGNUP_FAILED
        );
        return throwError(() => error);
      })
    );
  }

  googleLogin(payload: GoogleSignInPayload) {
    this.analyticsAuthHelper.handleAuthInit(
      '', 
      SignupMethod.GOOGLE, 
      AnalyticsEvent.AUTH_GOOGLE_OAUTH_INITIATED
    );

    return this.apiService.post<APIResponse<SigninResponse>>(
      ApiRoutes.auth.googleSigin, payload, false
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.analyticsAuthHelper.handleAuthSuccess(
            response.data.user,
            SignupMethod.GOOGLE,
            AnalyticsEvent.AUTH_GOOGLE_OAUTH_COMPLETED
          );
        }
      }),
      catchError(error => {
        this.analyticsAuthHelper.handleAuthFailure(
          error, 
          SignupMethod.GOOGLE, 
          AnalyticsEvent.AUTH_SIGNIN_FAILED
        );
        return throwError(() => error);
      })
    );
  }

  login(payload: AuthRequest) {
    this.analyticsAuthHelper.handleAuthInit(
      payload.email, 
      SignupMethod.EMAIL, 
      AnalyticsEvent.AUTH_SIGNIN_INITIATED
    );

    return this.apiService.post<APIResponse<SigninResponse>>(
      ApiRoutes.auth.login, payload, true
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.analyticsAuthHelper.handleAuthSuccess(
            response.data.user,
            SignupMethod.EMAIL,
            AnalyticsEvent.AUTH_SIGNIN_COMPLETED
          );
        }
      }),
      catchError(error => {
        this.analyticsAuthHelper.handleAuthFailure(
          error, 
          SignupMethod.EMAIL, 
          AnalyticsEvent.AUTH_SIGNIN_FAILED
        );
        return throwError(() => error);
      })
    );
  }

  logout() {
    this.analyticsAuthHelper.handleLogout();

    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.auth.logout, {}, false
    );
  }

  getActiveUser() {
    const apiRoute = ApiRoutes.auth.getActiveUser;

    const getReqOptions: GetRequestOptions = {
      route: apiRoute,
      withBearer: false,
      handleResponse: false
    }
    return this.apiService.get<APIResponse<User>>(getReqOptions).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Update user context when /api/auth/me is called
          this.analyticsAuthHelper.handleUserUpdate(response.data);
        }
      })
    );
  }



  generateToken(payload: GenerateEmailToken) {
    this.analyticsAuthHelper.handleAuthInit(
      payload.email, 
      SignupMethod.EMAIL, 
      AnalyticsEvent.AUTH_EMAIL_VERIFICATION_INITIATED
    );

    return this.apiService.post<APIResponse<string>>(
      ApiRoutes.auth.generateEmailToken, payload, true
    );
  }

  validateToken(token: string, email: string) {
    const params: ApiUrlParam[] = [{ name: 'token', value: token }, { name: 'email', value: email }];
    const getReqOptions: GetRequestOptions = {
      route: ApiRoutes.auth.validateToken,
      params,
      withBearer: false,
      handleResponse: true
    }
    return this.apiService.get<APIResponse<ValidateUserResponse>>(getReqOptions).pipe(
      tap(response => {
        if (response.success) {
          this.analyticsAuthHelper.handleAuthSuccess(
            { email, firstName: '', lastName: '' } as User,
            SignupMethod.EMAIL,
            AnalyticsEvent.AUTH_EMAIL_VERIFICATION_COMPLETED
          );
        }
      })
    );
  }

  requestPassReset(payload: RequestPassResetPayload) {
    this.analyticsAuthHelper.handleAuthInit(
      payload.email, 
      SignupMethod.EMAIL, 
      AnalyticsEvent.AUTH_PASSWORD_RESET_REQUESTED
    );

    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.auth.forgotPassword, payload, true
    );
  }

  resetPassword(payload: ResetPassword) {
    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.auth.resetPassword, payload, false
    ).pipe(
      tap(response => {
        if (response.success) {
          this.analyticsAuthHelper.handleAuthSuccess(
            { email: payload.email, firstName: '', lastName: '' } as User,
            SignupMethod.EMAIL,
            AnalyticsEvent.AUTH_PASSWORD_RESET_COMPLETED
          );
        }
      }),
      catchError(error => {
        this.analyticsAuthHelper.handleAuthFailure(
          error, 
          SignupMethod.EMAIL, 
          AnalyticsEvent.AUTH_PASSWORD_RESET_FAILED
        );
        return throwError(() => error);
      })
    );
  }


  loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById(GOOGLE_SCRIPT_ID)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = GOOGLE_SCRIPT_ID;
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve();
      };
      script.onerror = (error) => {
        reject(error);
      };
      document.head.appendChild(script);
    });
  }
}
