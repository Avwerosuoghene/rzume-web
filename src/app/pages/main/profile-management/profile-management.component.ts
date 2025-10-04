import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabNavigationComponent } from './tab-navigation/tab-navigation.component';
import { ProfileViewComponent } from './profile-view/profile-view.component';
import { DocumentsViewComponent } from './documents-view/documents-view.component';
import { PROFILE_TABS, PROFILE_TAB_CONFIGS, ProfileTabConfig } from '../../../core/models/constants/profile.constants';


@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [
    CommonModule,
    TabNavigationComponent,
    ProfileViewComponent,
    DocumentsViewComponent
  ],
  templateUrl: './profile-management.component.html',
  styleUrl: './profile-management.component.scss'
})
export class ProfileManagementComponent implements OnInit {
  readonly PROFILE_TABS = PROFILE_TABS;
  readonly tabConfigs: ProfileTabConfig[] = PROFILE_TAB_CONFIGS;
  
  activeTab: string = PROFILE_TABS.PROFILE;

  ngOnInit(): void {
    this.initializeActiveTab();
  }


  private initializeActiveTab(): void {
    this.activeTab = PROFILE_TABS.PROFILE;
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId ;
  }

  isTabActive(tabId: PROFILE_TABS): boolean {
    return this.activeTab === tabId;
  }
}
