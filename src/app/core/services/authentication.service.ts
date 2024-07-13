import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiRoutes } from './api.routes';
import { ISignupPayload, ISignupResponse } from '../models/interface/authentication-interface';
import { IAPIResponse, IApiUrlParam } from '../models/interface/utilities-interface';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private apiService: ApiService) { }

  signup(payload: ISignupPayload) {
    return this.apiService.post<IAPIResponse<ISignupResponse>>(
      ApiRoutes.user.register, payload, false
    )
  }


  generateToken(email: string) {
    const apiRoute = ApiRoutes.user.emailToken;
    const params: IApiUrlParam[] = [{ name: 'email', value: email }];
    return this.apiService.get<IAPIResponse<string>>(
      apiRoute, undefined, params
    )
  }
}
