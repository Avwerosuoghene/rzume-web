import { ApplicationStatus } from '../enums/shared.enums';

export interface DropdownOption<T = string> {
  name: string;
  value: T;
}

export type ApplicationStatusOption = DropdownOption<ApplicationStatus>;
