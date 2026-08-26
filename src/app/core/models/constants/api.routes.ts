export class ApiRoutes {
  private static authRoute = 'api/auth';
  private static profileManagementRoute = 'api/profilemanagement';
  private static jobApplicationRoute = 'api/jobapplications';
  private static rolesRoute = 'api/roles';

  static auth = {
    register: `${this.authRoute}/register`,
    login: `${this.authRoute}/signin`,
    logout: `${this.authRoute}/signout`,
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
    resume: `${this.profileManagementRoute}/resume`,
    resumes: `${this.profileManagementRoute}/resumes`,
    subscriptionFeatures: `${this.profileManagementRoute}/subscription-features`,
    feedback: `${this.profileManagementRoute}/feedback`
  }

  static roles = {
    base: `${this.rolesRoute}`,
    stats: `${this.rolesRoute}/stats`,
  }

  static industries = {
    base: 'api/industries'
  }

  static utility = {

  }
}
