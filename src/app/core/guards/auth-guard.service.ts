import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageData } from '../models/enums/sessionStorage-enums';
import { SessionStorageUtil } from '../services/session-storage-util.service';
import { AuthRoutes, RootRoutes } from '../models/enums/application-routes-enums';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  router = inject(Router);

  canActivate(): boolean {
    const tokenIsActive = !!SessionStorageUtil.getItem(SessionStorageData.authToken);
    if(!tokenIsActive)this.router.navigate([`/${RootRoutes.auth}/${AuthRoutes.signin}`]);
    return tokenIsActive;

  }

  constructor() { }
}
