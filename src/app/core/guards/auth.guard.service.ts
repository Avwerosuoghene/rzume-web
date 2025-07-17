import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageUtil } from '../helpers/session-storage.util';
import { AuthRoutes, RootRoutes } from '../models/enums/application.routes.enums';
import { APIResponse, User, ErrorResponse, SessionStorageKeys } from '../models';
import { AuthenticationService, StorageService } from '../services';


@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  private router = inject(Router);

  userToken: string | null = null;

  constructor(private authService: AuthenticationService, private storageService: StorageService) {}

  async canActivate(): Promise<boolean> {
    const tokenIsActive = await this.getActiveToken();
    return tokenIsActive;
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
      await this.router.navigate([`/${RootRoutes.auth}/${AuthRoutes.signin}`]);
      return false;
    }

  }
private getActiveUser(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.authService.getActiveUser(this.userToken!).subscribe({
        next: (activeUserResponse: APIResponse<{user: User, message: string}>) => {
          if (activeUserResponse.isSuccess) {
            this.storageService.setUser(activeUserResponse.result.content.user);
            resolve(true);
          } else {
            reject(new Error('User is not active'));
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
