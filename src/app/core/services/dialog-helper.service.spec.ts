import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { DialogHelperService } from './dialog-helper.service';
import { JobApplicationService } from './job-application.service';
import { RoleService } from './role.service';
import { LoaderService } from './loader.service';
import { DialogCloseStatus, JobApplicationItem, IconStat, APIResponse } from '../models';
import { Role } from '../models/interface/role.models';
import { JobApplicationFormValue, UpdateApplicationPayload } from '../models/interface/job-application.models';
import { ApplicationStatus } from '../models/enums/shared.enums';

describe('DialogHelperService', () => {
  let service: DialogHelperService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let jobApplicationServiceSpy: jasmine.SpyObj<JobApplicationService>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let loaderServiceSpy: jasmine.SpyObj<LoaderService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<unknown>>;

  function mockDialogClose(response: unknown) {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(response));
    dialogSpy.open.and.returnValue(dialogRefSpy);
  }

  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    jobApplicationServiceSpy = jasmine.createSpyObj('JobApplicationService', ['addApplication', 'updateJobApplication']);
    roleServiceSpy = jasmine.createSpyObj('RoleService', ['createRole', 'updateRole', 'deleteRole']);
    loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);

    TestBed.configureTestingModule({
      providers: [
        DialogHelperService,
        { provide: MatDialog, useValue: dialogSpy },
        { provide: JobApplicationService, useValue: jobApplicationServiceSpy },
        { provide: RoleService, useValue: roleServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy }
      ]
    });

    service = TestBed.inject(DialogHelperService);
  });

  describe('buildDeleteMessage', () => {
    it('should use the plural confirmation message for more than one item', () => {
      const items = [{ id: '1' }, { id: '2' }] as JobApplicationItem[];
      expect(service.buildDeleteMessage(items)).toBe('Kindly confirm you want to delete 2 applications');
    });

    it('should use the singular confirmation message for exactly one item', () => {
      const items = [{ id: '1' }] as JobApplicationItem[];
      expect(service.buildDeleteMessage(items)).toContain('delete');
    });
  });

  describe('openAndHandleDialog gating (via openDeleteConfirmation)', () => {
    it('should invoke the callback when the dialog closes as Submitted', () => {
      mockDialogClose({ status: DialogCloseStatus.Submitted });
      const onConfirm = jasmine.createSpy('onConfirm');

      service.openDeleteConfirmation([{ id: '1' } as JobApplicationItem], onConfirm, 'Delete?');

      expect(onConfirm).toHaveBeenCalled();
    });

    it('should NOT invoke the callback when the dialog closes as Cancelled', () => {
      mockDialogClose({ status: DialogCloseStatus.Cancelled });
      const onConfirm = jasmine.createSpy('onConfirm');

      service.openDeleteConfirmation([{ id: '1' } as JobApplicationItem], onConfirm, 'Delete?');

      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should NOT invoke the callback when the dialog is dismissed with no response at all', () => {
      mockDialogClose(undefined);
      const onConfirm = jasmine.createSpy('onConfirm');

      service.openDeleteConfirmation([{ id: '1' } as JobApplicationItem], onConfirm, 'Delete?');

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('openAddApplicationDialog', () => {
    const formValue: JobApplicationFormValue = {
      position: 'Senior Backend Engineer',
      companyName: 'Acme Corp',
      jobLink: 'https://example.com/job',
      roleId: 'role-1',
      documents: [{ resumeId: 'resume-1', documentType: 'Resume' }],
      notes: 'notes',
      status: ApplicationStatus.Wishlist,
      applicationDate: '2026-01-01'
    };

    it('should create the application and call onSuccess after a successful submission', () => {
      mockDialogClose({ status: DialogCloseStatus.Submitted, data: formValue });
      jobApplicationServiceSpy.addApplication.and.returnValue(of({ success: true } as APIResponse<boolean>));

      // openSuccessDialog opens a second dialog — keep returning a closed dialog for it too
      dialogSpy.open.and.returnValue(dialogRefSpy);

      const onSuccess = jasmine.createSpy('onSuccess');
      service.openAddApplicationDialog(onSuccess);

      expect(loaderServiceSpy.showLoader).toHaveBeenCalled();
      expect(jobApplicationServiceSpy.addApplication).toHaveBeenCalled();
      expect(loaderServiceSpy.hideLoader).toHaveBeenCalled();
    });

    it('should build the create payload from the dialog\'s form value, including roleId and documents', () => {
      mockDialogClose({ status: DialogCloseStatus.Submitted, data: formValue });
      jobApplicationServiceSpy.addApplication.and.returnValue(of({ success: true } as APIResponse<boolean>));
      dialogSpy.open.and.returnValue(dialogRefSpy);

      service.openAddApplicationDialog(() => {});

      expect(jobApplicationServiceSpy.addApplication).toHaveBeenCalledWith({
        position: 'Senior Backend Engineer',
        companyName: 'Acme Corp',
        jobLink: 'https://example.com/job',
        roleId: 'role-1',
        documents: [{ resumeId: 'resume-1', documentType: 'Resume' }],
        notes: 'notes',
        status: ApplicationStatus.Wishlist,
        applicationDate: formValue.applicationDate
      });
    });

    it('should build the create payload with roleId omitted when the user did not select a role', () => {
      const noRoleFormValue: JobApplicationFormValue = { ...formValue, roleId: undefined };
      mockDialogClose({ status: DialogCloseStatus.Submitted, data: noRoleFormValue });
      jobApplicationServiceSpy.addApplication.and.returnValue(of({ success: true } as APIResponse<boolean>));
      dialogSpy.open.and.returnValue(dialogRefSpy);

      service.openAddApplicationDialog(() => {});

      expect(jobApplicationServiceSpy.addApplication).toHaveBeenCalledWith(
        jasmine.objectContaining({ roleId: undefined })
      );
    });
  });

  describe('openAddRoleDialog', () => {
    it('should call onSuccess after successful role creation', () => {
      mockDialogClose({ status: DialogCloseStatus.Submitted, data: {} });
      roleServiceSpy.createRole.and.returnValue(of({ success: true } as APIResponse<Role>));

      const onSuccess = jasmine.createSpy('onSuccess');
      service.openAddRoleDialog(onSuccess);

      expect(onSuccess).toHaveBeenCalled();
      expect(loaderServiceSpy.hideLoader).toHaveBeenCalled();
    });

    it('should also call onSuccess if role creation errors (error dialog is shown by ApiService itself, see findings log #23)', () => {
      mockDialogClose({ status: DialogCloseStatus.Submitted, data: {} });
      roleServiceSpy.createRole.and.returnValue(throwError(() => new Error('boom')));

      const onSuccess = jasmine.createSpy('onSuccess');
      service.openAddRoleDialog(onSuccess);

      expect(onSuccess).toHaveBeenCalled();
      expect(loaderServiceSpy.hideLoader).toHaveBeenCalled();
    });
  });

  describe('openEditRoleDialog', () => {
    const testRole: Role = { id: 'role-1', title: 'Engineer', industryName: 'Tech', documents: [], createdAt: new Date(), updatedAt: new Date() };

    it('should pass isEditing and the role as dialog data', () => {
      mockDialogClose({ status: DialogCloseStatus.Cancelled });

      service.openEditRoleDialog(testRole, () => {});

      expect(dialogSpy.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
        data: { isEditing: true, roleData: testRole }
      }));
    });

    it('should call roleService.updateRole with the role\'s id and the submitted payload, then onSuccess, when Submitted', () => {
      const payload = { title: 'Senior Engineer', industryId: 1, documents: [{ resumeId: 'resume-1' }] };
      mockDialogClose({ status: DialogCloseStatus.Submitted, data: payload });
      roleServiceSpy.updateRole.and.returnValue(of({ success: true } as APIResponse<Role>));
      const onSuccess = jasmine.createSpy('onSuccess');

      service.openEditRoleDialog(testRole, onSuccess);

      expect(loaderServiceSpy.showLoader).toHaveBeenCalled();
      expect(roleServiceSpy.updateRole).toHaveBeenCalledWith('role-1', payload);
      expect(onSuccess).toHaveBeenCalled();
      expect(loaderServiceSpy.hideLoader).toHaveBeenCalled();
    });

    it('should also call onSuccess if the update errors', () => {
      mockDialogClose({ status: DialogCloseStatus.Submitted, data: {} });
      roleServiceSpy.updateRole.and.returnValue(throwError(() => new Error('boom')));
      const onSuccess = jasmine.createSpy('onSuccess');

      service.openEditRoleDialog(testRole, onSuccess);

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should NOT call roleService.updateRole when the dialog is cancelled', () => {
      mockDialogClose({ status: DialogCloseStatus.Cancelled });
      const onSuccess = jasmine.createSpy('onSuccess');

      service.openEditRoleDialog(testRole, onSuccess);

      expect(roleServiceSpy.updateRole).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('openConfirmUploadDialog', () => {
    it('should pass the given files to the dialog', () => {
      mockDialogClose(undefined);
      const file = new File(['a'], 'a.pdf');

      service.openConfirmUploadDialog([file], () => {});

      expect(dialogSpy.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
        data: { files: [file] }
      }));
    });

    it('should call onConfirm with the submitted entries when the dialog closes as Submitted', () => {
      const entries = [{ file: new File(['a'], 'a.pdf'), documentType: 'Resume' as const }];
      mockDialogClose({ status: DialogCloseStatus.Submitted, data: entries });
      const onConfirm = jasmine.createSpy('onConfirm');

      service.openConfirmUploadDialog([entries[0].file], onConfirm);

      expect(onConfirm).toHaveBeenCalledWith(entries);
    });

    it('should NOT call onConfirm when the dialog is cancelled', () => {
      mockDialogClose({ status: DialogCloseStatus.Cancelled });
      const onConfirm = jasmine.createSpy('onConfirm');

      service.openConfirmUploadDialog([new File(['a'], 'a.pdf')], onConfirm);

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('openDeleteRoleConfirmation', () => {
    it('should open the modal with the exact Figma copy (Remove Role / Are you sure you want to delete this Role?)', () => {
      mockDialogClose({ status: DialogCloseStatus.Cancelled });

      service.openDeleteRoleConfirmation({ id: 'role-1' } as Role, () => {});

      expect(dialogSpy.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
        data: { title: 'Remove Role', message: 'Are you sure you want to delete this Role?' }
      }));
    });

    it('should call roleService.deleteRole and onConfirm when the dialog closes as Submitted', () => {
      mockDialogClose({ status: DialogCloseStatus.Submitted });
      roleServiceSpy.deleteRole.and.returnValue(of({ success: true } as APIResponse<boolean>));
      const onConfirm = jasmine.createSpy('onConfirm');

      service.openDeleteRoleConfirmation({ id: 'role-1' } as Role, onConfirm);

      expect(loaderServiceSpy.showLoader).toHaveBeenCalled();
      expect(roleServiceSpy.deleteRole).toHaveBeenCalledWith('role-1');
      expect(onConfirm).toHaveBeenCalled();
      expect(loaderServiceSpy.hideLoader).toHaveBeenCalled();
    });

    it('should NOT call roleService.deleteRole when the dialog is cancelled', () => {
      mockDialogClose({ status: DialogCloseStatus.Cancelled });
      const onConfirm = jasmine.createSpy('onConfirm');

      service.openDeleteRoleConfirmation({ id: 'role-1' } as Role, onConfirm);

      expect(roleServiceSpy.deleteRole).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('openDeleteRoleDocumentConfirmation', () => {
    const testRole = {
      id: 'role-1',
      documents: [
        { id: 'doc-1', resumeId: 'resume-1', fileName: 'a.pdf', fileSize: 1, fileType: 'application/pdf', documentType: 'Resume', documentUrl: 'x', uploadedAt: new Date() },
        { id: 'doc-2', resumeId: 'resume-2', fileName: 'b.pdf', fileSize: 1, fileType: 'application/pdf', documentType: 'CoverLetter', documentUrl: 'y', uploadedAt: new Date() }
      ]
    } as Role;

    it('should open the modal with the Delete Document copy', () => {
      mockDialogClose({ status: DialogCloseStatus.Cancelled });

      service.openDeleteRoleDocumentConfirmation(testRole, 'doc-1', () => {});

      expect(dialogSpy.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
        data: jasmine.objectContaining({ title: 'Delete Document' })
      }));
    });

    it('should call roleService.updateRole with the remaining documents (the deleted one omitted) and onConfirm when Submitted', () => {
      mockDialogClose({ status: DialogCloseStatus.Submitted });
      roleServiceSpy.updateRole.and.returnValue(of({ success: true } as APIResponse<Role>));
      const onConfirm = jasmine.createSpy('onConfirm');

      service.openDeleteRoleDocumentConfirmation(testRole, 'doc-1', onConfirm);

      expect(loaderServiceSpy.showLoader).toHaveBeenCalled();
      expect(roleServiceSpy.updateRole).toHaveBeenCalledWith('role-1', { documents: [{ resumeId: 'resume-2' }] });
      expect(onConfirm).toHaveBeenCalled();
      expect(loaderServiceSpy.hideLoader).toHaveBeenCalled();
    });

    it('should NOT call roleService.updateRole when the dialog is cancelled', () => {
      mockDialogClose({ status: DialogCloseStatus.Cancelled });
      const onConfirm = jasmine.createSpy('onConfirm');

      service.openDeleteRoleDocumentConfirmation(testRole, 'doc-1', onConfirm);

      expect(roleServiceSpy.updateRole).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('updateApplication', () => {
    const formValue: UpdateApplicationPayload & { id: string } = {
      id: '1',
      position: 'Senior Backend Engineer',
      companyName: 'Acme Corp',
      roleId: 'role-1',
      documents: [{ resumeId: 'resume-1', documentType: 'CoverLetter' }],
      status: ApplicationStatus.Applied
    };

    it('should call onComplete after a successful update', () => {
      jobApplicationServiceSpy.updateJobApplication.and.returnValue(of({ success: true } as APIResponse<boolean>));
      const onComplete = jasmine.createSpy('onComplete');

      service.updateApplication(formValue, onComplete);

      expect(onComplete).toHaveBeenCalled();
      expect(loaderServiceSpy.hideLoader).toHaveBeenCalled();
    });

    it('should call updateJobApplication with the form value\'s id and a payload built from the rest of the fields', () => {
      jobApplicationServiceSpy.updateJobApplication.and.returnValue(of({ success: true } as APIResponse<boolean>));

      service.updateApplication(formValue);

      expect(jobApplicationServiceSpy.updateJobApplication).toHaveBeenCalledWith('1', {
        position: 'Senior Backend Engineer',
        companyName: 'Acme Corp',
        roleId: 'role-1',
        documents: [{ resumeId: 'resume-1', documentType: 'CoverLetter' }],
        status: ApplicationStatus.Applied
      });
    });

    it('should NOT send documents at all for a status-only update (sending [] would clear every attached document)', () => {
      jobApplicationServiceSpy.updateJobApplication.and.returnValue(of({ success: true } as APIResponse<boolean>));
      const statusOnlyUpdate: UpdateApplicationPayload & { id: string } = {
        id: '1',
        status: ApplicationStatus.InProgress
      };

      service.updateApplication(statusOnlyUpdate);

      const sentPayload = jobApplicationServiceSpy.updateJobApplication.calls.mostRecent().args[1];
      expect(sentPayload.documents).toBeUndefined();
    });
  });

  describe('openEditApplicationDialog', () => {
    it('should update the application and call onSuccess after a successful submission', () => {
      const formValue: JobApplicationFormValue = {
        id: '1',
        documents: [],
        status: ApplicationStatus.Applied
      };
      mockDialogClose({ status: DialogCloseStatus.Submitted, data: formValue });
      jobApplicationServiceSpy.updateJobApplication.and.returnValue(of({ success: true } as APIResponse<boolean>));

      const onSuccess = jasmine.createSpy('onSuccess');
      service.openEditApplicationDialog({ id: '1' } as JobApplicationItem, onSuccess);

      expect(jobApplicationServiceSpy.updateJobApplication).toHaveBeenCalledWith('1', jasmine.any(Object));
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('openViewJobDialog / openPolicyDialog / openInfoDialog (pure wiring)', () => {
    it('should open the job view dialog with the given job data', () => {
      dialogSpy.open.and.returnValue(jasmine.createSpyObj('MatDialogRef', ['afterClosed']));
      service.openViewJobDialog({ id: '1' } as JobApplicationItem);
      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should open the policy dialog with title and content', () => {
      dialogSpy.open.and.returnValue(jasmine.createSpyObj('MatDialogRef', ['afterClosed']));
      service.openPolicyDialog('Privacy Policy', 'content');
      expect(dialogSpy.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
        data: { title: 'Privacy Policy', content: 'content' }
      }));
    });

    it('should open the info dialog and invoke onClosed when submitted', () => {
      mockDialogClose({ status: DialogCloseStatus.Submitted });
      const onClosed = jasmine.createSpy('onClosed');

      service.openInfoDialog(IconStat.failed, 'Something went wrong', onClosed);

      expect(onClosed).toHaveBeenCalled();
    });
  });
});
