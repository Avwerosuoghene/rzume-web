import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiRoutes } from '../models/constants/api.routes';
import { HttpHeaders } from '@angular/common/http';
import { APIResponse, ApiUrlParam, GetRequestParams, GOOGLE_SCRIPT_ID, GOOGLE_SCRIPT_SRC, GoogleSignInPayload, SigninResponse, AuthRequest, User, ValidateUserResponse, GenerateEmailToken, GetRequestOptions } from '../models';

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


  getActiveUser(userToken: string) {
    const apiRoute = ApiRoutes.auth.getActiveUser;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${userToken}`,
    });

    const getReqOptions: GetRequestOptions = {
      route: apiRoute,
      withBearer: true,
      handleResponse: true,
      headers
    }
    return this.apiService.get<APIResponse<User>>(getReqOptions);
  }



  onboard(payload: AuthRequest) {
    return this.apiService.post<APIResponse<SigninResponse>>(
      ApiRoutes.auth.login, payload, true
    )
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
