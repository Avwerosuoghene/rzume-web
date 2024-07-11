export interface IApiUrlParam {
  name: string,
  value: string
}

export interface IAPIResponse<T> {
  "statusCode": 200,
  "isSuccess": true,
  "errorMessages": [],
  result: {
    message: string,
    content: T
  }
}
