import { ApplicationStatus } from "../enums";
import { Resume } from "./profile.models";

export interface JobApplicationItem {
  id: string;
  position?: string;
  companyName?: string;
  userId?: string;
  applicationDate?: Date;
  jobLink?: string;
  resume?: Resume;
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
  resumeId?: string;
  notes?: string;
  status: ApplicationStatus;
  applicationDate?: Date;
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

