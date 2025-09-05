import { ApplicationStatus } from "../enums";

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
  applicationDate?: string;
}

export interface UpdateJobApplicationPayload {
  position?: string;
  companyName?: string;
  jobLink?: string;
  resumeLink?: string;
  status?: ApplicationStatus;
}
