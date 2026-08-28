import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularMaterialModules } from '../../core/modules';
import { DialogCloseResponse, DialogCloseStatus } from '../../core/models';
import { DocumentItem } from '../../core/models/interface/profile.models';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, DocumentType } from '../../core/models/constants/profile.constants';

export interface EditDocumentModalData {
  document: DocumentItem;
}

export interface EditDocumentModalResult {
  fileName: string;
  documentType: string;
}

// Path.GetExtension-equivalent: everything from the last '.' onward, matching the backend's own
// ApplyResumeRename so what's shown/edited here lines up exactly with what the backend preserves.
function splitFileName(fileName: string): { name: string; extension: string } {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot <= 0) return { name: fileName, extension: '' };
  return { name: fileName.slice(0, lastDot), extension: fileName.slice(lastDot) };
}

@Component({
  selector: 'app-edit-document-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AngularMaterialModules],
  templateUrl: './edit-document-modal.component.html',
  styleUrls: ['./edit-document-modal.component.scss']
})
export class EditDocumentModalComponent {
  name: string;
  readonly extension: string;
  documentType: string;
  readonly documentTypeOptions = Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][];

  constructor(
    public dialogRef: MatDialogRef<EditDocumentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditDocumentModalData
  ) {
    const { name, extension } = splitFileName(this.data.document.fileName);
    this.name = name;
    this.extension = extension;
    this.documentType = this.data.document.documentType ?? DOCUMENT_TYPES.RESUME;
  }

  get isNameValid(): boolean {
    return this.name.trim().length > 0;
  }

  onCancel(): void {
    const response: DialogCloseResponse<null> = { status: DialogCloseStatus.Cancelled, data: null };
    this.dialogRef.close(response);
  }

  onSave(): void {
    if (!this.isNameValid) return;

    const response: DialogCloseResponse<EditDocumentModalResult> = {
      status: DialogCloseStatus.Submitted,
      data: { fileName: this.name.trim(), documentType: this.documentType }
    };
    this.dialogRef.close(response);
  }
}
