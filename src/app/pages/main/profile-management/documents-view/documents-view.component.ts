import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';
import { DocumentItemComponent } from '../document-item/document-item.component';
import { DocumentHelperService } from '../../../../core/services/document-helper.service';
import { ProfileManagementService } from '../../../../core/services/profile-management.service';
import { DialogHelperService } from '../../../../core/services/dialog-helper.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { DocumentItem, Resume, UploadDocumentPayload } from '../../../../core/models/interface/profile.models';
import { DOCUMENT_UPLOAD_SUCCESS_TITLE, DOCUMENT_UPLOAD_SUCCESS_MSG, DOCUMENT_DELETE_SUCCESS_TITLE, DOCUMENT_DELETE_SUCCESS_MSG, DELETE_DOCUMENT_TITLE } from '../../../../core/models/constants/dialog-data.constants';
import { APIResponse, DOCUMENT_VALIDATION, DOWNLOADING_DOCUMENT, SNACKBAR_CLOSE_LABEL, SNACKBAR_DURATION } from '../../../../core/models';
import { DocumentHelper } from '../../../../core/helpers';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-documents-view',
  standalone: true,
  imports: [CommonModule, FileUploaderComponent, DocumentItemComponent],
  templateUrl: './documents-view.component.html',
  styleUrls: ['./documents-view.component.scss']
})
export class DocumentsViewComponent implements OnInit {
  @Input() documents: DocumentItem[] = [];
  isUploading = false;
  maxFileSize = DOCUMENT_VALIDATION.MAX_FILE_SIZE;

  constructor(
    private documentHelper: DocumentHelperService,
    private profileService: ProfileManagementService,
    private dialogHelper: DialogHelperService,
    private snackBar: MatSnackBar,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {

  }

  onFilesSelected(files: File[]): void {
    if (!files || files.length === 0) return;

    const file = files[0];

    const payload = this.buildUploadPayload(file);
    this.uploadDocument(payload);
  }



  private buildUploadPayload(file: File): UploadDocumentPayload {
    return {
      file: file,
    };
  }

  private uploadDocument(payload: UploadDocumentPayload): void {
    this.isUploading = true;
    this.profileService.uploadResume(payload)
      .pipe(finalize(() => this.isUploading = false))
      .subscribe({
        next: (response) => this.handleUploadSuccess(response)
      });
  }

  private handleUploadSuccess(response: APIResponse<DocumentItem>): void {
    if (!response.success) return;

    this.dialogHelper.openSuccessDialog(
      DOCUMENT_UPLOAD_SUCCESS_TITLE,
      DOCUMENT_UPLOAD_SUCCESS_MSG
    );
    this.documentHelper.fetchResumes();
  }

  onDeleteDocument(id: string): void {

    const document = this.documents.find(doc => doc.id === id);
    if (!document) return;

    this.dialogHelper.openDeleteConfirmation(
      [document as any],
      () => this.deleteDocument(id), DELETE_DOCUMENT_TITLE
    );
  }

  private deleteDocument(id: string): void {
    this.loaderService.showLoader();
    this.profileService.deleteResume(id)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (response) => this.handleDeleteSuccess(response)
      });
  }

  private handleDeleteSuccess(response: APIResponse<boolean>): void {
    if (!response.success) return;

    this.dialogHelper.openSuccessDialog(
      DOCUMENT_DELETE_SUCCESS_TITLE,
      DOCUMENT_DELETE_SUCCESS_MSG,
      () => this.documentHelper.fetchResumes()
    );
  }

  onDownloadDocument(id: string): void {
    const document = this.documents.find(doc => doc.id === id);
    if (!document) return;

    this.snackBar.open(DOWNLOADING_DOCUMENT, SNACKBAR_CLOSE_LABEL, { duration: SNACKBAR_DURATION });

    DocumentHelper.downloadDocument(document.url, document.fileName);
  }
}
