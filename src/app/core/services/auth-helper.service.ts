import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthRoutes, RootRoutes } from '../models';
import { AuthenticationService } from './authentication.service';
import { LoaderService } from './loader.service';
import { TokenStorageUtil } from '../helpers/token-storage.util';

@Injectable({
  providedIn: 'root'
})
export class AuthHelperService {
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private loaderService: LoaderService
  ) {}

  private clearBrowserStorage() {
    TokenStorageUtil.removeToken();
  }

  logout(): void {
    this.loaderService.showLoader();
    this.authService.logout()
      .pipe(finalize(() => this.handleLogoutComplete()))
      .subscribe({
        next: () => this.handleLogoutComplete(),
        error: () => this.handleLogoutComplete()
      });
  }

  private handleLogoutComplete(): void {
    this.loaderService.hideLoader();
    this.clearBrowserStorage();
    this.navigateToSignIn();
  }

  private navigateToSignIn(): void {
    this.router.navigate([`/${RootRoutes.auth}/${AuthRoutes.signin}`]);
  }
}