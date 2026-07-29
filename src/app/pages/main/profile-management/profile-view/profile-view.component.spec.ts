import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfileViewComponent } from './profile-view.component';
import { ProfileManagementService } from '../../../../core/services/profile-management.service';
import { DialogHelperService } from '../../../../core/services/dialog-helper.service';
import { UserService } from '../../../../core/services/user.service';
import { StorageService } from '../../../../core/services';
import { TokenStorageUtil } from '../../../../core/helpers/token-storage.util';
import { User } from '../../../../core/models';
import { ProfilePhotoUploadResult, UpdateProfilePayload } from '../../../../core/models/interface/profile.models';

describe('ProfileViewComponent', () => {
  let component: ProfileViewComponent;
  let fixture: ComponentFixture<ProfileViewComponent>;
  let profileServiceSpy: jasmine.SpyObj<ProfileManagementService>;
  let dialogHelperSpy: jasmine.SpyObj<DialogHelperService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let storageService: StorageService;

  let mockUser: User;

  beforeEach(async () => {
    // Fresh object per test: ProfileViewComponent mutates `currentUser` in place
    // (see handlePhotoUploadResponse/handleProfileUpdateResponse), so reusing one shared
    // const across tests would leak mutations from one test into the next.
    mockUser = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'ada@example.com',
      onBoardingStage: 1
    } as User;

    profileServiceSpy = jasmine.createSpyObj('ProfileManagementService', ['update', 'uploadProfilePhoto']);
    dialogHelperSpy = jasmine.createSpyObj('DialogHelperService', ['openSuccessDialog']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['refreshActiveUser']);

    await TestBed.configureTestingModule({
      imports: [ProfileViewComponent],
      providers: [
        StorageService,
        { provide: ProfileManagementService, useValue: profileServiceSpy },
        { provide: DialogHelperService, useValue: dialogHelperSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    storageService = TestBed.inject(StorageService);
    fixture = TestBed.createComponent(ProfileViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('populating the form from the shared user store', () => {
    it('should populate the form when a user is emitted', () => {
      fixture.detectChanges();
      storageService.setUser(mockUser);

      expect(component.profileForm.value.firstName).toBe('Ada');
      expect(component.profileForm.value.lastName).toBe('Lovelace');
      expect(component.profileForm.value.userName).toBe('ada');
      expect(component.currentUser).toEqual(mockUser);
    });

    it('should not attempt to populate the form when the user is null', () => {
      fixture.detectChanges();
      expect(() => storageService.setUser(null)).not.toThrow();
      expect(component.currentUser).toBeNull();
    });

    it('should stop reacting to user store updates after the component is destroyed', () => {
      fixture.detectChanges();
      storageService.setUser(mockUser);
      fixture.destroy();

      storageService.setUser({ ...mockUser, firstName: 'Changed' });

      expect(component.currentUser?.firstName).toBe('Ada');
    });
  });

  describe('getFieldError', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return an empty string when the control has not been touched', () => {
      expect(component.getFieldError('firstName')).toBe('');
    });

    it('should return the correct required message for firstName (a camelCase field)', () => {
      component.profileForm.get('firstName')?.setValue('');
      component.profileForm.get('firstName')?.markAsTouched();
      expect(component.getFieldError('firstName')).toBe('First name is required');
    });

    it('should return the correct required message for lastName', () => {
      component.profileForm.get('lastName')?.setValue('');
      component.profileForm.get('lastName')?.markAsTouched();
      expect(component.getFieldError('lastName')).toBe('Last name is required');
    });

    it('should return the correct required message for userName', () => {
      component.profileForm.get('userName')?.setValue('');
      component.profileForm.get('userName')?.markAsTouched();
      expect(component.getFieldError('userName')).toBe('Username is required');
    });

    it('should return the correct minlength message for a camelCase field', () => {
      component.profileForm.get('firstName')?.setValue('A');
      component.profileForm.get('firstName')?.markAsTouched();
      expect(component.getFieldError('firstName')).toBe('First name must be at least 2 characters');
    });

    it('should return the correct maxlength message for a camelCase field', () => {
      component.profileForm.get('userName')?.setValue('a'.repeat(31));
      component.profileForm.get('userName')?.markAsTouched();
      expect(component.getFieldError('userName')).toBe('Username cannot exceed 30 characters');
    });

    it('should return an empty string for a control with no errors', () => {
      component.profileForm.get('firstName')?.setValue('Valid Name');
      component.profileForm.get('firstName')?.markAsTouched();
      expect(component.getFieldError('firstName')).toBe('');
    });
  });

  describe('onPhotoSelected', () => {
    beforeEach(() => {
      fixture.detectChanges();
      storageService.setUser(mockUser);
    });

    it('should set isPhotoUploading during the upload and reset it on completion', () => {
      const result: ProfilePhotoUploadResult = { profilePictureUrl: 'http://example.com/new.jpg', success: true };
      profileServiceSpy.uploadProfilePhoto.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: result }));
      userServiceSpy.refreshActiveUser.and.returnValue(of(mockUser));

      component.onPhotoSelected(new File(['a'], 'photo.png'));

      expect(component.isPhotoUploading).toBe(false);
    });

    it('should update the current user photo url and show a success dialog on success', () => {
      const result: ProfilePhotoUploadResult = { profilePictureUrl: 'http://example.com/new.jpg', success: true };
      profileServiceSpy.uploadProfilePhoto.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: result }));
      userServiceSpy.refreshActiveUser.and.returnValue(of(mockUser));

      component.onPhotoSelected(new File(['a'], 'photo.png'));

      expect(component.currentUser?.profilePictureUrl).toBe('http://example.com/new.jpg');
      expect(dialogHelperSpy.openSuccessDialog).toHaveBeenCalled();
    });

    it('should not update the user or show a dialog when the response reports failure', () => {
      profileServiceSpy.uploadProfilePhoto.and.returnValue(of({ success: false, statusCode: 400, message: 'failed', data: undefined as unknown as ProfilePhotoUploadResult }));

      component.onPhotoSelected(new File(['a'], 'photo.png'));

      expect(dialogHelperSpy.openSuccessDialog).not.toHaveBeenCalled();
    });

    it('should refresh the active user only when a token is present', () => {
      spyOn(TokenStorageUtil, 'getToken').and.returnValue('a-real-token');
      const result: ProfilePhotoUploadResult = { profilePictureUrl: 'http://example.com/new.jpg', success: true };
      profileServiceSpy.uploadProfilePhoto.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: result }));
      userServiceSpy.refreshActiveUser.and.returnValue(of(mockUser));

      component.onPhotoSelected(new File(['a'], 'photo.png'));

      expect(userServiceSpy.refreshActiveUser).toHaveBeenCalled();
    });

    it('should not attempt to refresh the active user when no token is stored', () => {
      spyOn(TokenStorageUtil, 'getToken').and.returnValue(null);
      const result: ProfilePhotoUploadResult = { profilePictureUrl: 'http://example.com/new.jpg', success: true };
      profileServiceSpy.uploadProfilePhoto.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: result }));

      component.onPhotoSelected(new File(['a'], 'photo.png'));

      expect(userServiceSpy.refreshActiveUser).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      fixture.detectChanges();
      storageService.setUser(mockUser);
    });

    it('should mark all fields touched and not submit when the form is invalid', () => {
      component.profileForm.get('firstName')?.setValue('');

      component.onSubmit();

      expect(profileServiceSpy.update).not.toHaveBeenCalled();
      expect(component.profileForm.get('firstName')?.touched).toBe(true);
    });

    it('should submit the updated payload when the form is valid', () => {
      profileServiceSpy.update.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: true }));
      component.profileForm.patchValue({ firstName: 'New', lastName: 'Name', userName: 'newname' });

      component.onSubmit();

      const expectedPayload: UpdateProfilePayload = { firstName: 'New', lastName: 'Name', userName: 'newname' };
      expect(profileServiceSpy.update).toHaveBeenCalledWith(expectedPayload);
    });

    it('should update currentUser, mark the form pristine, and show a success dialog on success', () => {
      profileServiceSpy.update.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: true }));
      component.profileForm.patchValue({ firstName: 'New', lastName: 'Name', userName: 'newname' });

      component.onSubmit();

      expect(component.currentUser?.firstName).toBe('New');
      expect(component.profileForm.pristine).toBe(true);
      expect(dialogHelperSpy.openSuccessDialog).toHaveBeenCalled();
    });

    it('should reset isLoading once the update completes', () => {
      profileServiceSpy.update.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: true }));
      component.profileForm.patchValue({ firstName: 'New', lastName: 'Name', userName: 'newname' });

      component.onSubmit();

      expect(component.isLoading).toBe(false);
    });

    it('should not update currentUser or show a dialog when the response reports failure', () => {
      profileServiceSpy.update.and.returnValue(of({ success: false, statusCode: 400, message: 'failed', data: false }));
      component.profileForm.patchValue({ firstName: 'New', lastName: 'Name', userName: 'newname' });

      component.onSubmit();

      expect(component.currentUser?.firstName).toBe('Ada');
      expect(dialogHelperSpy.openSuccessDialog).not.toHaveBeenCalled();
    });
  });

  describe('isFormDirty', () => {
    it('should reflect the form dirty state', () => {
      fixture.detectChanges();
      expect(component.isFormDirty).toBe(false);
      component.profileForm.get('firstName')?.markAsDirty();
      expect(component.isFormDirty).toBe(true);
    });
  });

  describe('profilePhotoUrl', () => {
    it('should be undefined when there is no current user', () => {
      fixture.detectChanges();
      expect(component.profilePhotoUrl).toBeUndefined();
    });

    it('should reflect the current user\'s profile picture url', () => {
      fixture.detectChanges();
      storageService.setUser({ ...mockUser, profilePictureUrl: 'http://example.com/photo.jpg' });
      expect(component.profilePhotoUrl).toBe('http://example.com/photo.jpg');
    });
  });
});
