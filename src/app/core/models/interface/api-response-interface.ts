import { IUser } from "./user-model-interface"

export interface IAPIResponse<T> {
  "statusCode": number,
  "isSuccess": true,
  "errorMessages": [],
  result: {
    message: string,
    content: T
  }
}


export interface ISignupResponse {
  isCreated: boolean
}

export interface ISigninResponse {
  user?: IUser,
  token?: string,
  message: string,
  emailConfirmed: boolean
}


export interface IValidateUserResponse {

  message: string,

  user?: IUser,

  token?: string
}


export interface IAccountValidationResponse {
  accountActivated: boolean
}

export interface IOnboardUserResponse {
  
}
