import { IconStat } from "../enums/shared.enums";
import { User } from "./authentication.models";

export interface GetRequestParams {
  apiRoute: string,
  id?: number,
  _params?: ApiUrlParam[],
  handleResponse: boolean
}

export interface APIResponse<T = undefined> {
  statusCode: number,
  success: boolean,
  message: string,
  data?: T
}

export interface ErrorResponse {
  statusCode: number,
  errorMessage: string,
}

export interface ApiUrlParam {
  name: string,
  value: string
}

export interface SessionStorageData {
  userMail: string;
  userData: User;
  authToken: string;
}

export interface FilterOption {
  value: string,
  label: string
}

export interface DialogCloseResponse {

  applicationStat: IconStat,
  message: string
}









