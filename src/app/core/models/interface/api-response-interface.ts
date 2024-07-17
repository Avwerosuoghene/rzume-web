export interface IAPIResponse<T> {
  "statusCode": number,
  "isSuccess": true,
  "errorMessages": [],
  result: {
    message: string,
    content: T
  }
}
