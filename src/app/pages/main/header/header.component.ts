import { Component, inject, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { NavigationEnd, Router } from '@angular/router';
import { BorderRadius, User } from '../../../core/models';
import { CoreModules } from '../../../core/modules';
import { StorageService } from '../../../core/services';
import { LoaderService } from '../../../core/services/loader.service';
import { GlobalCircularLoaderComponent } from '../../../components/global-circular-loader/global-circular-loader.component';
import { AuthHelperService } from '../../../core/services/auth-helper.service';
import { CustomSearchInputComponent } from '../../../components/custom-search-input/custom-search-input.component';
import { ScreenManagerService, SearchStateService } from '../../../core/services';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, GlobalCircularLoaderComponent, CustomSearchInputComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  borderRadius = BorderRadius.extraLarge;
  router = inject(Router);
  @Output() sidebarToggle = new EventEmitter<void>();
  activeComponent: string = '';
  userInfo: User | null = null;
  userToken: string | null = null;
  loaderIsActive: boolean = false;
  isMobile: boolean = false;
  private destroy$ = new Subject<void>();

  todaysDate: string = new Date().toDateString();


  constructor(
    private storageService: StorageService,
    private authHelper: AuthHelperService,
    private utilityService: LoaderService,
    private searchStateService: SearchStateService,
    private screenManager: ScreenManagerService
  ) { }


  ngOnInit(): void {
    this.setupScreenManagerSubscription();
    this.getCurrentRoute();
    this.subscribeToRoute();
    this.getUserInfo();
    this.initiateLoader();
  }


  setupScreenManagerSubscription(): void {
    this.screenManager.isMobile$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isMobile => {
      this.isMobile = isMobile;
    });
  }

  initiateLoader() {
    this.utilityService.globalLoaderSubject.subscribe(loaderStatus => {
      this.loaderIsActive = loaderStatus;
    })
  }

  getUserInfo() {
    this.storageService.user$.subscribe(user => {
      this.userInfo = user;

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

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  onSearchChange(searchTerm: string): void {
    this.searchStateService.updateSearchTerm(searchTerm);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
