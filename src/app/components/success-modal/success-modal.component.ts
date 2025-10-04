import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DialogCloseResponse } from '../../core/models';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';

export interface SuccessModalData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.scss']
})
export class SuccessModalComponent {
  constructor(
    public dialogRef: MatDialogRef<SuccessModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SuccessModalData
  ) {}

  onClose(): void {
    const response: DialogCloseResponse<null> = {
      status: DialogCloseStatus.Submitted,
      data: null
    };
    this.dialogRef.close(response);
  }
}
