import { ApplicationStatus } from "../enums";
import { PaginatedItem } from "./shared.models";

export interface JobApplicationItem {
  id: string;
  companyName: string;
  position: string;
  status: string;
  applicationDate: string;
  location: string;
  notes: string;
}


export interface JobApplicationFilter {
  status?: ApplicationStatus;
  companyName?: string;
  position?: string;
  startDate?: Date;
  endDate?: Date;
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
