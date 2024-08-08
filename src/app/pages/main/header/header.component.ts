import { Component, inject, OnInit } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { NavigationEnd, Router } from '@angular/router';
import { CoreModules } from '../../../core/modules/core-modules';
import { IUser } from '../../../core/models/interface/user-model-interface';
import { StorageService } from '../../../core/services/storage.service';

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


  constructor(private storageService: StorageService) {

  }

  ngOnInit(): void {
    this.getCurrentRoute();
    this.subsrcibeToRoute();
    this.getUserInfo();
  }

  getUserInfo() {
    this.storageService.user$.subscribe(user => {
      this.userInfo = user;
      console.log(this.userInfo);

    });
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
