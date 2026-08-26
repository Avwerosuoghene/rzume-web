import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { AngularMaterialModules } from '../../core/modules';
import { Resume } from '../../core/models/interface/profile.models';
import { JobApplicationDocumentRequestItem } from '../../core/models/interface/job-application.models';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, DocumentType } from '../../core/models/constants/profile.constants';
import { DocumentHelper } from '../../core/helpers';

export interface JobApplicationDocumentView {
  resume: Resume;
  documentType: string;
}

@Component({
  selector: 'app-job-application-document-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, AngularMaterialModules, OverlayModule],
  templateUrl: './job-application-document-picker.component.html',
  styleUrls: ['./job-application-document-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobApplicationDocumentPickerComponent {
  private cdr = inject(ChangeDetectorRef);

  @Input() availableResumes: Resume[] = [];

  private _preSuggestedDocuments: JobApplicationDocumentRequestItem[] = [];
  @Input()
  set preSuggestedDocuments(value: JobApplicationDocumentRequestItem[]) {
    this._preSuggestedDocuments = value;
    this.entries = [...value];
  }
  get preSuggestedDocuments(): JobApplicationDocumentRequestItem[] {
    return this._preSuggestedDocuments;
  }

  @Output() documentsChange = new EventEmitter<JobApplicationDocumentRequestItem[]>();
  @Output() uploadRequested = new EventEmitter<void>();

  entries: JobApplicationDocumentRequestItem[] = [];
  documentSearchQuery = '';
  isDropdownOpen = false;
  readonly documentTypeOptions = Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][];

  readonly multiselectOverlayPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 }
  ];

  get filteredResumes(): Resume[] {
    const query = this.documentSearchQuery.trim().toLowerCase();
    if (!query) return this.availableResumes;
    return this.availableResumes.filter(resume => resume.fileName.toLowerCase().includes(query));
  }

  get selectedDocumentViews(): JobApplicationDocumentView[] {
    return this.entries
      .map(entry => {
        const resume = this.availableResumes.find(r => r.id === entry.resumeId);
        return resume ? { resume, documentType: entry.documentType } : null;
      })
      .filter((view): view is JobApplicationDocumentView => view !== null);
  }

  isSelected(resumeId: string): boolean {
    return this.entries.some(entry => entry.resumeId === resumeId);
  }

  toggle(resume: Resume): void {
    if (this.isSelected(resume.id)) {
      this.entries = this.entries.filter(entry => entry.resumeId !== resume.id);
    } else {
      this.entries = [
        ...this.entries,
        { resumeId: resume.id, documentType: resume.documentType ?? DOCUMENT_TYPES.RESUME }
      ];
    }
    this.documentsChange.emit(this.entries);
    this.cdr.markForCheck();
  }

  updateDocumentType(resumeId: string, documentType: string): void {
    this.entries = this.entries.map(entry =>
      entry.resumeId === resumeId ? { ...entry, documentType } : entry
    );
    this.documentsChange.emit(this.entries);
    this.cdr.markForCheck();
  }

  removeDocument(resumeId: string): void {
    this.entries = this.entries.filter(entry => entry.resumeId !== resumeId);
    this.documentsChange.emit(this.entries);
    this.cdr.markForCheck();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (!this.isDropdownOpen) this.documentSearchQuery = '';
    this.cdr.markForCheck();
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.documentSearchQuery = '';
    this.cdr.markForCheck();
  }

  onUploadRequested(): void {
    this.uploadRequested.emit();
  }

  getDocumentIcon(resume: Resume): string {
    return DocumentHelper.getDocumentIcon(resume.fileType);
  }

  formatFileSize(bytes: number): string {
    return DocumentHelper.formatFileSize(bytes);
  }
}
