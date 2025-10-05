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
  name: string;
  type: DocumentType;
  size: number;
  uploadDate: Date;
  url: string;
}

export interface UploadDocumentPayload {
  file: File;
  type: DocumentType;
  name: string;
}

export interface DeleteDocumentPayload {
  documentId: string;
}

export interface ProfilePhotoUploadResult {
  profilePictureUrl: string;
  success: boolean;
  message?: string;
}