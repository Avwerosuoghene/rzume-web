import { ApplicationStatus } from "../enums";
import { AttachedDocument } from "./profile.models";

export interface JobApplicationDocumentRequestItem {
  resumeId: string;
  documentType: string;
}

export interface JobApplicationRoleSummary {
  id: string;
  title: string;
  industryName: string;
}

export interface JobApplicationItem {
  id: string;
  position?: string;
  companyName?: string;
  userId?: string;
  applicationDate?: Date;
  jobLink?: string;
  resumeId?: string;
  // Read straight off the backend's JobApplicationDto.ResumeFileName/Type/Size — flat fields,
  // not a nested Resume/AttachedDocument, on purpose: the backend deliberately skips signing a
  // DocumentUrl/DownloadUrl for the resume slot on every application returned, just to show a
  // name. Always freshly read from UserResume server-side, so it reflects a rename immediately.
  resumeFileName?: string;
  resumeFileType?: string;
  resumeFileSize?: number;
  roleId?: string;
  role?: JobApplicationRoleSummary;
  coverLetter?: AttachedDocument;
  otherDocuments?: AttachedDocument[];
  notes?: string;
  status: string;
  selected?: boolean;
}


export interface JobApplicationFilter {
  status?: ApplicationStatus;
  searchQuery?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

export interface CreateApplicationPayload {
  position?: string;
  companyName?: string;
  jobLink?: string;
  roleId?: string;
  documents?: JobApplicationDocumentRequestItem[];
  notes?: string;
  status: ApplicationStatus;
  applicationDate?: string;
}

export interface UpdateApplicationPayload {
  position?: string;
  companyName?: string;
  jobLink?: string;
  roleId?: string;
  documents?: JobApplicationDocumentRequestItem[];
  notes?: string;
  status?: string;
  applicationDate?: string;
}

// What JobAddDialogComponent actually closes with — a request-shaped value (documents as
// {resumeId, documentType} pairs the user picked), not the display-shaped JobApplicationItem
// the rest of the app reads back from the API.
export interface JobApplicationFormValue {
  id?: string;
  position?: string;
  companyName?: string;
  jobLink?: string;
  roleId?: string;
  documents: JobApplicationDocumentRequestItem[];
  notes?: string;
  status: string;
  applicationDate?: string;
}

export interface DeleteApplicationsPayload{
  ids: string[];
}

export interface JobApplicationStats{
  totalApplications: JobApplicationStatItemDto;
  applied: JobApplicationStatItemDto;
  wishlist: JobApplicationStatItemDto;
  submitted: JobApplicationStatItemDto;
  inProgress: JobApplicationStatItemDto;
  offerReceived: JobApplicationStatItemDto;
  rejected: JobApplicationStatItemDto;
}

export interface JobApplicationStatItemDto
{
    description: string;
    value: number;
}

