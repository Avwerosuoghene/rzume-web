import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationExtras } from '@angular/router';
import { RootRoutes } from '../models/enums/application.routes.enums';

@Injectable({ providedIn: 'root' })
export class RoutingUtilService {
  constructor(private router: Router, private location: Location) {}

  navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(commands, extras);
  }

  navigateToMain(route: string = '', extras?: NavigationExtras): Promise<boolean> {
    return this.navigate([`/${RootRoutes.main}`, ...route.split('/').filter(Boolean)], extras);
  }

  navigateToAuth(route: string = '', extras?: NavigationExtras): Promise<boolean> {
    return this.navigate([`/${RootRoutes.auth}`, ...route.split('/').filter(Boolean)], extras);
  }

  navigateBack(): void {
    this.location.back();
  }

  getCurrentUrl(): string {
    return this.router.url;
  }
}