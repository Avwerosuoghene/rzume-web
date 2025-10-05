import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { DEFAULT_UPLOADER_ALLOWED_TYPES, DEFAULT_UPLOADER_MAX_FILE_SIZE } from '../../../../core/models/constants/profile.constants';
import { DocumentHelper } from '../../../../core/helpers';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent {
  @Input() allowedFileTypes: string[] = DEFAULT_UPLOADER_ALLOWED_TYPES;
  @Input() maxFileSize: number = DEFAULT_UPLOADER_MAX_FILE_SIZE;
  @Input() isUploading: boolean = false;
  @Input () isFileLimitReached: boolean = false;
  @Output() filesSelected = new EventEmitter<File[]>();

  isDragging = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]): void {
    const validFiles = files.filter(file => this.isValidFile(file));
    if (validFiles.length > 0) {
      this.filesSelected.emit(validFiles);
    }
  }

  private isValidFile(file: File): boolean {
    const isTypeValid = this.allowedFileTypes.includes(file.type);
    const isSizeValid = file.size <= this.maxFileSize;
    return isTypeValid && isSizeValid;
  }

  get fileRestrictionsText(): string {
    const types = DocumentHelper.getReadableFileTypes(this.allowedFileTypes);
    const sizeText = DocumentHelper.formatFileSize(this.maxFileSize);
    
    return `${types} only (max. ${sizeText})`;
  }
}
