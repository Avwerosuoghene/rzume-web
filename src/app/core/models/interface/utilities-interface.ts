import { IUser } from "./user-model-interface";

export interface IApiUrlParam {
  name: string,
  value: string
}

export interface SessionStorageData {
  userMail: string;
  userData: IUser;
  authToken: string;
}

export interface FilterOption{
  value: string,
  label: string
}

