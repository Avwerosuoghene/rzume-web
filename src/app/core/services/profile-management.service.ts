import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { APIResponse, ApiRoutes } from '../models';
import { 
  UpdateProfilePayload, 
  ProfilePhotoUploadResult,
  DocumentItem,
  UploadDocumentPayload,
  DeleteDocumentPayload
} from '../models/interface/profile.models';

@Injectable({
  providedIn: 'root'
})
export class ProfileManagementService {

  constructor(private apiService: ApiService) { }


  update(payload: UpdateProfilePayload): Observable<APIResponse<boolean>> {
    return this.apiService.put<APIResponse<boolean>>(
      ApiRoutes.profileManagement.update, 
      payload, 
      true
    );
  }

  uploadProfilePhoto(file: File): Observable<APIResponse<ProfilePhotoUploadResult>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.apiService.post<APIResponse<ProfilePhotoUploadResult>>(
      ApiRoutes.profileManagement.uploads,
      formData,
      true
    );
  }

  getDocuments(): Observable<APIResponse<DocumentItem[]>> {
    return this.apiService.get<APIResponse<DocumentItem[]>>({
      route: `${ApiRoutes.profileManagement.uploads}/documents`,
      withBearer: true,
      handleResponse: true
    });
  }

  uploadDocument(payload: UploadDocumentPayload): Observable<APIResponse<DocumentItem>> {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('type', payload.type);
    formData.append('name', payload.name);
    
    return this.apiService.post<APIResponse<DocumentItem>>(
      `${ApiRoutes.profileManagement.uploads}/documents`,
      formData,
      true
    );
  }

  deleteDocument(payload: DeleteDocumentPayload): Observable<APIResponse<boolean>> {
    return this.apiService.delete<APIResponse<boolean>>(
      `${ApiRoutes.profileManagement.uploads}/documents/${payload.documentId}`,
      true
    );
  }
}
