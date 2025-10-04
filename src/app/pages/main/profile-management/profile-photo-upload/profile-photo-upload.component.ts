import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PROFILE_VALIDATION, PROFILE_ERROR_MESSAGES, PROFILE_FORM_LABELS, ACCEPTED_IMAGE_TYPES } from '../../../../core/models/constants/profile.constants';
import { DEFAULT_PROFILE_IMAGE } from '../../../../core/models';

@Component({
  selector: 'app-profile-photo-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-photo-upload.component.html',
  styleUrl: './profile-photo-upload.component.scss'
})
export class ProfilePhotoUploadComponent {
  @Input() photoUrl?: string;
  @Input() isLoading = true;
  @Output() photoSelected = new EventEmitter<File>();
  ACCEPTED_IMAGE_TYPES = ACCEPTED_IMAGE_TYPES;
  
  
  readonly labels = PROFILE_FORM_LABELS;
  errorMessage = '';


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndEmitFile(input.files[0]);
    }
  }

  private validateAndEmitFile(file: File): void {
    this.errorMessage = '';

    if (file.size > PROFILE_VALIDATION.MAX_FILE_SIZE) {
      this.errorMessage = PROFILE_ERROR_MESSAGES.FILE_TOO_LARGE;
      return;
    }

    const allowedTypes = PROFILE_VALIDATION.ALLOWED_IMAGE_TYPES as readonly string[];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = PROFILE_ERROR_MESSAGES.INVALID_FILE_TYPE;
      return;
    }

    this.photoSelected.emit(file);
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('profile-photo-input') as HTMLInputElement;
    fileInput?.click();
  }

  get displayPhotoUrl(): string {
    return this.photoUrl || DEFAULT_PROFILE_IMAGE;
  }

}
