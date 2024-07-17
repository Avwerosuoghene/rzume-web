import { IApiUrlParam } from "./utilities-interface";

export interface IGetRequestParams{
  apiRoute: string,
  id?: number,
  _params: IApiUrlParam[],
  handleResponse: boolean
}
