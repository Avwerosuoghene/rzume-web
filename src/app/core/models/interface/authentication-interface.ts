import { IUser } from "./user-model-interface"

export interface ISignupSiginPayload {
    email: string,
    password: string
}

export interface ISignupResponse {
  isCreated: boolean
}

export interface IAccountValidationResponse {
  accountActivated: boolean
}


export interface ISigninResponse {
  user?: IUser,
  token?: string,
  message: string,
  emailConfirmed: boolean
}

export interface IValidateUser {

  message: string,

  user?: string,

  token?: string
}
