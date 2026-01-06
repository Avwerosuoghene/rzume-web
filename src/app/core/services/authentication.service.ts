import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiRoutes } from '../models/constants/api.routes';
import { HttpHeaders } from '@angular/common/http';
import { APIResponse, ApiUrlParam, GetRequestParams, GOOGLE_SCRIPT_ID, GOOGLE_SCRIPT_SRC, GoogleSignInPayload, SigninResponse, AuthRequest, User, ValidateUserResponse, GenerateEmailToken, GetRequestOptions, RequestPassResetPayload, ResetPassword } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private apiService: ApiService) { }


  signup(payload: AuthRequest) {
    return this.apiService.post<APIResponse>(
      ApiRoutes.auth.register, payload, false
    )
  }

  googleLogin(payload: GoogleSignInPayload) {

    return this.apiService.post<APIResponse<SigninResponse>>(
      ApiRoutes.auth.googleSigin, payload, true
    )
  }

  login(payload: AuthRequest) {
    return this.apiService.post<APIResponse<SigninResponse>>(
      ApiRoutes.auth.login, payload, true
    )
  }

  logout() {
    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.auth.logout, {}, false
    )
  }

  getActiveUser() {
    const apiRoute = ApiRoutes.auth.getActiveUser;

    const getReqOptions: GetRequestOptions = {
      route: apiRoute,
      withBearer: false,
      handleResponse: false
    }
    return this.apiService.get<APIResponse<User>>(getReqOptions);
  }



  generateToken(payload: GenerateEmailToken) {
    return this.apiService.post<APIResponse<string>>(
      ApiRoutes.auth.generateEmailToken, payload, true
    )
  }

  validateToken(token: string, email: string) {
    const params: ApiUrlParam[] = [{ name: 'token', value: token }, { name: 'email', value: email }];
    const getReqOptions: GetRequestOptions = {
      route: ApiRoutes.auth.validateToken,
      params,
      withBearer: false,
      handleResponse: true
    }
    return this.apiService.get<APIResponse<ValidateUserResponse>>(getReqOptions);

  }

  requestPassReset(payload: RequestPassResetPayload) {
    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.auth.forgotPassword, payload, true
    )
  }

  resetPassword(payload: ResetPassword) {

    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.auth.resetPassword, payload, false
    )
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
