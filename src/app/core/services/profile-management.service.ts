import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { APIResponse, ApiRoutes } from '../models';
import { 
  UpdateProfilePayload, 
  ProfilePhotoUploadResult,
  DocumentItem,
  UploadDocumentPayload,
  DeleteDocumentPayload,
  Resume,
  SubscriptionFeatures
} from '../models/interface/profile.models';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsEvent } from '../models/analytics-events.enum';

@Injectable({
  providedIn: 'root'
})
export class ProfileManagementService {

  constructor(
    private apiService: ApiService,
    private analyticsService: AnalyticsService
  ) { }


  update(payload: UpdateProfilePayload): Observable<APIResponse<boolean>> {
    return this.apiService.put<APIResponse<boolean>>(
      ApiRoutes.profileManagement.update, 
      payload, 
      true
    ).pipe(
      tap(response => {
        if (response.success) {
          this.analyticsService.track(AnalyticsEvent.PROFILE_UPDATED, {
            fields_updated: Object.keys(payload)
          });
        }
      }),
      catchError(error => {
        this.analyticsService.track(AnalyticsEvent.PROFILE_UPDATE_FAILED, {
          error_message: error.message || 'Unknown error',
          fields_attempted: Object.keys(payload)
        });
        return throwError(() => error);
      })
    );
  }

  uploadProfilePhoto(file: File): Observable<APIResponse<ProfilePhotoUploadResult>> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    return this.apiService.post<APIResponse<ProfilePhotoUploadResult>>(
      ApiRoutes.profileManagement.updatePicture,
      formData,
      true,
      undefined,
      true,
      false 
    ).pipe(
      tap(response => {
        if (response.success) {
          this.analyticsService.track(AnalyticsEvent.PROFILE_PHOTO_UPLOADED, {
            file_size: file.size,
            file_type: file.type
          });
        }
      }),
      catchError(error => {
        this.analyticsService.track(AnalyticsEvent.PROFILE_PHOTO_UPLOAD_FAILED, {
          error_message: error.message || 'Unknown error',
          file_size: file.size,
          file_type: file.type
        });
        return throwError(() => error);
      })
    );
  }

  getResumes(): Observable<APIResponse<Resume[]>> {
    return this.apiService.get<APIResponse<Resume[]>>({
      route: ApiRoutes.profileManagement.resumes,
      withBearer: true,
      handleResponse: true
    });
  }

  getSubscriptionFeatures(): Observable<APIResponse<SubscriptionFeatures>> {
    return this.apiService.get<APIResponse<SubscriptionFeatures>>({
      route: ApiRoutes.profileManagement.subscriptionFeatures,
      withBearer: true,
      handleResponse: true
    });
  }

  uploadResume(payload: UploadDocumentPayload): Observable<APIResponse<DocumentItem>> {
    const formData = new FormData();
    formData.append('file', payload.file);
    
    return this.apiService.post<APIResponse<DocumentItem>>(
      ApiRoutes.profileManagement.resume,
      formData,
      true,
      undefined,
      true, 
      false
    );
  }

  deleteResume(id: string): Observable<APIResponse<boolean>> {
    return this.apiService.delete<APIResponse<boolean>>(
      ApiRoutes.profileManagement.resumes + `/${id}`,
      true
    );
  }
}
