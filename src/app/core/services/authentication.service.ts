import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiRoutes } from '../models/constants/api.routes';
import { HttpHeaders } from '@angular/common/http';
import { APIResponse, ApiUrlParam, GetRequestParams, GOOGLE_SCRIPT_ID, GOOGLE_SCRIPT_SRC, GoogleSignInPayload, SigninResponse, SignOutPayload, SignupResponse, AuthRequest, User, ValidateUserResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private apiService: ApiService) { }

  defaultHeaders = new HttpHeaders({
    'Content-type': 'application/json'
  });


  signup(payload: AuthRequest) {
    return this.apiService.post<APIResponse>(
      ApiRoutes.user.register, payload, false
    )
  }

  googleLogin(payload: GoogleSignInPayload) {

    return this.apiService.post<APIResponse<SigninResponse>>(
      ApiRoutes.user.googleSigin, payload, true
    )
  }

  login(payload: AuthRequest) {
    payload.password = window.btoa(payload.password.toString());
    return this.apiService.post<APIResponse<SigninResponse>>(
      ApiRoutes.user.login, payload, true
    )
  }

  logout(payload: SignOutPayload) {
    return this.apiService.post<APIResponse<null>>(
      ApiRoutes.user.logout, payload, true
    )
  }



  getActiveUser(userToken: string) {
    const apiRoute = ApiRoutes.user.getActiveUser;
    const updatedHeaders = this.defaultHeaders
      .append('Authorization', userToken);
    const getRequestParams: GetRequestParams = {
      apiRoute: apiRoute,
      handleResponse: true
    }
    return this.apiService.get<APIResponse<{ user: User, message: string }>>(
      getRequestParams, updatedHeaders
    )
  }



  onboard(payload: AuthRequest) {
    return this.apiService.post<APIResponse<SigninResponse>>(
      ApiRoutes.user.login, payload, true
    )
  }


  generateToken(email: string) {
    const apiRoute = ApiRoutes.user.emailToken;
    const params: ApiUrlParam[] = [{ name: 'email', value: email }];
    const getRequestParams: GetRequestParams = {
      apiRoute: apiRoute,
      _params: params,
      handleResponse: false
    }
    return this.apiService.get<APIResponse<string>>(
      getRequestParams, this.defaultHeaders
    )
  }

  validateToken(token: string) {
    const apiRoute = ApiRoutes.user.validateToken;
    const params: ApiUrlParam[] = [{ name: 'token', value: token }];
    const getRequestParams: GetRequestParams = {
      apiRoute: apiRoute,
      _params: params,
      handleResponse: false
    }
    return this.apiService.get<APIResponse<ValidateUserResponse>>(
      getRequestParams, this.defaultHeaders
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
