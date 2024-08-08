import { IApiUrlParam } from "./utilities-interface";

export interface IGetRequestParams{
  apiRoute: string,
  id?: number,
  _params?: IApiUrlParam[],
  handleResponse: boolean
}


export interface ISignupSiginPayload {
  email: string,
  password: string
}

export interface IGoogleSignInPayload {
  userToken: string,
}

export  interface IOnboardUserPayload<T>
{
    onBoardingStage: number,

    onboardUserPayload: T,

    userMail: string

}


export interface IOnboardUserFirstStagePayload {
  userName: string
}

export interface IRequestPassResetPayload {
  email: string
}

export interface IResetPassword {
  email: string,
  password : string,
  resetToken: string
}


