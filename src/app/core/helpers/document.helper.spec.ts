import { fakeAsync, tick } from '@angular/core/testing';
import { DocumentHelper } from './document.helper';
import { SessionStorageKeys } from '../models';
import { DEFAULT_CV_UPLOAD_LIMIT } from '../models/constants/document.constants';
import { Resume } from '../models/interface/profile.models';

describe('DocumentHelper', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  describe('downloadDocument', () => {
    it('should create, click, and clean up a temporary anchor element', () => {
      const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');
      const appendSpy = spyOn(document.body, 'appendChild').and.callThrough();
      const removeSpy = spyOn(document.body, 'removeChild').and.callThrough();

      DocumentHelper.downloadDocument('http://example.com/file.pdf', 'file.pdf');

      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(appendSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('downloadFromBlob', () => {
    it('should create an object URL, download it, and revoke it after a delay', fakeAsync(() => {
      const blob = new Blob(['content']);
      const createUrlSpy = spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock-url');
      const revokeUrlSpy = spyOn(window.URL, 'revokeObjectURL');
      spyOn(HTMLAnchorElement.prototype, 'click');

      DocumentHelper.downloadFromBlob(blob, 'file.pdf');

      expect(createUrlSpy).toHaveBeenCalledWith(blob);
      expect(revokeUrlSpy).not.toHaveBeenCalled();

      tick(100);
      expect(revokeUrlSpy).toHaveBeenCalledWith('blob:mock-url');
    }));
  });

  describe('getReadableFileType', () => {
    it('should return the mapped label for a known mime type', () => {
      expect(DocumentHelper.getReadableFileType('application/pdf')).toBe('PDF');
    });

    it('should fall back to the uppercased subtype for an unmapped but well-formed mime type', () => {
      expect(DocumentHelper.getReadableFileType('image/png')).toBe('PNG');
    });

    it('should fall back to the uppercased raw value instead of throwing for a malformed mime type', () => {
      expect(DocumentHelper.getReadableFileType('pdf')).toBe('PDF');
    });
  });

  describe('getReadableFileTypes', () => {
    it('should join multiple readable types with a comma', () => {
      expect(DocumentHelper.getReadableFileTypes(['application/pdf', 'text/plain'])).toBe('PDF, TXT');
    });
  });

  describe('formatFileSize', () => {
    it('should format sizes at or above 1MB in MB', () => {
      expect(DocumentHelper.formatFileSize(2 * 1024 * 1024)).toBe('2MB');
    });

    it('should format sizes below 1MB in KB', () => {
      expect(DocumentHelper.formatFileSize(500 * 1024)).toBe('500KB');
    });
  });

  describe('getDocumentIcon', () => {
    it('should return the pdf icon for a pdf mime type', () => {
      expect(DocumentHelper.getDocumentIcon('application/pdf')).toBe('/assets/icons/pdf-icon.svg');
    });

    it('should return the docs icon for a word mime type', () => {
      expect(DocumentHelper.getDocumentIcon('application/msword')).toBe('/assets/icons/docs-icon.png');
    });

    it('should default to the pdf icon for an unrecognized type', () => {
      expect(DocumentHelper.getDocumentIcon('image/png')).toBe('/assets/icons/pdf-icon.svg');
    });

    it('should default to the pdf icon when no file type is given', () => {
      expect(DocumentHelper.getDocumentIcon(undefined)).toBe('/assets/icons/pdf-icon.svg');
    });
  });

  describe('findResumeById / getResumeFileName', () => {
    const resumes: Resume[] = [
      { id: '1', fileName: 'resume.pdf', uploadedAt: new Date('2026-01-01'), url: 'http://example.com/resume.pdf' },
      { id: '2', fileName: 'cover.pdf', uploadedAt: new Date('2026-01-02'), url: 'http://example.com/cover.pdf' }
    ];

    it('should find the resume matching the given id', () => {
      expect(DocumentHelper.findResumeById(resumes, '2')).toEqual(resumes[1]);
    });

    it('should return undefined when no resume matches', () => {
      expect(DocumentHelper.findResumeById(resumes, 'missing')).toBeUndefined();
    });

    it('should return the matching resume file name', () => {
      expect(DocumentHelper.getResumeFileName(resumes, '1')).toBe('resume.pdf');
    });

    it('should return an empty string when no resume matches', () => {
      expect(DocumentHelper.getResumeFileName(resumes, 'missing')).toBe('');
    });
  });

  describe('getCvUploadLimit', () => {
    it('should return the default limit when nothing is stored', () => {
      expect(DocumentHelper.getCvUploadLimit()).toBe(DEFAULT_CV_UPLOAD_LIMIT);
    });

    it('should return the parsed limit when a valid positive value is stored', () => {
      sessionStorage.setItem(SessionStorageKeys.subscriptionFeatures, JSON.stringify({
        planId: 1, planName: 'Pro', features: [{ featureKey: 'cv_upload_limit', featureValue: '5' }]
      }));

      expect(DocumentHelper.getCvUploadLimit()).toBe(5);
    });

    it('should return the default limit when the stored value is not a number', () => {
      sessionStorage.setItem(SessionStorageKeys.subscriptionFeatures, JSON.stringify({
        planId: 1, planName: 'Pro', features: [{ featureKey: 'cv_upload_limit', featureValue: 'nope' }]
      }));

      expect(DocumentHelper.getCvUploadLimit()).toBe(DEFAULT_CV_UPLOAD_LIMIT);
    });

    it('should return the default limit when the stored value is zero or negative', () => {
      sessionStorage.setItem(SessionStorageKeys.subscriptionFeatures, JSON.stringify({
        planId: 1, planName: 'Pro', features: [{ featureKey: 'cv_upload_limit', featureValue: '-3' }]
      }));

      expect(DocumentHelper.getCvUploadLimit()).toBe(DEFAULT_CV_UPLOAD_LIMIT);
    });

    it('should return the default limit when the stored value is malformed JSON', () => {
      sessionStorage.setItem(SessionStorageKeys.subscriptionFeatures, '{not valid json');
      expect(DocumentHelper.getCvUploadLimit()).toBe(DEFAULT_CV_UPLOAD_LIMIT);
    });
  });
});
