import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { APIResponse, ApiRoutes, ResetPassword } from '../models';
import { UpdateProfilePayload } from '../models/interface/profile.models';

@Injectable({
  providedIn: 'root'
})
export class ProfileManagementService {

  constructor(private apiService: ApiService) { }

  update(payload: UpdateProfilePayload) {
    return this.apiService.put<APIResponse<boolean>>(
      ApiRoutes.profileManagement.update, payload, true
    );
  }



  resetPassword(payload: ResetPassword) {
    payload.password = window.btoa(payload.password.toString())

    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.profileManagement.resetPassword, payload, false
    )
  }

}
