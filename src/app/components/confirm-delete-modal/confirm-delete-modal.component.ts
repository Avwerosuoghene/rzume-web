import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DialogCloseResponse, DialogCloseStatus } from '../../core/models';

export interface ConfirmDeleteModalData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirm-delete-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirm-delete-modal.component.html',
  styleUrls: ['./confirm-delete-modal.component.scss']
})
export class ConfirmDeleteModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteModalData
  ) {}

  onClose(): void {
    const response: DialogCloseResponse<null> = {
      status: DialogCloseStatus.Cancelled,
      data: null
    };
    this.dialogRef.close(response);
  }

  onConfirm(): void {
    const response: DialogCloseResponse<null> = {
      status: DialogCloseStatus.Submitted,
      data: null
    };
    this.dialogRef.close(response);
  }
}
