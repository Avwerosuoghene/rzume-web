import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { PROFILE_EMPTY_STATES } from '../../../../core/models/constants/profile.constants';
import { DocumentItem } from '../../../../core/models/interface/profile.models';

/**
 * DocumentsView component - handles document management
 * Follows Single Responsibility Principle: manages only document operations
 */
@Component({
  selector: 'app-documents-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents-view.component.html',
  styleUrl: './documents-view.component.scss'
})
export class DocumentsViewComponent implements OnInit, OnDestroy {
  readonly emptyStates = PROFILE_EMPTY_STATES;
  
  documents: DocumentItem[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads user documents from backend
   */
  private loadDocuments(): void {
    // TODO: Implement actual document loading from backend
    this.isLoading = true;
    
    // Simulate loading for now
    setTimeout(() => {
      this.documents = [];
      this.isLoading = false;
    }, 500);
  }

  /**
   * Handles document upload
   */
  onUploadDocument(): void {
    // TODO: Implement document upload dialog
    console.log('Upload document clicked');
  }

  /**
   * Handles document deletion
   * @param documentId - ID of document to delete
   */
  onDeleteDocument(documentId: string): void {
    // TODO: Implement document deletion
    console.log('Delete document:', documentId);
  }

  /**
   * Handles document download
   * @param document - Document to download
   */
  onDownloadDocument(document: DocumentItem): void {
    // TODO: Implement document download
    console.log('Download document:', document);
  }

  /**
   * Formats file size for display
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Formats date for display
   * @param date - Date to format
   * @returns Formatted date string
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Checks if documents list is empty
   */
  get hasDocuments(): boolean {
    return this.documents.length > 0;
  }
}
