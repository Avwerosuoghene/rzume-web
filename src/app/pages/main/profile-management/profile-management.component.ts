import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TabNavigationComponent } from './tab-navigation/tab-navigation.component';
import { ProfileViewComponent } from './profile-view/profile-view.component';
import { DocumentsViewComponent } from './documents-view/documents-view.component';
import { PROFILE_TABS, PROFILE_TAB_CONFIGS, ProfileTabConfig } from '../../../core/models/constants/profile.constants';
import { Resume, DEFAULT_CV_UPLOAD_LIMIT } from '../../../core/models';
import { DocumentHelperService } from '../../../core/services';
import { Subject, takeUntil } from 'rxjs';
import { DocumentHelper } from '../../../core/helpers';


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
  resumes: Resume[] = [];
  activeTab: string = PROFILE_TABS.PROFILE;
  cvUploadLimit: number = DEFAULT_CV_UPLOAD_LIMIT;
  private destroy$ = new Subject<void>();


  constructor(
    private documentHelper: DocumentHelperService,
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {
    this.initializeActiveTab();
    this.setupResumeSubscription();
    this.checkAndFetchResumes();
    this.setupCvUploadLimit();
  }

  private setupResumeSubscription(): void {
    this.documentHelper.resumes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(resumes => this.resumes = resumes);
  }

  private checkAndFetchResumes(): void {
    const currentResumes = this.documentHelper.getResumes();
    if (currentResumes.length === 0) {
      this.documentHelper.fetchResumes();
    }
  }


  private initializeActiveTab(): void {
    const tabFromQuery = this.route.snapshot.queryParams['tab'];
    if (tabFromQuery && this.isValidTab(tabFromQuery)) {
      this.activeTab = tabFromQuery;
    } else {
      this.activeTab = PROFILE_TABS.PROFILE;
    }
  }

  private isValidTab(tab: string): boolean {
    return Object.values(PROFILE_TABS).includes(tab as PROFILE_TABS);
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
  }

  isTabActive(tabId: PROFILE_TABS): boolean {
    return this.activeTab === tabId;
  }

  private setupCvUploadLimit(): void {
    this.cvUploadLimit = DocumentHelper.getCvUploadLimit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
