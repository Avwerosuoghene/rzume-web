import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { finalize } from "rxjs";
import { JobAddDialogComponent, InfoDialogComponent, JobStatusChangeComponent, SuccessModalComponent } from "../../components";
import { ConfirmDeleteModalComponent } from '../../components/confirm-delete-modal/confirm-delete-modal.component';
import { JobApplicationService } from "./job-application.service";
import { LoaderService } from "./loader.service";
import { DialogCloseResponse, DialogCloseStatus, AddJobDialogData, JobApplicationItem, CreateApplicationPayload, InfoDialogData, IconStat, JobStatChangeDialogData, ApplicationStatus, CONFIRM_DELETE_MSG, ADD_APP_SUCCESS_TITLE, ADD_APP_SUCCESS_MSG, DELETE_APP_TITLE } from "../models";

@Injectable({ providedIn: 'root' })
export class DialogHelperService {
  constructor(
    private dialog: MatDialog,
    private loaderService: LoaderService,
    private jobApplicationService: JobApplicationService
  ) { }

  private openAndHandleDialog<T>(
    component: any,
    data: any,
    onSubmit: (response: DialogCloseResponse<T>) => void,
    config: { disableClose?: boolean; panelClass?: string } = {}
  ): void {
    const dialogConfig = {
      data,
      backdropClass: 'blurred',
      disableClose: config.disableClose ?? true,
      panelClass: config.panelClass,
    };
    this.dialog.open(component, dialogConfig)
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
      },
      { panelClass: 'add-job-dialog-panel' }
    );
  }

  openEditApplicationDialog(jobData: JobApplicationItem, onSuccess: () => void): void {
    const dialogData: AddJobDialogData = { isEditing: true, jobApplicationData: jobData };

    this.openAndHandleDialog<JobApplicationItem>(
      JobAddDialogComponent,
      dialogData,
      (response) => {
        this.updateApplication(response.data!, onSuccess);
      },
      { panelClass: 'add-job-dialog-panel' }
    );
  }

  private createApplication(payload: CreateApplicationPayload, onComplete?: () => void): void {
    this.loaderService.showLoader();
    this.jobApplicationService.addApplication(payload)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: () => {
          this.openSuccessDialog(
            ADD_APP_SUCCESS_TITLE,
            ADD_APP_SUCCESS_MSG,
            onComplete
          );
        },
        error: () => onComplete?.()
      });
  }

  openSuccessDialog(title: string, message: string, onClosed?: () => void): void {
    this.openAndHandleDialog(
      SuccessModalComponent,
      { title, message },
      () => onClosed?.(),
      { disableClose: true }
    );
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

  openDeleteConfirmation(
    selectedItems: JobApplicationItem[],
    onConfirm: () => void,
    deleteTitle: string
  ): void {
    const dialogData = {
      title: deleteTitle,
      message: this.buildDeleteMessage(selectedItems)
    };

    this.openAndHandleDialog<void>(
      ConfirmDeleteModalComponent,
      dialogData,
      () => onConfirm(),
      { disableClose: false }
    );
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