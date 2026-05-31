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

export interface CreateRolePayload {
  jobRole: string;
  industry: string;
  documents: File[];
}

export interface RoleStats {
  createdCount: number;
  maxAllowed: number;
}
