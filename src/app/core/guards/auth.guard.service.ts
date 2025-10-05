import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageUtil } from '../helpers/session-storage.util';
import { AuthRoutes, RootRoutes } from '../models/enums/application.routes.enums';
import { APIResponse, ErrorResponse, INACTIVE_USER, SessionStorageKeys, User } from '../models';
import { AuthenticationService, StorageService } from '../services';
import { AuthHelperService } from '../services/auth-helper.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  userToken: string | null = null;

  constructor(
    private authService: AuthenticationService,
    private authHelper: AuthHelperService,
    private storageService: StorageService,
    private router: Router
  ) { }

  async canActivate(): Promise<boolean> {
    const tokenIsActive = await this.getActiveToken();
    return true;
  }

  private async getActiveToken(): Promise<boolean> {
    this.userToken = SessionStorageUtil.getItem(SessionStorageKeys.authToken);
    if (!this.userToken) {
      await this.router.navigate([`/${RootRoutes.auth}/${AuthRoutes.signin}`]);
      return false;
    }
    try {
      const isActive = await this.getActiveUser();
      return isActive;
    } catch (error) {
      console.error(error);
      this.authHelper.logout();
      return false;
    }

  }
private getActiveUser(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.authService.getActiveUser(this.userToken!).subscribe({
        next: (activeUserResponse: APIResponse<User>) => {
          if (activeUserResponse.success && activeUserResponse.data) {
            this.storageService.setUser(activeUserResponse.data);
            resolve(true);
          } else {
            reject(new Error(INACTIVE_USER));
          }
        },
        error: (error: ErrorResponse) => {
          console.log(error);
          reject(error);
        }
      });
    });
  }
}
