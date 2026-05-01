import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AngularMaterialModules } from '../../core/modules/material-modules';
import { ViewJobDialogData } from '../../core/models/interface/dialog-models';
import { JobApplicationItem } from '../../core/models/interface/job-application.models';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { DialogHelperService } from '../../core/services/dialog-helper.service';
import { DocumentHelper } from '../../core/helpers/document.helper';

@Component({
  selector: 'app-job-view-dialog',
  standalone: true,
  imports: [CommonModule, AngularMaterialModules],
  templateUrl: './job-view-dialog.component.html',
  styleUrl: './job-view-dialog.component.scss'
})
export class JobViewDialogComponent {
  jobApplication: JobApplicationItem;
  private dialogHelperService = inject(DialogHelperService);

  constructor(
    private dialogRef: MatDialogRef<JobViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private viewJobDialogData: ViewJobDialogData
  ) {
    this.jobApplication = this.viewJobDialogData.jobApplication;
    console.log(this.jobApplication)
  }

  closeDialog(): void {
    const closeData = {
      status: DialogCloseStatus.Cancelled
    };
    this.dialogRef.close(closeData);
  }

  editJobApplication(): void {
    this.dialogRef.close();
    this.dialogHelperService.openEditApplicationDialog(
      this.jobApplication,
      () => {
        // Reload handled by dashboard's existing callback
      }
    );
  }

  formatFileSize(bytes: number): string {
    return DocumentHelper.formatFileSize(bytes);
  }
}
