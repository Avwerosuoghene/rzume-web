export class ApiRoutes
{
  private static userRoute = 'api/v1/user/';
  private static profileManagementRoute = 'api/v1/profilemanagement/';
  private static utilityRoute = 'api/v1/profilemanagement/';

   static  user = {
    register: `${this.userRoute}register`,
    login: `${this.userRoute}login`,
    emailToken: `${this.userRoute}generate-email-token`,
    validateToken: `${this.userRoute}validate-user-account`,
    googleSigin:  `${this.userRoute}google-signin`,
    getActiveUser:  `${this.userRoute}active-user`
  }


  static profileManagement = {
    uploads: `${this.profileManagementRoute}upload`,
    onboarding: `${this.profileManagementRoute}user-onboarding`,
    requestPassReset: `${this.profileManagementRoute}request-password-reset`,
    resetPassword: `${this.profileManagementRoute}reset-password`,
  }

  static utility = {

  }
}
