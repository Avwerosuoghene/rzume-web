import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RootRoutes, MainRoutes } from '../models/enums/application.routes.enums';
import { TokenValidationService } from './token-validation.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInitializerService {
  
  constructor(
    private router: Router,
    private tokenValidationService: TokenValidationService,
    private configService: ConfigService
  ) {}

  async initialize(): Promise<void> {
    await this.configService.waitForConfig();

    const { token, isValid } = await this.tokenValidationService.getAndValidateToken();
    
    if (isValid) {
      await this.navigateToDashboard();
    }
  }

  private async navigateToDashboard(): Promise<void> {
    const dashboardRoute = `/${RootRoutes.main}/${MainRoutes.dashboard}`;
    await this.router.navigate([dashboardRoute]);
  }
}
