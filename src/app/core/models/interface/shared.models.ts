import { HttpHeaders } from "@angular/common/http";
import { DialogCloseStatus } from "../enums/dialog.enums";
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

export interface DialogCloseResponse<DialogData> {
  data: DialogData,
  status: DialogCloseStatus
}


export interface PaginatedItem<ItemType> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: ItemType[];
}

export interface GetRequestOptions {
  route: string;
  handleResponse: boolean;
  params?: ApiUrlParam[];
  headers?: HttpHeaders;
  withBearer?: boolean;
}









