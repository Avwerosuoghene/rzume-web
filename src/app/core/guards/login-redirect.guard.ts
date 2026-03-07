import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MainRoutes, RootRoutes } from '../models/enums/application.routes.enums';
import { UserService } from '../services/user.service';
import { TokenStorageUtil } from '../helpers/token-storage.util';
import { LoaderService } from '../services/loader.service';

@Injectable({
  providedIn: 'root'
})
export class LoginRedirectGuard {

  constructor(
    private userService: UserService,
    private router: Router,
    private loaderService: LoaderService
  ) { }

  async canActivate(): Promise<boolean> {
    if (!TokenStorageUtil.hasToken()) {
      return true;
    }

    try {
      this.loaderService.showLoader();
      const isAuthenticated = await this.userService.getActiveUser();
      
      if (isAuthenticated) {
        await this.navigateToDashboard();
        return false;
      }
      
      return true;
    } catch (error) {
      return true;
    } finally {
      this.loaderService.hideLoader();
    }
  }

  private async navigateToDashboard(): Promise<void> {
    const dashboardRoute = `/${RootRoutes.main}/${MainRoutes.dashboard}`;
    await this.router.navigate([dashboardRoute]);
  }
}
