import { IconStat } from "../enums/shared.enums";
import { User } from "./authentication.interface";

export interface GetRequestParams {
  apiRoute: string,
  id?: number,
  _params?: ApiUrlParam[],
  handleResponse: boolean
}

export interface APIResponse<T> {
  statusCode: number,
  isSuccess: boolean,
  errorMessages: Array<string>,
  result: {
    message: string,
    content: T
  }
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

export interface FilterOption{
  value: string,
  label: string
}

export interface DialogCloseResp {

  applicationStat : IconStat,
  message: string
}









