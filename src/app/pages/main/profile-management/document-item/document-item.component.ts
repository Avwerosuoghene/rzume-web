import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DocumentItem } from '../../../../core/models';
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
  imports: [CommonModule, DatePipe, MatMenuModule, MatIconModule, MatButtonModule],
  templateUrl: './document-item.component.html',
  styleUrls: ['./document-item.component.scss']
})
export class DocumentItemComponent {
  @Input() document!: DocumentItem;
  @Output() delete = new EventEmitter<string>();
  @Output() download = new EventEmitter<string>();

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
