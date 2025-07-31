import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageUtil } from '../helpers';
import { APIResponse, ErrorResponse, GoogleSignInPayload, RootRoutes, SessionStorageKeys, SigninResponse } from '../models';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  constructor(private router: Router, private authService: AuthenticationService) { }

  static loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-js')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-js';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve();
      };
      script.onerror = (error) => {
        reject(error);
      };
      document.head.appendChild(script);
    });
  }




  handleCredentialResponse(
    response: any,
    onSuccess: (success: boolean, token?: string) => void,
    onError: (error: ErrorResponse) => void
  ): void {
    const googleSigninPayload: GoogleSignInPayload = { userToken: response.credential };

    this.authService.googleLogin(googleSigninPayload).subscribe({
      next: ({ success, data }: APIResponse<SigninResponse>) => {
        onSuccess(success, data?.token);
      },
      error: (error: ErrorResponse) => {
        onError(error);
      },
    });
  }

  handleGoogleAuthResponse(success: boolean, token?: string): void {
    if (token) {
      SessionStorageUtil.setItem(SessionStorageKeys.authToken, token);
    }

    if (success) {
      this.router.navigate([`/${RootRoutes.main}`]);
    }
  }

}
