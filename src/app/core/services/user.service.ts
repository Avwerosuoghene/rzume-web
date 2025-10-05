import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { StorageService } from './storage.service';
import { APIResponse, User, INACTIVE_USER } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private authService: AuthenticationService,
    private storageService: StorageService
  ) { }

  getActiveUser(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.authService.getActiveUser(token).subscribe({
        next: (activeUserResponse: APIResponse<User>) => {
          if (activeUserResponse.success && activeUserResponse.data) {
            this.storageService.setUser(activeUserResponse.data);
            resolve(true);
          } else {
            reject(new Error(INACTIVE_USER));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  refreshActiveUser(token: string): Observable<User | null> {
    return this.authService.getActiveUser(token).pipe(
      map((response: APIResponse<User>) => {
        if (response.success && response.data) {
          this.storageService.setUser(response.data);
          return response.data;
        }
        return null;
      })
    );
  }
}
