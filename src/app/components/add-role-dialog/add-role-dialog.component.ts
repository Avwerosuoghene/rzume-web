import { ChangeDetectionStrategy, Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, NonNullableFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AngularMaterialModules } from '../../core/modules/material-modules';
import { CoreModules } from '../../core/modules/core-modules';
import { FormInputComponent } from '../form-input/form-input.component';
import { FormInputConfigHelper } from '../../core/helpers';
import { FormFieldId, FormFieldLabel } from '../../core/models';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { CreateRolePayload } from '../../core/models/interface/role.models';
import {
  INDUSTRIES,
  ROLE_DIALOG_CONFIG,
  ROLE_DOCUMENT_MAX_SIZE,
  ROLE_DOCUMENT_LIMIT,
  ROLE_DOCUMENT_TYPES,
  ROLE_ERROR_MESSAGES,
  ROLE_VALIDATION
} from '../../core/models/constants/role.constants';

interface AddRoleDialogData {
  isEditing?: boolean;
  roleData?: any;
}

@Component({
  selector: 'app-add-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    AngularMaterialModules,
    CoreModules,
    FormInputComponent
  ],
  templateUrl: './add-role-dialog.component.html',
  styleUrl: './add-role-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddRoleDialogComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);

  roleForm!: FormGroup;
  isLoading = false;
  selectedFiles: File[] = [];
  isDragging = false;

  readonly dialogTitle = ROLE_DIALOG_CONFIG.TITLE;
  readonly fileRestrictionsText = ROLE_DIALOG_CONFIG.FILE_RESTRICTIONS_TEXT;
  readonly maxDocumentsText = ROLE_DIALOG_CONFIG.MAX_DOCUMENTS_TEXT;
  readonly maxDocuments = ROLE_DOCUMENT_LIMIT;

  jobRoleConfig = FormInputConfigHelper.text({
    id: FormFieldId.JOB_ROLE,
    label: FormFieldLabel.JOB_ROLE,
    required: true,
    minLength: ROLE_VALIDATION.JOB_ROLE_MIN_LENGTH,
    maxLength: ROLE_VALIDATION.JOB_ROLE_MAX_LENGTH
  });

  industryConfig = FormInputConfigHelper.select({
    id: FormFieldId.INDUSTRY,
    label: FormFieldLabel.INDUSTRY,
    required: true,
    options: INDUSTRIES.map(industry => ({
      value: industry.value,
      label: industry.label
    }))
  });

  constructor(
    private dialogRef: MatDialogRef<AddRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogData: AddRoleDialogData
  ) { }

  jobRoleControl = this.fb.control('', {
    validators: [
      Validators.required,
      Validators.minLength(ROLE_VALIDATION.JOB_ROLE_MIN_LENGTH),
      Validators.maxLength(ROLE_VALIDATION.JOB_ROLE_MAX_LENGTH)
    ]
  });

  industryControl = this.fb.control('', {
    validators: [Validators.required]
  });

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.roleForm = this.fb.group({
      jobRole: this.jobRoleControl,
      industry: this.industryControl
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.selectedFiles.length < this.maxDocuments) {
      this.isDragging = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]): void {
    const remainingSlots = this.maxDocuments - this.selectedFiles.length;
    if (remainingSlots <= 0) return;

    const validFiles = files
      .slice(0, remainingSlots)
      .filter(file => this.isValidFile(file));

    if (validFiles.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
    }
  }

  private isValidFile(file: File): boolean {
    const isTypeValid = ROLE_DOCUMENT_TYPES.includes(file.type as any);
    const isSizeValid = file.size <= ROLE_DOCUMENT_MAX_SIZE;
    return isTypeValid && isSizeValid;
  }

  removeFile(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  get canAddMoreFiles(): boolean {
    return this.selectedFiles.length < this.maxDocuments;
  }

  get isSubmitDisabled(): boolean {
    return this.roleForm.invalid || this.isLoading || this.selectedFiles.length === 0;
  }

  onSubmit(): void {
    if (this.roleForm.invalid || this.selectedFiles.length === 0) {
      return;
    }

    this.isLoading = true;

    const payload: CreateRolePayload = {
      jobRole: this.roleForm.get('jobRole')?.value,
      industry: this.roleForm.get('industry')?.value,
      documents: this.selectedFiles
    };

    this.dialogRef.close({
      status: DialogCloseStatus.Submitted,
      data: payload
    });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: DialogCloseStatus.Cancelled
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
