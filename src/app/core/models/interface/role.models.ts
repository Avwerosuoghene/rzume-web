export interface Role {
  id: string;
  title: string;
  industryName: string;
  documents: RoleDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleDocument {
  id: string;
  resumeId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  documentType: string;
  documentUrl: string;
  uploadedAt: Date;
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
