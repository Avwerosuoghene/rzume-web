import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, concatMap, finalize, from, takeUntil, toArray } from 'rxjs';
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';
import { DocumentItemComponent } from '../document-item/document-item.component';
import { DocumentHelperService } from '../../../../core/services/document-helper.service';
import { ProfileManagementService } from '../../../../core/services/profile-management.service';
import { DialogHelperService } from '../../../../core/services/dialog-helper.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { SearchStateService } from '../../../../core/services/search-state.service';
import { DocumentItem, UploadDocumentPayload } from '../../../../core/models/interface/profile.models';
import { DOCUMENT_UPLOAD_SUCCESS_TITLE, DOCUMENT_UPLOAD_SUCCESS_MSG, DOCUMENT_DELETE_SUCCESS_TITLE, DOCUMENT_DELETE_SUCCESS_MSG, DELETE_DOCUMENT_TITLE } from '../../../../core/models/constants/dialog-data.constants';
import { APIResponse, DOCUMENT_VALIDATION, DOWNLOADING_DOCUMENT, SNACKBAR_CLOSE_LABEL, SNACKBAR_DURATION, IconStat, DEFAULT_CV_UPLOAD_LIMIT } from '../../../../core/models';
import { PROFILE_EMPTY_STATES } from '../../../../core/models/constants/profile.constants';
import { DocumentHelper } from '../../../../core/helpers';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmedUploadEntry } from '../../../../components/confirm-upload-modal/confirm-upload-modal.component';
import { CustomSearchInputComponent } from '../../../../components/custom-search-input/custom-search-input.component';
import { EmptyStateComponent } from '../../../../components/empty-state/empty-state.component';

@Component({
  selector: 'app-documents-view',
  standalone: true,
  imports: [CommonModule, FileUploaderComponent, DocumentItemComponent, CustomSearchInputComponent, EmptyStateComponent],
  templateUrl: './documents-view.component.html',
  styleUrls: ['./documents-view.component.scss']
})
export class DocumentsViewComponent implements OnInit, OnDestroy {
  @Input() documents: DocumentItem[] = [];
  @Input() uploadLimit: number = DEFAULT_CV_UPLOAD_LIMIT;
  isUploading = false;
  maxFileSize = DOCUMENT_VALIDATION.MAX_FILE_SIZE;
  readonly noSearchResultsState = PROFILE_EMPTY_STATES.NO_SEARCH_RESULTS;

  private searchTerm = '';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private documentHelper: DocumentHelperService,
    private profileService: ProfileManagementService,
    private dialogHelper: DialogHelperService,
    private snackBar: MatSnackBar,
    private loaderService: LoaderService,
    private searchStateService: SearchStateService
  ) { }

  // Matches filename only. Only ever mounted while the Documents tab is active (*ngIf in
  // profile-management.component.html), so it naturally only reacts to the shared search term
  // while this tab is visible — no activeTab check needed here.
  get filteredDocuments(): DocumentItem[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) return this.documents;
    return this.documents.filter(doc => doc.fileName.toLowerCase().includes(query));
  }

  onSearchChange(term: string): void {
    this.searchStateService.updateSearchTerm(term);
  }

  ngOnInit(): void {
    this.searchStateService.searchTerm$
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => this.searchTerm = term);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilesSelected(files: File[]): void {
    if (!files || files.length === 0) return;

    if (this.isUploadLimitReached) {
      this.showUploadLimitReachedDialog();
      return;
    }

    const remainingSlots = this.uploadLimit - this.documents.length;
    const filesToUpload = files.slice(0, remainingSlots);
    const skippedCount = files.length - filesToUpload.length;

    this.dialogHelper.openConfirmUploadDialog(
      filesToUpload,
      (entries) => this.uploadFiles(entries, skippedCount)
    );
  }

  private buildUploadPayload(entry: ConfirmedUploadEntry): UploadDocumentPayload {
    return {
      file: entry.file,
      type: entry.documentType
    };
  }

  private uploadFiles(entries: ConfirmedUploadEntry[], skippedCount: number): void {
    this.isUploading = true;
    from(entries).pipe(
      concatMap(entry => this.profileService.uploadResume(this.buildUploadPayload(entry))),
      toArray(),
      finalize(() => this.isUploading = false)
    ).subscribe({
      next: (responses) => this.handleBatchUploadSuccess(responses, skippedCount)
    });
  }

  private handleBatchUploadSuccess(responses: APIResponse<DocumentItem>[], skippedCount: number): void {
    if (!responses.some(response => response.success)) return;

    this.dialogHelper.openSuccessDialog(
      DOCUMENT_UPLOAD_SUCCESS_TITLE,
      DOCUMENT_UPLOAD_SUCCESS_MSG,
      () => {
        if (skippedCount > 0) {
          this.dialogHelper.openInfoDialog(
            IconStat.warn,
            `${skippedCount} file${skippedCount > 1 ? 's were' : ' was'} skipped because you reached your upload limit.`
          );
        }
      }
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

    DocumentHelper.downloadDocument(document.downloadUrl ?? document.url, document.fileName);
  }

  get isUploadLimitReached(): boolean {
    return this.documents.length >= this.uploadLimit;
  }

  private showUploadLimitReachedDialog(): void {
    const message = `You have reached your upload limit of ${this.uploadLimit} document${this.uploadLimit > 1 ? 's' : ''}. Please delete an existing document to upload a new one.`;
    this.dialogHelper.openInfoDialog(IconStat.warn, message);
  }

  trackByDocId(index: number, doc: DocumentItem): string {
    return doc.id;
  }
}
