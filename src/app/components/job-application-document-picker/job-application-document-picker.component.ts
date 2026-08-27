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

  private readonly singlePerTypeDocumentTypes: string[] = [DOCUMENT_TYPES.RESUME, DOCUMENT_TYPES.COVER_LETTER];

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

  // Only Resume/CoverLetter are capped at one; a document with no documentType at all is treated
  // as unrestricted rather than defaulting into the cap, since toggle() only assigns the RESUME
  // fallback type once it's actually selected — this checks the resume's OWN declared type.
  private isSingleInstanceType(documentType?: string | null): boolean {
    return !!documentType && this.singlePerTypeDocumentTypes.includes(documentType);
  }

  private hasSelectedOfType(documentType: string): boolean {
    return this.entries.some(entry => {
      const resume = this.availableResumes.find(r => r.id === entry.resumeId);
      return resume?.documentType === documentType;
    });
  }

  isOptionDisabled(resume: Resume): boolean {
    if (this.isSelected(resume.id)) return false;
    if (!this.isSingleInstanceType(resume.documentType)) return false;
    return this.hasSelectedOfType(resume.documentType!);
  }

  toggle(resume: Resume): void {
    if (this.isSelected(resume.id)) {
      this.entries = this.entries.filter(entry => entry.resumeId !== resume.id);
    } else {
      if (this.isOptionDisabled(resume)) return;
      this.entries = [
        ...this.entries,
        { resumeId: resume.id, documentType: resume.documentType ?? DOCUMENT_TYPES.RESUME }
      ];
    }
    this.documentsChange.emit(this.entries);
    this.cdr.markForCheck();
  }

  documentTypeLabel(documentType: string): string {
    return DOCUMENT_TYPE_LABELS[documentType as DocumentType] ?? documentType;
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
}
