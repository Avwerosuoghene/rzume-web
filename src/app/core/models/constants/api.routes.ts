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
    getActiveUser: `${this.authRoute}/me`,
    forgotPassword: `${this.authRoute}/forgot-password`,
    resetPassword: `${this.authRoute}/reset-password`,
  }

  static jobApplication = {
    base: `${this.jobApplicationRoute}`,
    stats: `${this.jobApplicationRoute}/stats`,
  }


  static profileManagement = {
    updatePicture: `${this.profileManagementRoute}/update-picture`,
    update: `${this.profileManagementRoute}/update`,
  }

  static utility = {

  }
}
