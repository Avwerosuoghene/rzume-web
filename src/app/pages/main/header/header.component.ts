import { Component, inject, OnInit } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { NavigationEnd, Router } from '@angular/router';
import { User } from '../../../core/models';
import { CoreModules } from '../../../core/modules';
import { StorageService } from '../../../core/services';
import { LoaderService } from '../../../core/services/loader.service';
import { GlobalCircularLoaderComponent } from '../../../components/global-circular-loader/global-circular-loader.component';
import { AuthHelperService } from '../../../core/services/auth-helper.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, GlobalCircularLoaderComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  router = inject(Router);
  activeComponent: string = '';
  userInfo: User | null = null;
  userToken: string | null = null;
  loaderIsActive: boolean = false;


  constructor(private storageService: StorageService, private authHelper: AuthHelperService, private utilityService: LoaderService) {

  }


  ngOnInit(): void {
    this.getCurrentRoute();
    this.subscribeToRoute();
    this.getUserInfo();
    this.initiateLoader();
  }

  initiateLoader() {
    this.utilityService.globalLoaderSubject.subscribe(loaderStatus => {
      this.loaderIsActive = loaderStatus;
    })
  }

  getUserInfo() {
    this.storageService.user$.subscribe(user => {
      this.userInfo = user;
      console.log(this.userInfo);

    });
  }

  logout() {
    this.authHelper.logout();
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
