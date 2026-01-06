import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthRoutes, RootRoutes } from '../models/enums/application.routes.enums';
import { LoaderService, UserService } from '../services';
import { AuthHelperService } from '../services/auth-helper.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

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
    try {
      const isValid = await this.userService.getActiveUser();
      return isValid;
    } catch (error) {
      await this.navigateToSignIn();
      return false;
    }
  }

  private async navigateToSignIn(): Promise<void> {
    const signInRoute = `/${RootRoutes.auth}/${AuthRoutes.signin}`;
    await this.router.navigate([signInRoute]);
  }
}
