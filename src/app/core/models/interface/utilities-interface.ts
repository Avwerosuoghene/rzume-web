export interface IApiUrlParam {
  name: string,
  value: string
}

export interface IAPIResponse<T> {
  "statusCode": number,
  "isSuccess": true,
  "errorMessages": [],
  result: {
    message: string,
    content: T
  }
}


export interface IErrorResponse
{
  "statusCode": number,
  "errorMessages": Array<any>,
}

export interface IGetRequestParams{
  apiRoute: string,
  id?: number,
  _params: IApiUrlParam[],
  handleResponse: boolean
}
