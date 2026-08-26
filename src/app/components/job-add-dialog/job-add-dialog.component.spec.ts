import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { JobAddDialogComponent } from './job-add-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RoleStateService } from '../../core/services/role-state.service';
import { RoleService } from '../../core/services/role.service';
import { Role } from '../../core/models/interface/role.models';
import { JobApplicationItem, JobApplicationFormValue } from '../../core/models/interface/job-application.models';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { ApplicationStatus } from '../../core/models/enums/shared.enums';
import { DOCUMENT_TYPES } from '../../core/models/constants/profile.constants';
import { APIResponse } from '../../core/models';

describe('JobAddDialogComponent', () => {
  let component: JobAddDialogComponent;
  let fixture: ComponentFixture<JobAddDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<JobAddDialogComponent>>;
  let roleStateService: RoleStateService;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const role1: Role = {
    id: 'role-1',
    title: 'Senior Backend Engineer',
    industryName: 'Technology',
    documents: [
      { id: 'rd-1', resumeId: 'resume-1', fileName: 'resume.pdf', fileSize: 100, fileType: 'application/pdf', documentType: DOCUMENT_TYPES.RESUME, documentUrl: 'http://x/resume.pdf', uploadedAt: new Date() },
      { id: 'rd-2', resumeId: 'resume-2', fileName: 'cover.pdf', fileSize: 100, fileType: 'application/pdf', documentType: DOCUMENT_TYPES.COVER_LETTER, documentUrl: 'http://x/cover.pdf', uploadedAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  function setupComponent(dialogData: unknown) {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    roleServiceSpy = jasmine.createSpyObj('RoleService', ['getRoles']);
    roleServiceSpy.getRoles.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: { count: 0, roles: [] } } as APIResponse<{ count: number; roles: Role[] }>));

    TestBed.configureTestingModule({
      imports: [JobAddDialogComponent, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: Router, useValue: routerSpy },
        { provide: RoleService, useValue: roleServiceSpy },
        provideNativeDateAdapter()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JobAddDialogComponent);
    component = fixture.componentInstance;
    roleStateService = TestBed.inject(RoleStateService);
  }

  describe('create mode', () => {
    beforeEach(() => {
      setupComponent({ isEditing: false, jobApplicationData: null });
      roleStateService.setRoles([role1]);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should be invalid without selecting a role (role is required)', () => {
      component.applicationFormGroup.patchValue({ companyName: 'Acme', position: 'Engineer' });
      expect(component.applicationFormGroup.valid).toBe(false);
    });

    it('should be valid once a role is selected alongside the other required fields', () => {
      component.applicationFormGroup.patchValue({ companyName: 'Acme', position: 'Engineer', roleId: 'role-1' });
      expect(component.applicationFormGroup.valid).toBe(true);
    });

    it('should not render the removed autofill banner copy anywhere in the template', () => {
      expect(fixture.nativeElement.textContent).not.toContain('Autofill from a saved role');
      expect(fixture.nativeElement.textContent).not.toContain('Select a role to pre-fill');
    });

    it('should render only the role select before a role is chosen', () => {
      const roleSelect: HTMLElement = fixture.nativeElement.querySelector('#roleId');
      const companyInput: HTMLElement = fixture.nativeElement.querySelector('#companyName');
      const submitButton: HTMLElement = fixture.nativeElement.querySelector('#add_job_btn');

      expect(roleSelect).toBeTruthy();
      expect(companyInput).toBeFalsy();
      expect(submitButton).toBeFalsy();
    });

    describe('once a role is selected', () => {
      beforeEach(() => {
        component.applicationFormGroup.get('roleId')?.setValue('role-1');
        fixture.detectChanges();
      });

      it('should reveal the rest of the form', () => {
        const companyInput: HTMLElement = fixture.nativeElement.querySelector('#companyName');
        const submitButton: HTMLElement = fixture.nativeElement.querySelector('#add_job_btn');

        expect(companyInput).toBeTruthy();
        expect(submitButton).toBeTruthy();
      });

      it('should render the role select before the company name field', () => {
        const roleSelect: HTMLElement = fixture.nativeElement.querySelector('#roleId');
        const companyInput: HTMLElement = fixture.nativeElement.querySelector('#companyName');

        const position = roleSelect.compareDocumentPosition(companyInput);
        expect(!!(position & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
      });
    });

    it('should pre-fill the position field with the selected role\'s title when position is empty', () => {
      component.applicationFormGroup.get('roleId')?.setValue('role-1');

      expect(component.applicationFormGroup.get('position')?.value).toBe('Senior Backend Engineer');
    });

    it('should NOT overwrite an already-typed position when a role is selected', () => {
      component.applicationFormGroup.get('position')?.setValue('Custom Title');

      component.applicationFormGroup.get('roleId')?.setValue('role-1');

      expect(component.applicationFormGroup.get('position')?.value).toBe('Custom Title');
    });

    it('should NOT auto-select any of the role\'s documents when a role is selected — the user picks manually', () => {
      component.applicationFormGroup.get('roleId')?.setValue('role-1');

      expect(component.preSuggestedDocuments).toEqual([]);
      expect(component.documents).toEqual([]);
    });

    it('should make the role\'s documents available to pick from without pre-selecting them', () => {
      component.applicationFormGroup.get('roleId')?.setValue('role-1');
      fixture.detectChanges();

      expect(component.roleDocumentResumes.map(r => r.id)).toEqual(['resume-1', 'resume-2']);
      expect(component.documents).toEqual([]);
    });

    it('should update the tracked documents when the document picker emits a change', () => {
      component.onDocumentsChange([{ resumeId: 'resume-1', documentType: DOCUMENT_TYPES.RESUME }]);

      expect(component.documents).toEqual([{ resumeId: 'resume-1', documentType: DOCUMENT_TYPES.RESUME }]);
    });

    it('should close with a Submitted status and a payload including roleId and documents on addApplication()', () => {
      component.applicationFormGroup.patchValue({ companyName: 'Acme', position: 'Engineer', roleId: 'role-1' });
      component.onDocumentsChange([{ resumeId: 'resume-1', documentType: DOCUMENT_TYPES.RESUME }]);

      component.addApplication();

      const closeArg = mockDialogRef.close.calls.mostRecent().args[0] as { status: DialogCloseStatus; data: JobApplicationFormValue };
      expect(closeArg.status).toBe(DialogCloseStatus.Submitted);
      expect(closeArg.data.companyName).toBe('Acme');
      expect(closeArg.data.position).toBe('Engineer');
      expect(closeArg.data.roleId).toBe('role-1');
      expect(closeArg.data.documents).toEqual([{ resumeId: 'resume-1', documentType: DOCUMENT_TYPES.RESUME }]);
    });

    it('should close the dialog and navigate to the documents tab when an upload is requested', () => {
      component.onUploadRequested();

      expect(mockDialogRef.close).toHaveBeenCalledWith({ status: DialogCloseStatus.Cancelled });
      expect(routerSpy.navigate).toHaveBeenCalled();
    });
  });

  describe('document picker built directly from the selected role\'s own documents (bug: "role has 2 documents, only 1 shown")', () => {
    beforeEach(() => {
      setupComponent({ isEditing: false, jobApplicationData: null });
      roleStateService.setRoles([role1]);
      fixture.detectChanges();
    });

    it('should offer no resumes to attach before a role is selected', () => {
      expect(component.roleDocumentResumes).toEqual([]);
    });

    it('should offer exactly the selected role\'s own documents once one is chosen — no cross-referencing a separate resume list', () => {
      component.applicationFormGroup.get('roleId')?.setValue('role-1');
      fixture.detectChanges();

      expect(component.roleDocumentResumes.map(r => r.id)).toEqual(['resume-1', 'resume-2']);
    });

    it('should map each role document into a Resume-shaped object carrying its own file details', () => {
      component.applicationFormGroup.get('roleId')?.setValue('role-1');
      fixture.detectChanges();

      expect(component.roleDocumentResumes).toEqual([
        {
          id: 'resume-1', fileName: 'resume.pdf', fileSize: 100, fileType: 'application/pdf',
          url: 'http://x/resume.pdf', uploadedAt: role1.documents[0].uploadedAt, documentType: DOCUMENT_TYPES.RESUME
        },
        {
          id: 'resume-2', fileName: 'cover.pdf', fileSize: 100, fileType: 'application/pdf',
          url: 'http://x/cover.pdf', uploadedAt: role1.documents[1].uploadedAt, documentType: DOCUMENT_TYPES.COVER_LETTER
        }
      ]);
    });

    it('should pass the role\'s documents into the document picker component', () => {
      component.applicationFormGroup.get('roleId')?.setValue('role-1');
      fixture.detectChanges();

      const picker = fixture.debugElement.nativeElement.querySelector('app-job-application-document-picker');
      expect(picker).toBeTruthy();
      expect(component.roleDocumentResumes.length).toBe(2);
    });
  });

  describe('edit mode', () => {
    const jobData: JobApplicationItem = {
      id: 'app-1',
      position: 'Backend Engineer',
      companyName: 'Acme',
      roleId: 'role-1',
      resumeId: 'resume-1',
      coverLetter: {
        id: 'doc-1', resumeId: 'resume-2', documentType: DOCUMENT_TYPES.COVER_LETTER,
        fileName: 'cover.pdf', fileType: 'application/pdf', fileSize: 100,
        uploadedAt: new Date(), documentUrl: 'http://x/cover.pdf'
      },
      status: ApplicationStatus.Applied
    };

    beforeEach(() => {
      setupComponent({ isEditing: true, jobApplicationData: jobData });
      roleStateService.setRoles([role1]);
      fixture.detectChanges();
    });

    it('should pre-populate the role select from the existing application\'s roleId', () => {
      expect(component.applicationFormGroup.get('roleId')?.value).toBe('role-1');
    });

    it('should reveal the rest of the form since the existing application already has a role', () => {
      const companyInput: HTMLElement = fixture.nativeElement.querySelector('#companyName');
      expect(companyInput).toBeTruthy();
    });

    it('should build the documents list from the legacy resumeId and the new coverLetter field', () => {
      expect(component.documents).toEqual([
        { resumeId: 'resume-1', documentType: DOCUMENT_TYPES.RESUME },
        { resumeId: 'resume-2', documentType: DOCUMENT_TYPES.COVER_LETTER }
      ]);
    });

    it('should include the existing application id in the payload on addApplication()', () => {
      component.addApplication();

      const closeArg = mockDialogRef.close.calls.mostRecent().args[0] as { data: JobApplicationFormValue };
      expect(closeArg.data.id).toBe('app-1');
    });
  });

  describe('fetching roles (see: "roles only available after visiting the Roles page then back")', () => {
    it('should fetch roles on init when RoleStateService has none loaded yet', () => {
      setupComponent({ isEditing: false, jobApplicationData: null });
      // deliberately NOT seeding roleStateService — this is the exact real-world state a user
      // is in when they open "Add Job Application" from the dashboard without ever having
      // visited the Roles page in this session.
      fixture.detectChanges();

      expect(roleServiceSpy.getRoles).toHaveBeenCalled();
    });

    it('should NOT re-fetch roles on init when RoleStateService is already populated', () => {
      setupComponent({ isEditing: false, jobApplicationData: null });
      roleStateService.setRoles([role1]);

      fixture.detectChanges();

      expect(roleServiceSpy.getRoles).not.toHaveBeenCalled();
    });

    it('should populate the role select once the fetch resolves and RoleStateService updates', () => {
      setupComponent({ isEditing: false, jobApplicationData: null });
      // RoleService is mocked wholesale here, so its real tap()-driven side-effect (updating
      // RoleStateService) has to be simulated explicitly — this mirrors what the real service
      // does internally on a successful fetch.
      roleServiceSpy.getRoles.and.callFake(() => {
        roleStateService.setRoles([role1]);
        return of({
          success: true, statusCode: 200, message: 'ok', data: { count: 1, roles: [role1] }
        } as APIResponse<{ count: number; roles: Role[] }>);
      });

      fixture.detectChanges();

      expect(component.roles).toEqual([role1]);
      expect(component.roleSelectConfig.options.map(o => o.value)).toContain('role-1');
    });

    it('should stay in sync with RoleStateService if roles change after init (e.g. another part of the app populated it)', () => {
      setupComponent({ isEditing: false, jobApplicationData: null });
      fixture.detectChanges();
      expect(component.roles).toEqual([]);

      roleStateService.setRoles([role1]);

      expect(component.roles).toEqual([role1]);
    });
  });
});
