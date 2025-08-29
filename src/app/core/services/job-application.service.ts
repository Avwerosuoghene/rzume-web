import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { APIResponse, ApiRoutes, ApiUrlParam, GetRequestParams, PaginatedItem } from '../models';
import { CreateApplicationPayload, JobApplicationFilter, JobApplicationItem, UpdateJobApplicationPayload } from '../models/interface/job-application.models';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  constructor(private apiService: ApiService) { }

  addApplication(payload: CreateApplicationPayload) {
    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.jobApplication.base, payload, true, undefined, true
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

  getApplications(filter?: JobApplicationFilter) {
    const params: ApiUrlParam[] = this.buildApplicationsParams(filter);
    return this.apiService.get<APIResponse<PaginatedItem<JobApplicationItem>>>(
      ApiRoutes.jobApplication.base, true, params, undefined, true
    );
  }

  private buildApplicationsParams(filter?: JobApplicationFilter): ApiUrlParam[] {
    if (!filter) return [];

    const paramMap: Record<string, any> = {
      status: filter.status?.toString(),
      companyName: filter.companyName,
      position: filter.position,
      startDate: filter.startDate?.toISOString(),
      endDate: filter.endDate?.toISOString(),
    };

    return Object.entries(paramMap)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([name, value]) => ({ name, value }));
  }
}
