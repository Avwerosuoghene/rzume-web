import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { APIResponse, ApiRoutes, ApiUrlParam, GetRequestOptions, PaginatedItem } from '../models';
import { CreateApplicationPayload, DeleteApplicationsPayload, JobApplicationFilter, JobApplicationItem, JobApplicationStats } from '../models/interface/job-application.models';
import { tap, catchError } from 'rxjs';
import { throwError } from 'rxjs';
import { JobApplicationStateService } from './job-application-state.service';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsEvent } from '../models/analytics-events.enum';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  private currentPage = 1;
  private currentPageSize = 5;
  private currentFilter: JobApplicationFilter = {};

  constructor(
    private apiService: ApiService, 
    private state: JobApplicationStateService,
    private analyticsService: AnalyticsService
  ) { }

  addApplication(payload: CreateApplicationPayload) {
    return this.apiService.post<APIResponse<boolean>>(
      ApiRoutes.jobApplication.base, payload, true, undefined, true
    ).pipe(
      tap(response => {
        this.handleAddApplicationResponse(response);
        if (response.success) {
          this.analyticsService.track(AnalyticsEvent.JOB_APPLICATION_CREATED, {
            company: payload.companyName,
            position: payload.position,
            status: payload.status
          });
          this.analyticsService.incrementUserProperty('total_applications', 1);
        }
      }),
      catchError(error => {
        this.analyticsService.track(AnalyticsEvent.JOB_APPLICATION_CREATE_FAILED, {
          error_message: error.message || 'Unknown error',
          company: payload.companyName,
          position: payload.position
        });
        return throwError(() => error);
      })
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
    ).pipe(
      tap(response => {
        if (response.success) {
          this.analyticsService.track(AnalyticsEvent.JOB_APPLICATION_STATUS_CHANGED, {
            application_id: applicationId,
            new_status: payload.status
          });
        }
      }),
      catchError(error => {
        this.analyticsService.track(AnalyticsEvent.JOB_APPLICATION_STATUS_CHANGE_FAILED, {
          error_message: error.message || 'Unknown error',
          application_id: applicationId,
          attempted_status: payload.status
        });
        return throwError(() => error);
      })
    );
  }

  updateJobApplication(payload: JobApplicationItem) {
    return this.apiService.put<APIResponse<boolean>>(
      `${ApiRoutes.jobApplication.base}/${payload.id}`, payload, true
    ).pipe(
      tap(response => {
        if (response.success) {
          this.analyticsService.track(AnalyticsEvent.JOB_APPLICATION_UPDATED, {
            application_id: payload.id
          });
        }
      }),
      catchError(error => {
        this.analyticsService.track(AnalyticsEvent.JOB_APPLICATION_UPDATE_FAILED, {
          error_message: error.message || 'Unknown error',
          application_id: payload.id
        });
        return throwError(() => error);
      })
    );
  }

  deleteApplication(deleteApplicationsPayload: DeleteApplicationsPayload) {
    return this.apiService.delete<APIResponse<boolean>>(
      ApiRoutes.jobApplication.base, true, undefined, deleteApplicationsPayload
    ).pipe(
      tap(response => {
        if (response.success) {
          const count = deleteApplicationsPayload.ids?.length || 0;
          if (count > 1) {
            this.analyticsService.track(AnalyticsEvent.JOB_APPLICATION_BULK_DELETED, {
              count: count
            });
          } else {
            this.analyticsService.track(AnalyticsEvent.JOB_APPLICATION_DELETED);
          }
        }
      }),
      catchError(error => {
        const count = deleteApplicationsPayload.ids?.length || 0;
        if (count > 1) {
          this.analyticsService.track(AnalyticsEvent.JOB_APPLICATION_BULK_DELETE_FAILED, {
            error_message: error.message || 'Unknown error',
            count: count
          });
        } else {
          this.analyticsService.track(AnalyticsEvent.JOB_APPLICATION_DELETE_FAILED, {
            error_message: error.message || 'Unknown error'
          });
        }
        return throwError(() => error);
      })
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
      .pipe(
        tap(response => this.handleGetApplicationResponse(response)),
        catchError(error => {
          this.analyticsService.track(AnalyticsEvent.JOB_SEARCH_FAILED, {
            error_message: error.message || 'Unknown error',
            filter: currentFilter
          });
          return throwError(() => error);
        })
      );
  }

  getStats() {
    const apiRoute = ApiRoutes.jobApplication.stats;


    const getReqOptions: GetRequestOptions = {
      route: apiRoute,
      withBearer: true,
      handleResponse: true,
    }
    return this.apiService.get<APIResponse<JobApplicationStats>>(getReqOptions);
  }


  private updateFilterAndPagination(filter?: JobApplicationFilter): void {
    if (!filter) return;

    if (filter.searchQuery && filter.searchQuery !== this.currentFilter.searchQuery) {
      this.analyticsService.track(AnalyticsEvent.JOB_SEARCH_INITIATED, {
        search_term: filter.searchQuery
      });
    }

    if (filter.status && filter.status !== this.currentFilter.status) {
      this.analyticsService.track(AnalyticsEvent.JOB_FILTER_APPLIED, {
        filter_type: 'status',
        filter_value: filter.status
      });
    }

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
