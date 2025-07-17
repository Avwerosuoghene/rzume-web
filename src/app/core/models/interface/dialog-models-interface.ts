import { StatusIcon } from "../types/shared.types";

export interface InfoDialogData {
  infoMessage: string;
  statusIcon: StatusIcon;
}

export interface AddJobDialogData {
  isEditing: boolean;
}

export interface JobStatChangeDialogData {
  status: string
}


