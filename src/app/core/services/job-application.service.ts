import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { APIResponse, ApiRoutes, ApiUrlParam, GetRequestOptions, PaginatedItem } from '../models';
import { CreateApplicationPayload, JobApplicationFilter, JobApplicationItem } from '../models/interface/job-application.models';
import { tap } from 'rxjs';
import { JobApplicationStateService } from './job-application-state.service';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  private currentPage = 1;
  private currentPageSize = 5;
  private currentFilter: JobApplicationFilter = {};

  constructor(private apiService: ApiService, private state: JobApplicationStateService) { }

  addApplication(payload: CreateApplicationPayload) {
    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.jobApplication.base, payload, true, undefined, true
    ).pipe(
      tap(response => this.handleAddApplicationResponse(response))
    );
  }

  handleAddApplicationResponse(response: APIResponse<boolean>): void {
    if (response.success && response.data) {
      const { pageSize, page } = this.getCurrentPagination();

      this.getApplications({
        ...this.currentFilter,
        page,
        pageSize
      }).subscribe();
    }
  }

  getCurrentPagination() {
    return {
      page: this.currentPage,
      pageSize: this.currentPageSize,
      filter: { ...this.currentFilter }
    };
  }


  updateStatus(payload: JobApplicationItem, applicationId: string) {
    return this.apiService.put<APIResponse<boolean>>(
      `${ApiRoutes.jobApplication.base}/${applicationId}`, payload, true
    );
  }

  updateJobApplication(payload: JobApplicationItem) {
    return this.apiService.put<APIResponse<boolean>>(
      `${ApiRoutes.jobApplication.base}/${payload.id}`, payload, true
    );
  }

  deleteApplication(applicationId: string) {
    return this.apiService.delete<APIResponse<boolean>>(
      `${ApiRoutes.jobApplication.base}/${applicationId}`, true
    );
  }

  getApplications(filter?: JobApplicationFilter) {
    this.updateFilterAndPagination(filter);

    const { page, pageSize, filter: currentFilter } = this.getCurrentPagination();

    const params = this.buildApplicationsParams({
      ...currentFilter,
      page,
      pageSize
    });

    const options = {
      route: ApiRoutes.jobApplication.base,
      params,
      withBearer: true,
      handleResponse: true
    };

    return this.apiService.get<APIResponse<PaginatedItem<JobApplicationItem>>>(options)
      .pipe(tap(response => this.handleGetApplicationResponse(response)));
  }

  private updateFilterAndPagination(filter?: JobApplicationFilter): void {
    if (!filter) return;

    this.currentFilter = { ...this.currentFilter, ...filter };
    if (filter.page) this.currentPage = filter.page;
    if (filter.pageSize) this.currentPageSize = filter.pageSize;
  }

  private handleGetApplicationResponse(response: APIResponse<PaginatedItem<JobApplicationItem>>): void {
    if (response.success && response.data?.items) {
      this.state.updateApplications(response.data);
    }
  }

  private buildApplicationsParams(filter?: JobApplicationFilter): ApiUrlParam[] {
    if (!filter) return [];

    const paramMap: Record<string, any> = {
      status: filter?.status?.toString(),
      searchQuery: filter?.searchQuery,
      startDate: filter?.startDate?.toISOString(),
      endDate: filter?.endDate?.toISOString(),
      pageNumber: filter?.page,
      pageSize: filter?.pageSize
    };

    return Object.entries(paramMap)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([name, value]) => ({ name, value }));
  }
}
