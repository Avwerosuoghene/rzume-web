import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiRoutes } from '../models/constants/api.routes';
import { HttpHeaders } from '@angular/common/http';
import { APIResponse, ApiUrlParam, GetRequestParams, GOOGLE_SCRIPT_ID, GOOGLE_SCRIPT_SRC, GoogleSignInPayload, SigninResponse, SignOutPayload, SignupResponse, AuthRequest, User, ValidateUserResponse, GenerateEmailToken } from '../models';

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

  logout(payload: SignOutPayload) {
    return this.apiService.post<APIResponse<null>>(
      ApiRoutes.auth.logout, payload, true
    )
  }



  getActiveUser(userToken: string) {
    const apiRoute = ApiRoutes.auth.getActiveUser;
    const updatedHeaders = this.defaultHeaders
      .append('Authorization', `Bearer ${userToken}`);
    const getRequestParams: GetRequestParams = {
      apiRoute: apiRoute,
      handleResponse: true
    }
    return this.apiService.get<APIResponse<User>>(
      getRequestParams, updatedHeaders
    )
  }



  onboard(payload: AuthRequest) {
    return this.apiService.post<APIResponse<SigninResponse>>(
      ApiRoutes.auth.login, payload, true
    )
  }


  generateToken(payload: GenerateEmailToken) {
    const apiRoute = ApiRoutes.auth.generateEmailToken;
    // const params: ApiUrlParam[] = [{ name: 'email', value: email }];
    // const getRequestParams: GetRequestParams = {
    //   apiRoute: apiRoute,
    //   handleResponse: false
    // }
    // return this.apiService.post<APIResponse<string>>(
    //   getRequestParams, this.defaultHeaders
    // )

     return this.apiService.post<APIResponse<string>>(
      ApiRoutes.auth.generateEmailToken, payload, true
    )
  }

  validateToken(token: string, email: string) {
    const apiRoute = ApiRoutes.auth.validateToken;
    const params: ApiUrlParam[] = [{ name: 'token', value: token }, { name: 'email', value: email }];
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
