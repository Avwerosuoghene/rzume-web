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
  fileName: string;
  fileSize: number;
  fileType: string;
  documentUrl: string;
  uploadedAt: Date;
}

export interface RoleDocumentRequest {
  resumeId: string;
  documentType: string;
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
