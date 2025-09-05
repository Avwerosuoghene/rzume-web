import { IconStat } from "../enums";

export interface InfoDialogData {
  infoMessage: string;
  statusIcon: IconStat;
}

export interface AddJobDialogData {
  isEditing: boolean;
  jobApplicationData?: any;
}

export interface JobStatChangeDialogData {
  status: string
}


