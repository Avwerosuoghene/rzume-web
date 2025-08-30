import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthRoutes, RootRoutes } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthHelperService {
  constructor(private router: Router) {}

  private clearBrowserStorage() {
    sessionStorage.clear();
    localStorage.clear();
  }

  logout() {
    this.clearBrowserStorage();
    this.router.navigate([`/${RootRoutes.auth}/${AuthRoutes.signin}`]);
  }
}