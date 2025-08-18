import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { APIResponse, ApiRoutes, GetRequestParams } from '../models';
import { CreateApplicationPayload, UpdateJobApplicationPayload } from '../models/interface/job-application.models';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  constructor(private apiService: ApiService) { }

  addApplication(payload: CreateApplicationPayload) {
    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.jobApplication.base, payload, true
    );
  }

  updateStatus(payload: UpdateJobApplicationPayload, applicationId: string) {
    return this.apiService.put<APIResponse<boolean>>(
      `${ApiRoutes.jobApplication.base}/${applicationId}`, payload, true
    );
  }

  deleteApplication(applicationId: string) {
    return this.apiService.delete<APIResponse<boolean>>(
      `${ApiRoutes.jobApplication.base}/${applicationId}`, true
    );
  }

  getApplications() {
    return this.apiService.get<APIResponse<any[]>>(
      ApiRoutes.jobApplication.base, true
    );
  }
}
