export interface Role {
  id: string;
  userId: string;
  jobRole: string;
  industry: string;
  documents: RoleDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
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
