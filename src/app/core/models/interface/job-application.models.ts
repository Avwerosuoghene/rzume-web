import { ApplicationStatus } from "../enums";

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
