import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularMaterialModules } from '../../core/modules';
import { DialogCloseResponse, DialogCloseStatus } from '../../core/models';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, DocumentType } from '../../core/models/constants/profile.constants';
import { DocumentHelper } from '../../core/helpers';

export interface ConfirmUploadModalData {
  files: File[];
}

export interface ConfirmedUploadEntry {
  file: File;
  documentType: DocumentType;
}

@Component({
  selector: 'app-confirm-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AngularMaterialModules],
  templateUrl: './confirm-upload-modal.component.html',
  styleUrls: ['./confirm-upload-modal.component.scss']
})
export class ConfirmUploadModalComponent {
  entries: ConfirmedUploadEntry[];
  readonly documentTypeOptions = Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][];

  constructor(
    public dialogRef: MatDialogRef<ConfirmUploadModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmUploadModalData
  ) {
    this.entries = this.data.files.map(file => ({ file, documentType: DOCUMENT_TYPES.RESUME }));
  }

  getDocumentIcon(file: File): string {
    return DocumentHelper.getDocumentIcon(file.type);
  }

  formatFileSize(file: File): string {
    return DocumentHelper.formatFileSize(file.size);
  }

  onCancel(): void {
    const response: DialogCloseResponse<null> = { status: DialogCloseStatus.Cancelled, data: null };
    this.dialogRef.close(response);
  }

  onConfirm(): void {
    const response: DialogCloseResponse<ConfirmedUploadEntry[]> = { status: DialogCloseStatus.Submitted, data: this.entries };
    this.dialogRef.close(response);
  }
}
