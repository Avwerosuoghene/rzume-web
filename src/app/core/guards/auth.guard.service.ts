import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageUtil } from '../helpers/session-storage.util';
import { AuthRoutes, RootRoutes } from '../models/enums/application.routes.enums';
import { SessionStorageKeys } from '../models';
import { LoaderService, UserService } from '../services';
import { AuthHelperService } from '../services/auth-helper.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  userToken: string | null = null;

  constructor(
    private userService: UserService,
    private authHelper: AuthHelperService,
    private router: Router,
    private loaderService: LoaderService
  ) { }

  async canActivate(): Promise<boolean> {
    this.loaderService.showLoader();
    const tokenIsActive = await this.getActiveToken();
    this.loaderService.hideLoader();
    return tokenIsActive;
  }

  private async getActiveToken(): Promise<boolean> {
    this.userToken = SessionStorageUtil.getItem(SessionStorageKeys.authToken);
    if (!this.userToken) {
      await this.router.navigate([`/${RootRoutes.auth}/${AuthRoutes.signin}`]);
      return false;
    }
    try {
      const isActive = await this.userService.getActiveUser(this.userToken);
      return isActive;
    } catch (error) {
      console.error(error);
      this.authHelper.logout();
      return false;
    }
  }
}
