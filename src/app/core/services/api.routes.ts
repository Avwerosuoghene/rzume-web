export class ApiRoutes
{
  private static userRoute = 'api/v1/user/';
  private static profileManagementRoute = 'api/v1/profilemanagement/';
  private static utilityRoute = 'api/v1/profilemanagement/';

  public static readonly user = {
    register: `${this.userRoute}register`,
    login: `${this.userRoute}login`,
  }


  static profileManagement = {
    uploads: `${this.profileManagementRoute}upload`,
    onboarding: `${this.profileManagementRoute}user-onboarding`,
  }

  static utility = {

  }
}
