export class ApiRoutes {
  private static authRoute = 'api/auth';
  private static profileManagementRoute = 'api/profilemanagement';
  private static jobApplicationRoute = 'api/jobapplications';

  static auth = {
    register: `${this.authRoute}/register`,
    login: `${this.authRoute}/signin`,
    generateEmailToken: `${this.authRoute}/resend-confirmation-email`,
    validateToken: `${this.authRoute}/confirm-email`,
    googleSigin: `${this.authRoute}/google-signin`,
    getActiveUser: `${this.authRoute}/me`
  }

  static jobApplication = {
    base: `${this.jobApplicationRoute}`,
  }


  static profileManagement = {
    uploads: `${this.profileManagementRoute}/upload`,
    update: `${this.profileManagementRoute}/update`,
    requestPassReset: `${this.profileManagementRoute}/request-password-reset`,
    resetPassword: `${this.profileManagementRoute}/reset-password`,
  }

  static utility = {

  }
}
