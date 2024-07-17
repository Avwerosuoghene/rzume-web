import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiRoutes } from './api.routes';
import {  ISignupSiginPayload, ISignupResponse, ISigninResponse, IValidateUser } from '../models/interface/authentication-interface';
import { IAPIResponse, IApiUrlParam, IGetRequestParams } from '../models/interface/utilities-interface';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private apiService: ApiService) { }

  signup(payload: ISignupSiginPayload) {
    return this.apiService.post<IAPIResponse<ISignupResponse>>(
      ApiRoutes.user.register, payload, false
    )
  }

  login(payload: ISignupSiginPayload) {
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
    return this.apiService.get<IAPIResponse<IValidateUser>>(
      getRequestParams
    );

  }
}
