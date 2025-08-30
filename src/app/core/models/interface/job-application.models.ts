import { ApplicationStatus } from "../enums";
import { PaginatedItem } from "./shared.models";

export interface JobApplicationItem {
  id: string;
  position: string;
  companyName: string;
  userId: string;
  applicationDate: string;
  jobLink: string;
  resumeLink: string;
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
  position: string;
  companyName: string;
  jobLink?: string;
  resumeLink?: string;
  status: ApplicationStatus;
}

export interface UpdateJobApplicationPayload {
  position?: string;
  companyName?: string;
  jobLink?: string;
  resumeLink?: string;
  status?: ApplicationStatus;
}
