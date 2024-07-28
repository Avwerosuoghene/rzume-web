import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiRoutes } from './api.routes';
import {  IApiUrlParam } from '../models/interface/utilities-interface';
import { IAPIResponse, ISigninResponse, ISignupResponse, IValidateUserResponse } from '../models/interface/api-response-interface';
import { IGetRequestParams, IRequestPassResetPayload, ISignupSiginPayload } from '../models/interface/api-requests-interface';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private apiService: ApiService) { }

  signup(payload: ISignupSiginPayload) {
    payload.password = window.btoa(payload.password.toString())
    return this.apiService.post<IAPIResponse<ISignupResponse>>(
      ApiRoutes.user.register, payload, false
    )
  }

  login(payload: ISignupSiginPayload) {
    payload.password = window.btoa(payload.password.toString())
    return this.apiService.post<IAPIResponse<ISigninResponse>>(
      ApiRoutes.user.login, payload, true
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
      getRequestParams
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
      getRequestParams
    );

  }
}
