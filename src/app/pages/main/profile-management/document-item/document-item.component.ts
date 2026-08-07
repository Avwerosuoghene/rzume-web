import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActionMenuComponent } from '../../../../components/action-menu/action-menu.component';
import { DocumentItem, ActionMenuItem, ACTION_TYPES } from '../../../../core/models';
import { DocumentHelper } from '../../../../core/helpers';

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  uploadDate: Date;
  fileUrl?: string;
}

@Component({
  selector: 'app-document-item',
  standalone: true,
  imports: [CommonModule, DatePipe, ActionMenuComponent],
  templateUrl: './document-item.component.html',
  styleUrls: ['./document-item.component.scss']
})
export class DocumentItemComponent {
  @Input() document!: DocumentItem;
  @Input() actionsVariant: 'icons' | 'menu' = 'icons';
  @Output() delete = new EventEmitter<string>();
  @Output() download = new EventEmitter<string>();

  readonly documentActions: ActionMenuItem[] = [
    { key: ACTION_TYPES.DOWNLOAD, label: 'Download document', callback: () => this.onDownload() },
    { key: ACTION_TYPES.DELETE, label: 'Delete document', callback: () => this.onDelete() }
  ];

  onDelete(): void {
    this.delete.emit(this.document.id);
  }

  onDownload(): void {
    this.download.emit(this.document.id);
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getDocumentIcon(): string {
    return DocumentHelper.getDocumentIcon(this.document.fileType);
  }
}
