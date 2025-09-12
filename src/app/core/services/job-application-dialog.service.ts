import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { LoaderService } from './loader.service';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { AddJobDialogData, ApplicationStatus, DialogCloseResponse } from '../models';
import { JobApplicationService } from './job-application.service';
import { CreateApplicationPayload, JobApplicationItem } from '../models/interface/job-application.models';
import { JobAddDialogComponent } from '../../components';

@Injectable({ providedIn: 'root' })
export class JobApplicationDialogService {
  constructor(
    private dialog: MatDialog,
    private loaderService: LoaderService,
    private jobApplicationService: JobApplicationService
  ) {}

  openAddJobDialog(data: AddJobDialogData): MatDialogRef<JobAddDialogComponent, DialogCloseResponse<JobApplicationItem>> {
    return this.dialog.open(JobAddDialogComponent, { data, disableClose: true, panelClass: 'add-job-dialog-panel' });
  }

  handleDialogClose(
    response: DialogCloseResponse<JobApplicationItem> | undefined,
    onSuccess: (payload: CreateApplicationPayload) => void
  ): void {
    if (!response || response.status !== DialogCloseStatus.Submitted || !response.data) return;
    const payload = this.buildCreatePayload(response.data);
    onSuccess(payload);
  }

  createApplication(payload: CreateApplicationPayload, onComplete?: () => void): void {
    this.loaderService.showLoader();
    this.jobApplicationService.addApplication(payload)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: () => onComplete?.(),
        error: () => onComplete?.()
      });
  }

  updateApplication(data: JobApplicationItem,  onComplete?: () => void): void {
    const payload = this.buildUpdatePayload(data);

    this.loaderService.showLoader();
    this.jobApplicationService.updateJobApplication(payload)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: () => onComplete?.(),
        error: () => onComplete?.()
      });
  }

  private buildCreatePayload(data: JobApplicationItem): CreateApplicationPayload {
    return {
      position: data?.position,
      companyName: data?.companyName,
      jobLink: data?.jobLink,
      resumeLink: data?.resumeLink,
      notes: data?.notes,
      applicationDate: data?.applicationDate,
      status: data?.status as ApplicationStatus
    };
  }

  private buildUpdatePayload(data: JobApplicationItem) {
    return {
      id: data.id,
      position: data.position,
      companyName: data.companyName,
      jobLink: data.jobLink,
      notes: data.notes,
      resumeLink: data.resumeLink,
      status: data.status as ApplicationStatus,
      applicationDate: data.applicationDate
    };
  }
}