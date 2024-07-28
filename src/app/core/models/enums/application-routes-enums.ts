export enum RootRoutes {
  auth = 'auth',
  main = 'main',
}

export enum AuthRoutes {
  signup = 'register',
  signin = 'login',
  onboard = 'onboard',
  passwordReset = 'password-reset/:token',
  emailConfirmation = 'email-confirmation',
  forgotPass= 'request-pass-reset'

}

export enum MainRoutes {
  dashboard = 'dasboard',
  profileManagement = 'profile-management'
}
