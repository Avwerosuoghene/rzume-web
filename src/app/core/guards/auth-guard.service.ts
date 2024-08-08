import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageData } from '../models/enums/sessionStorage-enums';
import { SessionStorageUtil } from '../services/session-storage-util.service';
import { AuthRoutes, RootRoutes } from '../models/enums/application-routes-enums';
import { StorageService } from '../services/storage.service'; // Import StorageService
import { AuthenticationService } from '../services/authentication.service';
import { IAPIResponse } from '../models/interface/api-response-interface';
import { IErrorResponse } from '../models/interface/errors-interface';
import { IUser } from '../models/interface/user-model-interface';

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
    this.userToken = SessionStorageUtil.getItem(SessionStorageData.authToken);
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
        next: (activeUserResponse: IAPIResponse<{user: IUser, message: string}>) => {
          if (activeUserResponse.isSuccess) {
            this.storageService.setUser(activeUserResponse.result.content.user);
            resolve(true);
          } else {
            reject(new Error('User is not active'));
          }
        },
        error: (error: IErrorResponse) => {
          console.log(error);
          reject(error);
        }
      });
    });
  }
}
