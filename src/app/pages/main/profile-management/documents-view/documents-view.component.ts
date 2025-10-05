import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';
import { DocumentItemComponent, UploadedDocument } from '../document-item/document-item.component';
import { DocumentHelperService } from '../../../../core/services/document-helper.service';
import { DocumentItem, Resume } from '../../../../core/models/interface/profile.models';

@Component({
  selector: 'app-documents-view',
  standalone: true,
  imports: [CommonModule, FileUploaderComponent, DocumentItemComponent],
  templateUrl: './documents-view.component.html',
  styleUrls: ['./documents-view.component.scss']
})
export class DocumentsViewComponent implements OnInit {
  @Input() documents: DocumentItem[] = [];


  constructor() { }

  ngOnInit(): void {

  }

  onFilesSelected(files: File[]): void {

  }

  onDeleteDocument(id: string): void {
   
  }

  onDownloadDocument(id: string): void {
   
  }
}
