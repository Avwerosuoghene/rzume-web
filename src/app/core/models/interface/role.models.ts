import { AttachedDocument } from './profile.models';

export interface Role {
  id: string;
  title: string;
  industryName: string;
  documents: AttachedDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleDocumentRequest {
  resumeId: string;
}

export interface CreateRolePayload {
  title: string;
  industryId: number;
  documents: RoleDocumentRequest[];
}

export interface RoleStats {
  createdCount: number;
  maxAllowed: number;
}

export interface RoleListResponse {
  count: number;
  roles: Role[];
}
