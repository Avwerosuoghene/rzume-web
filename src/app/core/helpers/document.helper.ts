import { MIME_TYPE_MAP, DEFAULT_CV_UPLOAD_LIMIT, SessionStorageKeys, SubscriptionFeatureKeys } from "../models";
import { SubscriptionFeatures } from "../models/interface/profile.models";


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

  static getCvUploadLimit(): number {
    try {
      const subscriptionFeaturesStr = sessionStorage.getItem(SessionStorageKeys.subscriptionFeatures);
      
      if (!subscriptionFeaturesStr) {
        return DEFAULT_CV_UPLOAD_LIMIT;
      }

      const subscriptionFeatures: SubscriptionFeatures = JSON.parse(subscriptionFeaturesStr);

      if (!subscriptionFeatures || !subscriptionFeatures.features) {
        return DEFAULT_CV_UPLOAD_LIMIT;
      }

      const cvLimitFeature = subscriptionFeatures.features.find(
        feature => feature.featureKey === SubscriptionFeatureKeys.CvUploadLimit
      );

      if (!cvLimitFeature || !cvLimitFeature.featureValue) {
        return DEFAULT_CV_UPLOAD_LIMIT;
      }

      const limit = parseInt(cvLimitFeature.featureValue, 10);
      return isNaN(limit) ? DEFAULT_CV_UPLOAD_LIMIT : limit;
    } catch (error) {
      return DEFAULT_CV_UPLOAD_LIMIT;
    }
  }
}
