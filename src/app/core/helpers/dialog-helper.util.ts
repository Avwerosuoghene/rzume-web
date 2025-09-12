import { Injectable } from '@angular/core';
import { JobApplicationDialogService } from '../services/job-application-dialog.service';
import { JobApplicationItem } from '../models/interface/job-application.models';
import { AddJobDialogData, DialogCloseResponse } from '../models';
import { DialogCloseStatus } from '../models/enums/dialog.enums';

@Injectable({ providedIn: 'root' })
export class DialogHelperUtil {
  constructor(private jobDialogService: JobApplicationDialogService) {}

  openAddApplicationDialog(onSuccess: () => void): void {
    const dialogData: AddJobDialogData = { isEditing: false };

    this.jobDialogService.openAddJobDialog(dialogData)
      .afterClosed()
      .subscribe(response => {
        this.jobDialogService.handleDialogClose(response, payload =>
          this.jobDialogService.createApplication(payload, onSuccess)
        );
      });
  }

  openEditApplicationDialog(jobData: JobApplicationItem, onSuccess: () => void): void {
    const dialogData: AddJobDialogData = { isEditing: true, jobApplicationData: jobData };

    this.jobDialogService.openAddJobDialog(dialogData)
      .afterClosed()
      .subscribe(response => this.handleUpdateDialogResponse(response, onSuccess));
  }

  private handleUpdateDialogResponse(
    response: DialogCloseResponse<JobApplicationItem> | undefined,
    onSuccess: () => void
  ): void {
    if (!response) return;

    if (response.status === DialogCloseStatus.Submitted && response.data) {
      this.jobDialogService.updateApplication(response.data, onSuccess);
    }
  }
}