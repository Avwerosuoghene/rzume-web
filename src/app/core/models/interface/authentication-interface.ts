export interface ISignupPayload {
    email: string,
    password: string
}

export interface ISignupResponse {
  isCreated: boolean
}

export interface IAccountValidationResponse {
  accountActivated: boolean
}
