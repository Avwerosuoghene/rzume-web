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

// All fields optional — omitted means "leave unchanged" on the backend, matching
// UpdateApplicationPayload's semantics. Sending only `documents` (the full desired list) is
// how a single document gets removed from a role without touching its title/industry.
export interface UpdateRolePayload {
  title?: string;
  industryId?: number;
  documents?: RoleDocumentRequest[];
}

export interface RoleStats {
  createdCount: number;
  maxAllowed: number;
}

export interface RoleListResponse {
  count: number;
  roles: Role[];
}
