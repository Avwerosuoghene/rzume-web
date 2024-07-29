import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { IOnboardUserPayload } from '../models/interface/profile-management-interface';
import { ApiRoutes } from './api.routes';
import { IOnboardUserFirstStagePayload, IRequestPassResetPayload, IResetPassword } from '../models/interface/api-requests-interface';
import { IAPIResponse } from '../models/interface/api-response-interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileManagementService {

  constructor(private apiService: ApiService) { }



  onboard(payload: IOnboardUserPayload<IOnboardUserFirstStagePayload>) {
    return this.apiService.post<IAPIResponse<boolean>>(
      ApiRoutes.profileManagement.onboarding, payload, true
    )
  }

  requestPassReset(payload: IRequestPassResetPayload) {
    return this.apiService.post<IAPIResponse<boolean>>(
      ApiRoutes.profileManagement.requestPassReset, payload, true
    )
  }

  resetPassword(payload: IResetPassword) {
    return this.apiService.post<IAPIResponse<boolean>>(
      ApiRoutes.profileManagement.resetPassword, payload, false
    )
  }

}
