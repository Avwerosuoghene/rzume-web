import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ComponentType } from "@angular/cdk/portal";
import { finalize } from "rxjs";
import { JobAddDialogComponent, JobViewDialogComponent, InfoDialogComponent, JobStatusChangeComponent, SuccessModalComponent } from "../../components";
import { ConfirmDeleteModalComponent, ConfirmDeleteModalData } from '../../components/confirm-delete-modal/confirm-delete-modal.component';
import { ConfirmUploadModalComponent, ConfirmUploadModalData, ConfirmedUploadEntry } from '../../components/confirm-upload-modal/confirm-upload-modal.component';
import { PolicyDialogComponent } from '../../components/policy-dialog/policy-dialog.component';
import { AddRoleDialogComponent } from '../../components/add-role-dialog/add-role-dialog.component';
import { JobApplicationService } from "./job-application.service";
import { RoleService } from "./role.service";
import { LoaderService } from "./loader.service";
import { DialogCloseResponse, DialogCloseStatus, AddJobDialogData, AddRoleDialogData, ViewJobDialogData, JobApplicationItem, CreateApplicationPayload, UpdateApplicationPayload, JobApplicationFormValue, InfoDialogData, IconStat, JobStatChangeDialogData, ApplicationStatus, PolicyDialogData, CONFIRM_DELETE_MSG, ADD_APP_SUCCESS_TITLE, ADD_APP_SUCCESS_MSG } from "../models";
import { CreateRolePayload, Role } from '../models/interface/role.models';
import { ROLE_DELETE_CONFIRM, ROLE_DOCUMENT_DELETE_CONFIRM } from '../models/constants/role.constants';

@Injectable({ providedIn: 'root' })
export class DialogHelperService {
  constructor(
    private readonly dialog: MatDialog,
    private readonly loaderService: LoaderService,
    private readonly jobApplicationService: JobApplicationService,
    private readonly roleService: RoleService
  ) { }

  private openAndHandleDialog<T>(
    component: ComponentType<unknown>,
    data: unknown,
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

    this.openAndHandleDialog<JobApplicationFormValue>(
      JobAddDialogComponent,
      dialogData,
      (response) => {
        const payload = this.buildCreatePayload(response.data!);
        this.createApplication(payload, onSuccess);
      },
      { panelClass: 'add-job-dialog-panel' }
    );
  }

  openAddRoleDialog(onSuccess?: () => void): void {
    this.openAndHandleDialog<CreateRolePayload>(
      AddRoleDialogComponent,
      {},
      (response) => {
        this.loaderService.showLoader();
        this.roleService.createRole(response.data!)
          .pipe(finalize(() => this.loaderService.hideLoader()))
          .subscribe({
            next: () => onSuccess?.(),
            error: () => onSuccess?.()
          });
      },
      { panelClass: 'add-role-dialog-panel' }
    );
  }

  openEditRoleDialog(role: Role, onSuccess?: () => void): void {
    const dialogData: AddRoleDialogData = { isEditing: true, roleData: role };

    this.openAndHandleDialog<CreateRolePayload>(
      AddRoleDialogComponent,
      dialogData,
      (response) => {
        this.loaderService.showLoader();
        this.roleService.updateRole(role.id, response.data!)
          .pipe(finalize(() => this.loaderService.hideLoader()))
          .subscribe({
            next: () => onSuccess?.(),
            error: () => onSuccess?.()
          });
      },
      { panelClass: 'add-role-dialog-panel' }
    );
  }

  openConfirmUploadDialog(files: File[], onConfirm: (entries: ConfirmedUploadEntry[]) => void): void {
    const dialogData: ConfirmUploadModalData = { files };

    this.openAndHandleDialog<ConfirmedUploadEntry[]>(
      ConfirmUploadModalComponent,
      dialogData,
      (response) => onConfirm(response.data!),
      { disableClose: false }
    );
  }

  openDeleteRoleDocumentConfirmation(role: Role, documentId: string, onConfirm: () => void): void {
    const dialogData: ConfirmDeleteModalData = {
      title: ROLE_DOCUMENT_DELETE_CONFIRM.TITLE,
      message: ROLE_DOCUMENT_DELETE_CONFIRM.MESSAGE
    };

    this.openAndHandleDialog<null>(
      ConfirmDeleteModalComponent,
      dialogData,
      () => {
        this.loaderService.showLoader();
        const remainingDocuments = role.documents
          .filter(document => document.id !== documentId)
          .map(document => ({ resumeId: document.resumeId }));

        this.roleService.updateRole(role.id, { documents: remainingDocuments })
          .pipe(finalize(() => this.loaderService.hideLoader()))
          .subscribe({
            next: () => onConfirm(),
            error: () => onConfirm()
          });
      },
      { disableClose: false }
    );
  }

  openDeleteRoleConfirmation(role: Role, onConfirm: () => void): void {
    const dialogData: ConfirmDeleteModalData = {
      title: ROLE_DELETE_CONFIRM.TITLE,
      message: ROLE_DELETE_CONFIRM.MESSAGE
    };

    this.openAndHandleDialog<null>(
      ConfirmDeleteModalComponent,
      dialogData,
      () => {
        this.loaderService.showLoader();
        this.roleService.deleteRole(role.id)
          .pipe(finalize(() => this.loaderService.hideLoader()))
          .subscribe({
            next: () => onConfirm(),
            error: () => onConfirm()
          });
      },
      { disableClose: false }
    );
  }

  openEditApplicationDialog(jobData: JobApplicationItem, onSuccess: () => void): void {
    const dialogData: AddJobDialogData = { isEditing: true, jobApplicationData: jobData };

    this.openAndHandleDialog<JobApplicationFormValue>(
      JobAddDialogComponent,
      dialogData,
      (response) => {
        this.updateApplication({ ...response.data!, id: response.data!.id! }, onSuccess);
      },
      { panelClass: 'add-job-dialog-panel' }
    );
  }

  openViewJobDialog(jobData: JobApplicationItem): void {
    const dialogData: ViewJobDialogData = { jobApplication: jobData };

    const dialogConfig = {
      data: dialogData,
      backdropClass: 'blurred',
      disableClose: false,
      panelClass: 'view-job-dialog-panel'
    };

    this.dialog.open(JobViewDialogComponent, dialogConfig);
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

  updateApplication(data: UpdateApplicationPayload & { id: string }, onComplete?: () => void): void {
    const { id, ...payload } = data;
    this.loaderService.showLoader();
    this.jobApplicationService.updateJobApplication(id, payload)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({ next: () => onComplete?.(), error: () => onComplete?.() });
  }

  private buildCreatePayload(data: JobApplicationFormValue): CreateApplicationPayload {
    return {
      position: data.position,
      companyName: data.companyName,
      jobLink: data.jobLink,
      roleId: data.roleId,
      documents: data.documents,
      notes: data.notes,
      status: data.status as ApplicationStatus,
      applicationDate: data.applicationDate
    };
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

  openInfoDialog(infoIcon: IconStat, infoMessage: string, onClosed?: () => void): void {
    const dialogData: InfoDialogData = {
      statusIcon: infoIcon,
      infoMessage: infoMessage
    };

    this.openAndHandleDialog(
      InfoDialogComponent,
      dialogData,
      () => onClosed?.(),
      { disableClose: false }
    );
  }

  openPolicyDialog(title: string, content: string): void {
    const dialogData: PolicyDialogData = { title, content };

    const dialogConfig = {
      data: dialogData,
      backdropClass: 'blurred',
      disableClose: false,
      panelClass: 'policy-dialog-panel',
      maxWidth: '90vw',
      maxHeight: '80vh',
      width: '600px'
    };

    this.dialog.open(PolicyDialogComponent, dialogConfig);
  }

  buildDeleteMessage(selectedItems: JobApplicationItem[]): string {
    return selectedItems.length > 1
      ? `Kindly confirm you want to delete ${selectedItems.length} applications`
      : CONFIRM_DELETE_MSG;
  }
}
