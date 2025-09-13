import { IconStat } from "../enums";
import { JobApplicationItem } from "./job-application.models";

export interface InfoDialogData {
  infoMessage: string;
  statusIcon: IconStat;
}

export interface AddJobDialogData {
  isEditing: boolean;
  jobApplicationData?: JobApplicationItem;
}

export interface JobStatChangeDialogData {
  jobItem: JobApplicationItem
}


