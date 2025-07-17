import { Component, inject, OnInit } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { NavigationEnd, Router } from '@angular/router';
import { APIResponse, AuthRoutes, ErrorResponse, RootRoutes, SignOutPayload, User } from '../../../core/models';
import { CoreModules } from '../../../core/modules';
import { AuthenticationService, StorageService } from '../../../core/services';
import { LayoutStateService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  router = inject(Router);
  activeComponent: string = '';
  userInfo: User | null = null;
  userToken: string | null = null;
  loaderIsActive: boolean = false;


  constructor(private storageService: StorageService, private authService: AuthenticationService, private utilityService: LayoutStateService) {

  }


  ngOnInit(): void {
    this.getCurrentRoute();
    this.subscribeToRoute();
    this.getUserInfo();
    this.initiateLoader();
  }

  initiateLoader() {
    this.utilityService.headerLoader.subscribe(loaderStatus => {
      this.loaderIsActive = loaderStatus;
    })
  }

  getUserInfo() {
    this.storageService.user$.subscribe(user => {
      this.userInfo = user;
      console.log(this.userInfo);

    });
  }

  logout(){
    const logoutPayload: SignOutPayload = {
      email: this.userInfo!.email
    }
    this.utilityService.headerLoader.next(true);


    this.authService.logout(logoutPayload).subscribe({
      next: (response: APIResponse<null>) => {

        this.utilityService.headerLoader.next(false);

        if (response.isSuccess === true)  {
          this.clearBrowserStorage();

          this.router.navigate([`/${RootRoutes.auth}/${AuthRoutes.signin}`])
        };

      },
      error: (error: ErrorResponse) => {
        this.utilityService.headerLoader.next(false);

        console.log(error);
      }
    })
  }

  clearBrowserStorage() {
    sessionStorage.clear();
    localStorage.clear();
  }


  getCurrentRoute(): void {
    const currentUrl = this.router.url;
    if (!currentUrl) return;

    const urlSplit = currentUrl.split('/');
    const activeElement = urlSplit[2].split('-');

    this.activeComponent = activeElement.join(' ');
  }

  subscribeToRoute(): void {


    this.router.events
      .subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.getCurrentRoute();

        }
      });
  }


}
