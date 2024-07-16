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

export interface IUser {
  firstName? : string,

  lastName?: string ,

  userName?: string,

  email: string,

  onboarded?: boolean,


  onboardingStage: number,

  emailConfirmed: boolean
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
