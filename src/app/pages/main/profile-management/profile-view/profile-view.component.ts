import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ProfilePhotoUploadComponent } from '../profile-photo-upload/profile-photo-upload.component';
import { ProfileManagementService } from '../../../../core/services/profile-management.service';
import { AuthenticationService } from '../../../../core/services/authentication.service';
import { SessionStorageUtil } from '../../../../core/helpers/session-storage.util';
import { 
  PROFILE_FORM_LABELS, 
  PROFILE_VALIDATION, 
  PROFILE_ERROR_MESSAGES 
} from '../../../../core/models/constants/profile.constants';
import { UpdateProfilePayload } from '../../../../core/models/interface/profile.models';
import { User } from '../../../../core/models';
import { MatButtonModule } from '@angular/material/button';
import { StorageService } from '../../../../core/services';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProfilePhotoUploadComponent,
    MatButtonModule
  ],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.scss'
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  readonly labels = PROFILE_FORM_LABELS;
  readonly errorMessages = PROFILE_ERROR_MESSAGES;
  
  profileForm!: FormGroup;
  isLoading = false;
  isPhotoUploading = false;
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileManagementService,
    private authService: AuthenticationService,
    private storageService: StorageService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getUserInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(PROFILE_VALIDATION.FIRST_NAME_MIN_LENGTH),
        Validators.maxLength(PROFILE_VALIDATION.FIRST_NAME_MAX_LENGTH)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(PROFILE_VALIDATION.LAST_NAME_MIN_LENGTH),
        Validators.maxLength(PROFILE_VALIDATION.LAST_NAME_MAX_LENGTH)
      ]],
      email: [{ value: '', disabled: true }, [
        Validators.required,
        Validators.pattern(PROFILE_VALIDATION.EMAIL_PATTERN)
      ]]
    });
  }

  getUserInfo() {
    this.storageService.user$.subscribe(user => {
      this.currentUser = user;
      if (!this.currentUser) return;
      this.populateForm(this.currentUser);
    });
  }

  private populateForm(user: User): void {
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email
    });
  }


  onPhotoSelected(file: File): void {
    // TODO: Implement actual photo upload to backend
    this.isPhotoUploading = true;
    
    // Simulate upload for now
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.currentUser) {
          this.currentUser.profilePictureUrl = e.target?.result as string;
        }
        this.isPhotoUploading = false;
      };
      reader.readAsDataURL(file);
    }, 1000);
  }

// todo
  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    const payload: UpdateProfilePayload = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      userName: `${this.profileForm.value.firstName} ${this.profileForm.value.lastName}`
    };

    this.isLoading = true;
    this.profileService.update(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Profile updated successfully:', response);
          // TODO: Show success message
        },
        error: (error) => {
          console.error('Failed to update profile:', error);
          // TODO: Show error message
        }
      });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    const errors = control.errors;
    if (errors['required']) {
      return this.errorMessages[`${fieldName.toUpperCase()}_REQUIRED` as keyof typeof PROFILE_ERROR_MESSAGES];
    }
    if (errors['minlength']) {
      return this.errorMessages[`${fieldName.toUpperCase()}_MIN_LENGTH` as keyof typeof PROFILE_ERROR_MESSAGES];
    }
    if (errors['maxlength']) {
      return this.errorMessages[`${fieldName.toUpperCase()}_MAX_LENGTH` as keyof typeof PROFILE_ERROR_MESSAGES];
    }
    if (errors['pattern']) {
      return this.errorMessages[`${fieldName.toUpperCase()}_INVALID` as keyof typeof PROFILE_ERROR_MESSAGES];
    }

    return '';
  }


  get isFormDirty(): boolean {
    return this.profileForm.dirty;
  }

  get profilePhotoUrl(): string | undefined {
    return this.currentUser?.profilePictureUrl;
  }
}
