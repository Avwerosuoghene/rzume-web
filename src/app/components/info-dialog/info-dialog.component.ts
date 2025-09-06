import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InfoDialogData, IconStat } from '../../core/models';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';

@Component({
  selector: 'app-info-dialog',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './info-dialog.component.html',
  styleUrl: './info-dialog.component.scss'
})
export class InfoDialogComponent {

  infoIcon!: IconStat;
  infoMessage!: string;


  constructor(
    @Inject(MAT_DIALOG_DATA) public infoDialogData: InfoDialogData,
    private dialogRef: MatDialogRef<InfoDialogComponent>
  ) {
    this.infoIcon = this.infoDialogData.statusIcon;
    this.infoMessage = this.infoDialogData.infoMessage;

    if (this.infoIcon === IconStat.failed && (this.infoMessage === undefined || this.infoMessage === '')) {
      this.infoMessage = 'Something went wrong';
    }
  }

  onConfirm(): void {
    this.dialogRef.close({
      status: DialogCloseStatus.Submitted,
    });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: DialogCloseStatus.Cancelled
    });
  }




}
