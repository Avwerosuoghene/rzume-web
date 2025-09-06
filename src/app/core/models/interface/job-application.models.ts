import { ApplicationStatus } from "../enums";

export interface JobApplicationItem {
  id: string;
  position?: string;
  companyName?: string;
  userId?: string;
  applicationDate?: string;
  jobLink?: string;
  resumeLink?: string;
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
  resumeLink?: string;
  status: ApplicationStatus;
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

