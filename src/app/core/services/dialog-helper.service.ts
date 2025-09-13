import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { finalize } from "rxjs";
import { JobAddDialogComponent, InfoDialogComponent, JobStatusChangeComponent } from "../../components";
import { DialogCloseResponse, AddJobDialogData, InfoDialogData, IconStat, JobStatChangeDialogData, ApplicationStatus, CONFIRM_DELETE_MSG } from "../models";
import { DialogCloseStatus } from "../models/enums/dialog.enums";
import { JobApplicationItem, CreateApplicationPayload } from "../models/interface/job-application.models";
import { JobApplicationService } from "./job-application.service";
import { LoaderService } from "./loader.service";

@Injectable({ providedIn: 'root' })
export class DialogHelperService {
  constructor(
    private dialog: MatDialog,
    private loaderService: LoaderService,
    private jobApplicationService: JobApplicationService
  ) {}

  private openAndHandleDialog<T>(
    component: any,
    data: any,
    onSubmit: (response: DialogCloseResponse<T>) => void
  ): void {
    this.dialog.open(component, { data, backdropClass: 'blurred', disableClose: true })
      .afterClosed()
      .subscribe((response: DialogCloseResponse<T> | undefined) => {
        if (response?.status === DialogCloseStatus.Submitted) {
          onSubmit(response);
        }
      });
  }

  openAddApplicationDialog(onSuccess: () => void): void {
    const dialogData: AddJobDialogData = { isEditing: false };

    this.openAndHandleDialog<JobApplicationItem>(
      JobAddDialogComponent,
      dialogData,
      (response) => {
        const payload = this.buildCreatePayload(response.data!);
        this.createApplication(payload, onSuccess);
      }
    );
  }

  openEditApplicationDialog(jobData: JobApplicationItem, onSuccess: () => void): void {
    const dialogData: AddJobDialogData = { isEditing: true, jobApplicationData: jobData };

    this.openAndHandleDialog<JobApplicationItem>(
      JobAddDialogComponent,
      dialogData,
      (response) => {
        this.updateApplication(response.data!, onSuccess);
      }
    );
  }

  private createApplication(payload: CreateApplicationPayload, onComplete?: () => void): void {
    this.loaderService.showLoader();
    this.jobApplicationService.addApplication(payload)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({ next: () => onComplete?.(), error: () => onComplete?.() });
  }

  updateApplication(data: JobApplicationItem, onComplete?: () => void): void {
    const payload = this.buildUpdatePayload(data);
    this.loaderService.showLoader();
    this.jobApplicationService.updateJobApplication(payload)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({ next: () => onComplete?.(), error: () => onComplete?.() });
  }

  private buildCreatePayload(data: JobApplicationItem): CreateApplicationPayload {
    return { ...data } as CreateApplicationPayload;
  }

  private buildUpdatePayload(data: JobApplicationItem) {
    return { ...data };
  }

  openDeleteConfirmation(selectedItems: JobApplicationItem[], onConfirm: () => void): void {
    const dialogData: InfoDialogData = {
      infoMessage: this.buildDeleteMessage(selectedItems),
      statusIcon: IconStat.success,
    };

    this.openAndHandleDialog<any>(InfoDialogComponent, dialogData, () => onConfirm());
  }

  openJobStatusDialog(item: JobApplicationItem, onSubmit: (updated: JobApplicationItem) => void): void {
    const dialogData: JobStatChangeDialogData = { jobItem: item };

    this.openAndHandleDialog<{ status: ApplicationStatus }>(
      JobStatusChangeComponent,
      dialogData,
      (response) => {
        onSubmit({ id: item.id, status: response.data!.status });
      }
    );
  }

  buildDeleteMessage(selectedItems: JobApplicationItem[]): string {
    return selectedItems.length > 1
      ? `Kindly confirm you want to delete ${selectedItems.length} applications`
      : CONFIRM_DELETE_MSG;
  }
}