export interface AuthRequest {
  email: string,
  password: string,
  persistSession?: boolean
}

export interface GenerateEmailToken {
  email: string
}


export interface GoogleSignInPayload {
  userToken: string,
}

// Shape of the callback response from Google Identity Services' credential prompt —
// only the field this app actually reads.
export interface GoogleCredentialResponse {
  credential: string;
}


export interface RequestPassResetPayload {
  email: string
}

export interface ResetPassword {
  email: string,
  password: string,
  resetToken: string
}

export interface SignupResponse {
  isCreated: boolean
}

export interface SigninResponse {
  user: User,
  token: string,
  persistSession: boolean
}


export interface ValidateUserResponse {

  message: string,

  user?: User,

  token?: string
}


export interface AccountValidationResponse {
  accountActivated: boolean
}


export interface User {
  firstName?: string,

  lastName?: string,

  userName?: string,

  email: string,

  onboarded?: boolean,


  onBoardingStage: number,

  emailConfirmed: boolean,

  profilePictureUrl?: string,
}



