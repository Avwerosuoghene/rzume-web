import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActionMenuComponent } from '../../../../components/action-menu/action-menu.component';
import { DocumentItem, ActionMenuItem, ActionType, ACTION_TYPES } from '../../../../core/models';
import { DocumentHelper } from '../../../../core/helpers';
import { TruncatePipe } from '../../../../core/pipes/truncate.pipe';

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
  imports: [CommonModule, DatePipe, TruncatePipe, ActionMenuComponent],
  templateUrl: './document-item.component.html',
  styleUrls: ['./document-item.component.scss']
})
export class DocumentItemComponent {
  @Input() document!: DocumentItem;
  @Input() actionsVariant: 'icons' | 'menu' = 'icons';
  @Input() excludeActions: ActionType[] = [];
  @Input() filenameTruncateLimit = 30;
  @Output() delete = new EventEmitter<string>();
  @Output() download = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();

  get documentActions(): ActionMenuItem[] {
    const allActions: ActionMenuItem[] = [
      { key: ACTION_TYPES.VIEW, label: 'View document', callback: () => this.onView() },
      { key: ACTION_TYPES.EDIT, label: 'Edit document', callback: () => this.onEdit() },
      { key: ACTION_TYPES.DOWNLOAD, label: 'Download document', callback: () => this.onDownload() },
      { key: ACTION_TYPES.DELETE, label: 'Delete document', callback: () => this.onDelete() }
    ];
    return allActions.filter(action => !this.excludeActions.includes(action.key));
  }

  onView(): void {
    window.open(this.document.url, '_blank', 'noopener');
  }

  onEdit(): void {
    this.edit.emit(this.document.id);
  }

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
