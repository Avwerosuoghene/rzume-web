import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiRoutes } from './api.routes';
import { IApiUrlParam } from '../models/interface/utilities-interface';
import { IAPIResponse, ISigninResponse, ISignupResponse, IValidateUserResponse } from '../models/interface/api-response-interface';
import { IGetRequestParams, IGoogleSignInPayload, IRequestPassResetPayload, ISignOutPayload, ISignupSiginPayload } from '../models/interface/api-requests-interface';
import { HttpHeaders } from '@angular/common/http';
import { IUser } from '../models/interface/user-model-interface';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private apiService: ApiService) { }

  defaultHeaders = new HttpHeaders({
    'Content-type': 'application/json'
  });


  signup(payload: ISignupSiginPayload) {
    payload.password = window.btoa(payload.password.toString())
    return this.apiService.post<IAPIResponse<ISignupResponse>>(
      ApiRoutes.user.register, payload, false
    )
  }

  googleLogin(payload: IGoogleSignInPayload) {

    return this.apiService.post<IAPIResponse<ISigninResponse>>(
      ApiRoutes.user.googleSigin, payload, true
    )
  }

  login(payload: ISignupSiginPayload) {
    payload.password = window.btoa(payload.password.toString());
    return this.apiService.post<IAPIResponse<ISigninResponse>>(
      ApiRoutes.user.login, payload, true
    )
  }

  logout(payload: ISignOutPayload) {
    return this.apiService.post<IAPIResponse<null>>(
      ApiRoutes.user.logout, payload, true
    )
  }



  getActiveUser(userToken: string) {
    const apiRoute = ApiRoutes.user.getActiveUser;
    const updatedHeaders = this.defaultHeaders
  .append('Authorization', userToken);
    const getRequestParams: IGetRequestParams = {
      apiRoute: apiRoute,
      handleResponse: true
    }
    return this.apiService.get<IAPIResponse<{user: IUser, message: string}>>(
      getRequestParams, updatedHeaders
    )
  }



  onboard(payload: ISignupSiginPayload) {
    return this.apiService.post<IAPIResponse<ISigninResponse>>(
      ApiRoutes.user.login, payload, true
    )
  }


  generateToken(email: string) {
    const apiRoute = ApiRoutes.user.emailToken;
    const params: IApiUrlParam[] = [{ name: 'email', value: email }];
    const getRequestParams: IGetRequestParams = {
      apiRoute: apiRoute,
      _params: params,
      handleResponse: false
    }
    return this.apiService.get<IAPIResponse<string>>(
      getRequestParams, this.defaultHeaders
    )
  }

  validateToken(token: string) {
    const apiRoute = ApiRoutes.user.validateToken;
    const params: IApiUrlParam[] = [{ name: 'token', value: token }];
    const getRequestParams: IGetRequestParams = {
      apiRoute: apiRoute,
      _params: params,
      handleResponse: false
    }
    return this.apiService.get<IAPIResponse<IValidateUserResponse>>(
      getRequestParams, this.defaultHeaders
    );

  }
}
