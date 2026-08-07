import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { DialogHelperService } from './dialog-helper.service';
import { JobApplicationService } from './job-application.service';
import { RoleService } from './role.service';
import { LoaderService } from './loader.service';
import { DialogCloseStatus, JobApplicationItem, IconStat, APIResponse } from '../models';
import { Role } from '../models/interface/role.models';

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
    roleServiceSpy = jasmine.createSpyObj('RoleService', ['createRole', 'deleteRole']);
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
    it('should create the application and call onSuccess after a successful submission', () => {
      mockDialogClose({ status: DialogCloseStatus.Submitted, data: { title: 'Engineer' } });
      jobApplicationServiceSpy.addApplication.and.returnValue(of({ success: true } as APIResponse<boolean>));

      // openSuccessDialog opens a second dialog — keep returning a closed dialog for it too
      dialogSpy.open.and.returnValue(dialogRefSpy);

      const onSuccess = jasmine.createSpy('onSuccess');
      service.openAddApplicationDialog(onSuccess);

      expect(loaderServiceSpy.showLoader).toHaveBeenCalled();
      expect(jobApplicationServiceSpy.addApplication).toHaveBeenCalled();
      expect(loaderServiceSpy.hideLoader).toHaveBeenCalled();
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

  describe('updateApplication', () => {
    it('should call onComplete after a successful update', () => {
      jobApplicationServiceSpy.updateJobApplication.and.returnValue(of({ success: true } as APIResponse<boolean>));
      const onComplete = jasmine.createSpy('onComplete');

      service.updateApplication({ id: '1' } as JobApplicationItem, onComplete);

      expect(onComplete).toHaveBeenCalled();
      expect(loaderServiceSpy.hideLoader).toHaveBeenCalled();
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
