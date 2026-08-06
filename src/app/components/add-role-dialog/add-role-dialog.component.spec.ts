import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AddRoleDialogComponent } from './add-role-dialog.component';
import { DocumentHelperService } from '../../core/services/document-helper.service';
import { IndustryService } from '../../core/services/industry.service';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { Resume } from '../../core/models/interface/profile.models';
import { Industry } from '../../core/models/interface/industry.models';

describe('AddRoleDialogComponent', () => {
  let component: AddRoleDialogComponent;
  let fixture: ComponentFixture<AddRoleDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<AddRoleDialogComponent>>;
  let documentHelperSpy: jasmine.SpyObj<DocumentHelperService>;
  let industryServiceSpy: jasmine.SpyObj<IndustryService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockResume: Resume = {
    id: 'res-1',
    fileName: 'my-resume.pdf',
    uploadedAt: new Date('2026-01-01'),
    url: 'http://example.com/resume.pdf',
    fileType: 'application/pdf'
  };

  const mockResume2: Resume = {
    id: 'res-2',
    fileName: 'cover-letter.pdf',
    uploadedAt: new Date('2026-01-02'),
    url: 'http://example.com/cover.pdf',
    fileType: 'application/pdf'
  };

  const mockIndustries: Industry[] = [
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Healthcare' }
  ];

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    documentHelperSpy = jasmine.createSpyObj(
      'DocumentHelperService',
      ['getResumes', 'fetchResumes'],
      { resumes$: of([mockResume, mockResume2]) }
    );
    documentHelperSpy.getResumes.and.returnValue([mockResume, mockResume2]);
    industryServiceSpy = jasmine.createSpyObj('IndustryService', ['getIndustries']);
    industryServiceSpy.getIndustries.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: mockIndustries }));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AddRoleDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: DocumentHelperService, useValue: documentHelperSpy },
        { provide: IndustryService, useValue: industryServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AddRoleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load industries on init', () => {
    expect(component.industries).toEqual(mockIndustries);
  });

  it('should not fetch resumes on init when resumes already exist', () => {
    expect(documentHelperSpy.fetchResumes).not.toHaveBeenCalled();
  });

  it('should fetch resumes on init when none are already loaded', () => {
    documentHelperSpy.getResumes.and.returnValue([]);
    const freshFixture = TestBed.createComponent(AddRoleDialogComponent);
    freshFixture.detectChanges();

    expect(documentHelperSpy.fetchResumes).toHaveBeenCalled();
  });

  it('should start with an invalid form and submit disabled', () => {
    expect(component.roleForm.invalid).toBe(true);
    expect(component.isSubmitDisabled).toBe(true);
  });

  it('should still disable submit when the form is valid but no documents are selected', () => {
    component.jobRoleControl.setValue('Software Engineer');
    component.industryControl.setValue('1');

    expect(component.roleForm.valid).toBe(true);
    expect(component.isSubmitDisabled).toBe(true);
  });

  it('should enable submit once the form is valid and at least one document is selected', () => {
    component.jobRoleControl.setValue('Software Engineer');
    component.industryControl.setValue('1');
    component.toggleDocument(mockResume);

    expect(component.isSubmitDisabled).toBe(false);
  });

  describe('document selection', () => {
    it('should select a document that is not yet selected', () => {
      component.toggleDocument(mockResume);
      expect(component.isDocumentSelected(mockResume.id)).toBe(true);
    });

    it('should deselect a document that is already selected', () => {
      component.toggleDocument(mockResume);
      component.toggleDocument(mockResume);
      expect(component.isDocumentSelected(mockResume.id)).toBe(false);
    });

    it('should not add more documents once the max limit is reached', () => {
      const thirdResume: Resume = { ...mockResume, id: 'res-3' };
      component.toggleDocument(mockResume);
      component.toggleDocument(mockResume2);
      component.toggleDocument(thirdResume);

      expect(component.selectedDocuments.length).toBe(2);
      expect(component.canAddMoreDocuments).toBe(false);
      expect(component.isDocumentSelected('res-3')).toBe(false);
    });

    it('should remove a document by index', () => {
      component.toggleDocument(mockResume);
      component.toggleDocument(mockResume2);

      component.removeDocument(0);

      expect(component.selectedDocuments).toEqual([mockResume2]);
    });
  });

  describe('search filtering', () => {
    it('should return all resumes when there is no search query', () => {
      expect(component.filteredResumes).toEqual([mockResume, mockResume2]);
    });

    it('should filter resumes by file name, case-insensitively', () => {
      component.documentSearchQuery = 'COVER';
      expect(component.filteredResumes).toEqual([mockResume2]);
    });
  });

  describe('dropdown', () => {
    it('should toggle the dropdown open and closed', () => {
      component.toggleDropdown();
      expect(component.isDropdownOpen).toBe(true);

      component.toggleDropdown();
      expect(component.isDropdownOpen).toBe(false);
    });

    it('should clear the search query when the dropdown closes', () => {
      component.toggleDropdown();
      component.documentSearchQuery = 'cover';

      component.toggleDropdown();

      expect(component.documentSearchQuery).toBe('');
    });

    it('should close the dropdown and clear the query via closeDropdown()', () => {
      component.toggleDropdown();
      component.documentSearchQuery = 'cover';

      component.closeDropdown();

      expect(component.isDropdownOpen).toBe(false);
      expect(component.documentSearchQuery).toBe('');
    });
  });

  describe('onSubmit', () => {
    it('should not close the dialog when the form is invalid', () => {
      component.onSubmit();
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should not close the dialog when no documents are selected', () => {
      component.jobRoleControl.setValue('Software Engineer');
      component.industryControl.setValue('1');

      component.onSubmit();

      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should close the dialog with a Submitted status and the built payload', () => {
      component.jobRoleControl.setValue('Software Engineer');
      component.industryControl.setValue('1');
      component.toggleDocument(mockResume);

      component.onSubmit();

      expect(dialogRefSpy.close).toHaveBeenCalledWith({
        status: DialogCloseStatus.Submitted,
        data: {
          title: 'Software Engineer',
          industryId: 1,
          documents: [{ resumeId: 'res-1', documentType: 'application/pdf' }]
        }
      });
    });

    it('should fall back to application/pdf when a selected document has no fileType', () => {
      const resumeWithoutType: Resume = { ...mockResume, id: 'res-4', fileType: undefined };
      component.jobRoleControl.setValue('Software Engineer');
      component.industryControl.setValue('1');
      component.toggleDocument(resumeWithoutType);

      component.onSubmit();

      expect(dialogRefSpy.close).toHaveBeenCalledWith(jasmine.objectContaining({
        data: jasmine.objectContaining({
          documents: [{ resumeId: 'res-4', documentType: 'application/pdf' }]
        })
      }));
    });
  });

  it('should close the dialog with a Cancelled status on cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ status: DialogCloseStatus.Cancelled });
  });

  it('should navigate to the documents tab and close the dialog as cancelled', () => {
    component.navigateToDocumentsPage();

    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/main/profile-management'],
      { queryParams: { tab: jasmine.any(String) } }
    );
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ status: DialogCloseStatus.Cancelled });
  });

  it('should clean up subscriptions on destroy without throwing', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  describe('UI parity with job-add-dialog (see ui-parity-fix diagnosis)', () => {
    it('should wrap form fields in .form-input-container, so the .form-select CSS override in styles.scss actually applies to the industry select', () => {
      const select = fixture.nativeElement.querySelector('select');
      expect(select).not.toBeNull();
      expect(select!.closest('.form-input-container')).not.toBeNull();
    });

    it('should configure a placeholder for the industry select, matching the pattern job-add-dialog\'s resumeConfig already uses', () => {
      expect(component.industryConfig.placeholder).toBeTruthy();
    });

    it('should give the documents multiselect trigger a real layout (currently unstyled — no CSS for it exists anywhere in the app)', () => {
      const trigger = fixture.nativeElement.querySelector('.multiselect-trigger');
      expect(trigger).not.toBeNull();
      expect(getComputedStyle(trigger).display).toBe('flex');
    });

    it('should render the open documents panel via CDK Overlay, not nested inside the scrollable dialog content, so mat-dialog-content\'s overflow:auto cannot clip it (bug: user had to scroll the modal to see the options)', () => {
      component.toggleDropdown();
      fixture.detectChanges();

      const panelInsideDialog = fixture.nativeElement.querySelector('.multiselect-panel');
      const panelInOverlay = document.querySelector('.cdk-overlay-container .multiselect-panel');

      expect(panelInsideDialog).toBeNull();
      expect(panelInOverlay).not.toBeNull();
    });
  });
});
