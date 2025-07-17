export class ApiRoutes {
  private static authRoute = 'api/auth/';
  private static profileManagementRoute = 'api/v1/profilemanagement/';
  private static utilityRoute = 'api/v1/profilemanagement/';

  static user = {
    register: `${this.authRoute}register`,
    login: `${this.authRoute}login`,
    logout: `${this.authRoute}logout`,
    emailToken: `${this.authRoute}generate-email-token`,
    validateToken: `${this.authRoute}validate-user-account`,
    googleSigin: `${this.authRoute}google-signin`,
    getActiveUser: `${this.authRoute}active-user`
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
