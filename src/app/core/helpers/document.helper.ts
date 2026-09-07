import { MIME_TYPE_MAP, DEFAULT_CV_UPLOAD_LIMIT, SubscriptionFeatureKeys } from "../models";
import { Resume } from "../models/interface/profile.models";
import { SubscriptionFeatureHelper } from "./subscription-feature.helper";


export class DocumentHelper {

  static downloadDocument(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    
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
    if (MIME_TYPE_MAP[mimeType]) {
      return MIME_TYPE_MAP[mimeType];
    }

    const subtype = mimeType.split('/')[1];
    return (subtype || mimeType).toUpperCase();
  }

  static getReadableFileTypes(mimeTypes: string[]): string {
    return mimeTypes.map(type => this.getReadableFileType(type)).join(', ');
  }

  static formatFileSize(sizeInBytes: number): string {
    if (sizeInBytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));
    return Number.parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getDocumentIcon(fileType?: string): string {
    const type = fileType?.toLowerCase() || '';
    
    if (type.includes('pdf') || type === 'application/pdf') {
      return '/assets/icons/pdf-icon.svg';
    }
    
    if (type.includes('word') || type.includes('document') || 
        type === 'application/msword' || 
        type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return '/assets/icons/docs-icon.png';
    }
    
    return '/assets/icons/pdf-icon.svg';
  }

  static findResumeById(resumes: Resume[], resumeId: string): Resume | undefined {
    return resumes.find(resume => resume.id === resumeId);
  }

  static getResumeFileName(resumes: Resume[], resumeId: string): string {
    const resume = this.findResumeById(resumes, resumeId);
    return resume?.fileName || '';
  }

  static getCvUploadLimit(): number {
    return SubscriptionFeatureHelper.getNumericLimit(SubscriptionFeatureKeys.CvUploadLimit, DEFAULT_CV_UPLOAD_LIMIT);
  }
}
