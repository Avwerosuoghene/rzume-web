import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MainRoutes, RootRoutes } from '../models/enums/application.routes.enums';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class LoginRedirectGuard {

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  async canActivate(): Promise<boolean> {
    try {
      const isAuthenticated = await this.userService.getActiveUser();
      
      if (isAuthenticated) {
        await this.navigateToDashboard();
        return false;
      }
      
      return true;
    } catch (error) {
      return true;
    }
  }

  private async navigateToDashboard(): Promise<void> {
    const dashboardRoute = `/${RootRoutes.main}/${MainRoutes.dashboard}`;
    await this.router.navigate([dashboardRoute]);
  }
}
