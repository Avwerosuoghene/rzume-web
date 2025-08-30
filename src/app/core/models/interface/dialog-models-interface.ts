import { StatusIcon } from "../types/shared.types";

export interface InfoDialogData {
  infoMessage: string;
  statusIcon: StatusIcon;
}

export interface AddJobDialogData {
  isEditing: boolean;
  jobApplicationData?: any;
}

export interface JobStatChangeDialogData {
  status: string
}


