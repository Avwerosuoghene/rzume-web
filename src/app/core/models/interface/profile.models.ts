import { DocumentType } from '../constants/profile.constants';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  userName?: string;
  profilePictureUrl?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
}

export interface DocumentItem {
  id: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt: Date;
  url: string;
}

export interface Resume {
  id: string;
  fileName: string;
  uploadedAt: Date;
  url: string;
  fileSize?: number;
  fileType?: string;
}

export interface UploadDocumentPayload {
  file: File;
  type?: DocumentType;
  name?: string;
}

export interface DeleteDocumentPayload {
  documentId: string;
}

export interface ProfilePhotoUploadResult {
  profilePictureUrl: string;
  success: boolean;
  message?: string;
}