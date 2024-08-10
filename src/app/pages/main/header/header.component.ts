import { Component, inject, OnInit } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { NavigationEnd, Router } from '@angular/router';
import { CoreModules } from '../../../core/modules/core-modules';
import { IUser } from '../../../core/models/interface/user-model-interface';
import { StorageService } from '../../../core/services/storage.service';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { ISignOutPayload } from '../../../core/models/interface/api-requests-interface';
import { IAPIResponse } from '../../../core/models/interface/api-response-interface';
import { RootRoutes } from '../../../core/models/enums/application-routes-enums';
import { IErrorResponse } from '../../../core/models/interface/errors-interface';
import { SessionStorageData } from '../../../core/models/enums/sessionStorage-enums';
import { SessionStorageUtil } from '../../../core/services/session-storage-util.service';
import { UtilsService } from '../../../core/services/utils.service';

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
  userInfo: IUser | null = null;
  userToken: string | null = null;
  loaderIsActive: boolean = false;


  constructor(private storageService: StorageService, private authService: AuthenticationService, private utilityService: UtilsService) {

  }


  ngOnInit(): void {
    this.getCurrentRoute();
    this.subsrcibeToRoute();
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
    const logoutPayload: ISignOutPayload = {
      email: this.userInfo!.email
    }
    this.utilityService.headerLoader.next(true);


    this.authService.logout(logoutPayload).subscribe({
      next: (response: IAPIResponse<null>) => {

        this.utilityService.headerLoader.next(false);

        if (response.isSuccess === true)  {
          this.clearBrowserStorage();

          this.router.navigate([`/${RootRoutes.auth}`])
        };

      },
      error: (error: IErrorResponse) => {
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

  subsrcibeToRoute(): void {


    this.router.events
      .subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.getCurrentRoute();

        }
      });
  }


}
