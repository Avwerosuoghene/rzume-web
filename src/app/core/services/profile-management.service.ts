import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { APIResponse, ApiRoutes, OnboardUserFirstStagePayload, OnboardUserPayload, RequestPassResetPayload, ResetPassword } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProfileManagementService {

  constructor(private apiService: ApiService) { }



  onboard(payload: OnboardUserPayload<OnboardUserFirstStagePayload>) {
    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.profileManagement.onboarding, payload, true
    );
  }

  requestPassReset(payload: RequestPassResetPayload) {
    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.profileManagement.requestPassReset, payload, true
    )
  }

  resetPassword(payload: ResetPassword) {
    payload.password = window.btoa(payload.password.toString())

    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.profileManagement.resetPassword, payload, false
    )
  }

}
