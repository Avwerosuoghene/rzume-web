import { ApplicationStatus } from "../models";
import { APPLICATION_STATUS_OPTIONS } from "../models/constants/application-status-options.constants";


export class ApplicationUtil {
  

  static getDisplayName(status: ApplicationStatus | string): string {
    const statusOption = APPLICATION_STATUS_OPTIONS.find(option => option.value === status);
    return statusOption ? statusOption.name : status as string;
  }

  static getAllOptions() {
    return APPLICATION_STATUS_OPTIONS;
  }
}
