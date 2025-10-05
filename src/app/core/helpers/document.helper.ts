import { MIME_TYPE_MAP } from "../models";


export class DocumentHelper {

  static downloadDocument(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static downloadFromBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    this.downloadDocument(url, fileName);
    
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  static getReadableFileType(mimeType: string): string {
    return MIME_TYPE_MAP[mimeType] || mimeType.split('/')[1].toUpperCase();
  }

  static getReadableFileTypes(mimeTypes: string[]): string {
    return mimeTypes.map(type => this.getReadableFileType(type)).join(', ');
  }

  static formatFileSize(sizeInBytes: number): string {
    const sizeMB = sizeInBytes / (1024 * 1024);
    const sizeKB = sizeInBytes / 1024;
    
    if (sizeMB >= 1) {
      return `${sizeMB}MB`;
    }
    
    return `${sizeKB}KB`;
  }
}
