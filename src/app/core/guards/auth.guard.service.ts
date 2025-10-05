import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageUtil } from '../helpers/session-storage.util';
import { AuthRoutes, RootRoutes } from '../models/enums/application.routes.enums';
import { APIResponse, ErrorResponse, INACTIVE_USER, SessionStorageKeys, User } from '../models';
import { AuthenticationService, ProfileManagementService, StorageService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  userToken: string | null = null;

  constructor(
    private authService: AuthenticationService,
    private storageService: StorageService,
    private profileService: ProfileManagementService,
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
      if (isActive) {
        this.getSubscriptionFeatures();
      }
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

  private getSubscriptionFeatures(): void {
    this.profileService.getSubscriptionFeatures().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.storageService.setSubscriptionFeatures(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to fetch subscription features:', error);
      }
    });
  }
}
