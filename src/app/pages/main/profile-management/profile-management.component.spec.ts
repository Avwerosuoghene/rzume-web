import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

import { ProfileManagementComponent } from './profile-management.component';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';
import { DocumentHelperService, StorageService } from '../../../core/services';
import { ProfileManagementService } from '../../../core/services/profile-management.service';
import { DialogHelperService } from '../../../core/services/dialog-helper.service';
import { LoaderService } from '../../../core/services/loader.service';
import { UserService } from '../../../core/services/user.service';
import { DocumentHelper } from '../../../core/helpers';
import { PROFILE_TABS } from '../../../core/models/constants/profile.constants';
import { Resume } from '../../../core/models';

describe('ProfileManagementComponent', () => {
  let component: ProfileManagementComponent;
  let fixture: ComponentFixture<ProfileManagementComponent>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let documentHelperSpy: jasmine.SpyObj<DocumentHelperService>;
  let resumes$: BehaviorSubject<Resume[]>;

  function createComponent(queryParams: Record<string, string> = {}): void {
    TestBed.configureTestingModule({
      imports: [ProfileManagementComponent, NoopAnimationsModule],
      providers: [
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
        { provide: DocumentHelperService, useValue: documentHelperSpy },
        { provide: ProfileManagementService, useValue: jasmine.createSpyObj('ProfileManagementService', ['uploadResume', 'deleteResume', 'update', 'uploadProfilePhoto']) },
        { provide: DialogHelperService, useValue: jasmine.createSpyObj('DialogHelperService', ['openSuccessDialog', 'openDeleteConfirmation', 'openInfoDialog']) },
        { provide: LoaderService, useValue: jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: UserService, useValue: jasmine.createSpyObj('UserService', ['refreshActiveUser']) },
        StorageService,
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileManagementComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['track']);
    resumes$ = new BehaviorSubject<Resume[]>([]);
    documentHelperSpy = jasmine.createSpyObj(
      'DocumentHelperService',
      ['getResumes', 'fetchResumes'],
      { resumes$ }
    );
    documentHelperSpy.getResumes.and.returnValue([]);
    spyOn(DocumentHelper, 'getCvUploadLimit').and.returnValue(2);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('default tab', () => {
    beforeEach(() => {
      createComponent();
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should default to the profile tab', () => {
      expect(component.activeTab).toBe(PROFILE_TABS.PROFILE);
    });

    it('should render app-profile-view and not app-documents-view', () => {
      expect(fixture.debugElement.query(By.css('app-profile-view'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-documents-view'))).toBeFalsy();
    });

    it('should render the tab navigation', () => {
      expect(fixture.debugElement.query(By.css('app-tab-navigation'))).toBeTruthy();
    });

    it('should track page view on initialization', () => {
      expect(analyticsServiceSpy.track).toHaveBeenCalledWith('profile_page_loaded');
    });

    it('should fetch resumes when none are cached', () => {
      expect(documentHelperSpy.fetchResumes).toHaveBeenCalled();
    });

    it('should switch to the documents tab on tab change', () => {
      component.onTabChange(PROFILE_TABS.DOCUMENTS);
      fixture.detectChanges();

      expect(component.activeTab).toBe(PROFILE_TABS.DOCUMENTS);
      expect(fixture.debugElement.query(By.css('app-documents-view'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-profile-view'))).toBeFalsy();
    });
  });

  describe('when the documents tab is requested via query param', () => {
    beforeEach(() => {
      createComponent({ tab: PROFILE_TABS.DOCUMENTS });
      fixture.detectChanges();
    });

    it('should activate the documents tab', () => {
      expect(component.activeTab).toBe(PROFILE_TABS.DOCUMENTS);
    });

    it('should render app-documents-view with the resumes and upload limit', () => {
      const documentsView = fixture.debugElement.query(By.css('app-documents-view'));
      expect(documentsView).toBeTruthy();
      expect(documentsView.componentInstance.uploadLimit).toBe(2);
    });
  });

  describe('when an invalid tab query param is supplied', () => {
    beforeEach(() => {
      createComponent({ tab: 'not-a-real-tab' });
      fixture.detectChanges();
    });

    it('should fall back to the profile tab', () => {
      expect(component.activeTab).toBe(PROFILE_TABS.PROFILE);
    });
  });

  describe('when resumes are already cached', () => {
    beforeEach(() => {
      documentHelperSpy.getResumes.and.returnValue([{ id: '1' } as Resume]);
      createComponent();
      fixture.detectChanges();
    });

    it('should not re-fetch resumes', () => {
      expect(documentHelperSpy.fetchResumes).not.toHaveBeenCalled();
    });
  });
});
