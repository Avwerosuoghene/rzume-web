import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { RoleStateService } from './role-state.service';
import { AnalyticsService } from './analytics/analytics.service';
import { APIResponse, ApiRoutes, GetRequestOptions } from '../models';
import { Role, CreateRolePayload, RoleListResponse, RoleStats, UpdateRolePayload } from '../models/interface/role.models';
import { AnalyticsEvent } from '../models/analytics-events.enum';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(
    private apiService: ApiService,
    private roleState: RoleStateService,
    private analyticsService: AnalyticsService
  ) { }

  getRoles(): Observable<APIResponse<RoleListResponse>> {
    this.roleState.setLoading(true);
    this.roleState.setError(null);

    const getReqOptions: GetRequestOptions = {
      route: ApiRoutes.roles.base,
      withBearer: true,
      handleResponse: true
    };

    return this.apiService.get<APIResponse<RoleListResponse>>(getReqOptions)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.roleState.setRoles(response.data.roles);
          }
          this.roleState.setLoading(false);
        }),
        catchError(error => {
          this.roleState.setError('Failed to load roles');
          this.roleState.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  createRole(payload: CreateRolePayload): Observable<APIResponse<Role>> {
    return this.apiService.post<APIResponse<Role>>(ApiRoutes.roles.base, payload, true, undefined, true)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.roleState.addRole(response.data);
            this.analyticsService.track(AnalyticsEvent.ROLE_CREATED, {
              title: payload.title,
              industryId: payload.industryId,
              documentCount: payload.documents.length
            });
          }
        }),
        catchError(error => {
          this.analyticsService.track(AnalyticsEvent.ROLE_CREATE_FAILED, {
            error_message: error?.message || 'Unknown error',
            title: payload.title,
            industryId: payload.industryId
          });
          return throwError(() => error);
        })
      );
  }

  updateRole(roleId: string, payload: UpdateRolePayload): Observable<APIResponse<Role>> {
    return this.apiService.put<APIResponse<Role>>(`${ApiRoutes.roles.base}/${roleId}`, payload, true)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.roleState.updateRole(response.data);
            this.analyticsService.track(AnalyticsEvent.ROLE_UPDATED, {
              roleId
            });
          }
        }),
        catchError(error => {
          this.analyticsService.track(AnalyticsEvent.ROLE_UPDATE_FAILED, {
            error_message: error?.message || 'Unknown error',
            roleId
          });
          return throwError(() => error);
        })
      );
  }

  deleteRole(roleId: string): Observable<APIResponse<boolean>> {
    return this.apiService.delete<APIResponse<boolean>>(`${ApiRoutes.roles.base}/${roleId}`, true)
      .pipe(
        tap(response => {
          if (response.success) {
            this.roleState.removeRole(roleId);
            this.analyticsService.track(AnalyticsEvent.ROLE_DELETED, {
              roleId
            });
          }
        }),
        catchError(error => {
          this.analyticsService.track(AnalyticsEvent.ROLE_DELETE_FAILED, {
            error_message: error?.message || 'Unknown error',
            roleId
          });
          return throwError(() => error);
        })
      );
  }

  getRoleStats(): Observable<APIResponse<RoleStats>> {
    const getReqOptions: GetRequestOptions = {
      route: ApiRoutes.roles.stats,
      withBearer: true,
      handleResponse: true
    };

    return this.apiService.get<APIResponse<RoleStats>>(getReqOptions)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.roleState.setStats(response.data);
          }
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
}
