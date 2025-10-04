import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';
import { DocumentItemComponent, UploadedDocument } from '../document-item/document-item.component';

@Component({
  selector: 'app-documents-view',
  standalone: true,
  imports: [CommonModule, FileUploaderComponent, DocumentItemComponent],
  templateUrl: './documents-view.component.html',
  styleUrls: ['./documents-view.component.scss']
})
export class DocumentsViewComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  uploadedDocuments: UploadedDocument[] = [
    {
      id: '1',
      name: 'Name of document.pdf',
      size: 13631488, // 13MB
      uploadDate: new Date('2023-09-11T12:24:00'),
      fileUrl: '#'
    },
    {
      id: '2',
      name: 'Name of document.pdf',
      size: 13631488, // 13MB
      uploadDate: new Date('2023-09-11T12:24:00'),
      fileUrl: '#'
    },
    {
      id: '2',
      name: 'Name of document.pdf',
      size: 13631488, // 13MB
      uploadDate: new Date('2023-09-11T12:24:00'),
      fileUrl: '#'
    },
    {
      id: '2',
      name: 'Name of document.pdf',
      size: 13631488, // 13MB
      uploadDate: new Date('2023-09-11T12:24:00'),
      fileUrl: '#'
    },
    {
      id: '2',
      name: 'Name of document.pdf',
      size: 13631488, // 13MB
      uploadDate: new Date('2023-09-11T12:24:00'),
      fileUrl: '#'
    }
  ];

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilesSelected(files: File[]): void {
    const newDocuments: UploadedDocument[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      uploadDate: new Date(),
    }));
    this.uploadedDocuments.push(...newDocuments);
  }

  onDeleteDocument(id: string): void {
    console.log('Delete document:', id);
    this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== id);
  }

  onDownloadDocument(id: string): void {
    console.log('Download document:', id);
    const doc = this.uploadedDocuments.find(d => d.id === id);
    if (doc?.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    }
  }
}
