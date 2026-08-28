import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProfileManagementService } from './profile-management.service';
import { ApiService } from './api.service';
import { DialogHelperService } from './dialog-helper.service';
import { LoaderService } from './loader.service';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsEvent } from '../models/analytics-events.enum';
import { APIResponse } from '../models';
import { FEEDBACK_SUCCESS_TITLE, FEEDBACK_SUCCESS_MESSAGE } from '../models/constants/feedback.constants';
import { FeedbackSubmission } from '../models/interface/feedback.interface';
import { ProfilePhotoUploadResult } from '../models/interface/profile.models';
import { DOCUMENT_TYPES } from '../models/constants/profile.constants';

describe('ProfileManagementService', () => {
  let service: ProfileManagementService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let dialogHelperSpy: jasmine.SpyObj<DialogHelperService>;
  let loaderServiceSpy: jasmine.SpyObj<LoaderService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  const okResponse = <T>(data?: T): APIResponse<T> => ({ statusCode: 200, success: true, message: '', data });

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);
    dialogHelperSpy = jasmine.createSpyObj('DialogHelperService', ['openSuccessDialog']);
    loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['track']);

    TestBed.configureTestingModule({
      providers: [
        ProfileManagementService,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: DialogHelperService, useValue: dialogHelperSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy }
      ]
    });

    service = TestBed.inject(ProfileManagementService);
  });

  describe('update', () => {
    it('should track the updated field names on success', (done) => {
      apiServiceSpy.put.and.returnValue(of(okResponse(true)));

      service.update({ firstName: 'Jane', lastName: 'Doe' }).subscribe(() => {
        expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.PROFILE_UPDATED, {
          fields_updated: ['firstName', 'lastName']
        });
        done();
      });
    });

    it('should track failure and re-throw on error', (done) => {
      const error = new Error('update failed');
      apiServiceSpy.put.and.returnValue(throwError(() => error));

      service.update({ firstName: 'Jane' }).subscribe({
        error: (err) => {
          expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.PROFILE_UPDATE_FAILED, jasmine.objectContaining({
            fields_attempted: ['firstName']
          }));
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('uploadProfilePhoto', () => {
    it('should track the upload with file size/type on success', (done) => {
      const file = new File(['content'], 'photo.png', { type: 'image/png' });
      apiServiceSpy.post.and.returnValue(of(okResponse({ profilePictureUrl: 'url', success: true } as ProfilePhotoUploadResult)));

      service.uploadProfilePhoto(file).subscribe(() => {
        expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.PROFILE_PHOTO_UPLOADED, jasmine.objectContaining({
          file_type: 'image/png'
        }));
        done();
      });
    });

    it('should send the file as FormData', () => {
      const file = new File(['content'], 'photo.png', { type: 'image/png' });
      apiServiceSpy.post.and.returnValue(of(okResponse({} as ProfilePhotoUploadResult)));

      service.uploadProfilePhoto(file).subscribe();

      const body = apiServiceSpy.post.calls.mostRecent().args[1];
      expect(body instanceof FormData).toBe(true);
    });

    it('should track failure on error', (done) => {
      const file = new File(['content'], 'photo.png', { type: 'image/png' });
      apiServiceSpy.post.and.returnValue(throwError(() => new Error('upload failed')));

      service.uploadProfilePhoto(file).subscribe({
        error: () => {
          expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.PROFILE_PHOTO_UPLOAD_FAILED, jasmine.any(Object));
          done();
        }
      });
    });
  });

  describe('getResumes / getSubscriptionFeatures (pure pass-through)', () => {
    it('should request resumes with bearer auth', () => {
      apiServiceSpy.get.and.returnValue(of(okResponse([])));
      service.getResumes().subscribe();
      expect(apiServiceSpy.get).toHaveBeenCalledWith(jasmine.objectContaining({ withBearer: true }));
    });

    it('should request subscription features with bearer auth', () => {
      apiServiceSpy.get.and.returnValue(of(okResponse({} as never)));
      service.getSubscriptionFeatures().subscribe();
      expect(apiServiceSpy.get).toHaveBeenCalledWith(jasmine.objectContaining({ withBearer: true }));
    });
  });

  describe('uploadResume', () => {
    it('should send the file as FormData to the resume endpoint', () => {
      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
      apiServiceSpy.post.and.returnValue(of(okResponse({} as never)));

      service.uploadResume({ file }).subscribe();

      const body = apiServiceSpy.post.calls.mostRecent().args[1];
      expect(body instanceof FormData).toBe(true);
    });

    it('should append documentType to the FormData when provided (backend contract: POST /resume now accepts an optional documentType field)', () => {
      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
      apiServiceSpy.post.and.returnValue(of(okResponse({} as never)));

      service.uploadResume({ file, type: DOCUMENT_TYPES.COVER_LETTER }).subscribe();

      const body = apiServiceSpy.post.calls.mostRecent().args[1] as FormData;
      expect(body.get('documentType')).toBe(DOCUMENT_TYPES.COVER_LETTER);
    });

    it('should NOT append documentType to the FormData when omitted (server defaults to "Resume")', () => {
      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
      apiServiceSpy.post.and.returnValue(of(okResponse({} as never)));

      service.uploadResume({ file }).subscribe();

      const body = apiServiceSpy.post.calls.mostRecent().args[1] as FormData;
      expect(body.get('documentType')).toBeNull();
    });
  });

  describe('deleteResume', () => {
    it('should call delete with the resume id in the route', () => {
      apiServiceSpy.delete.and.returnValue(of(okResponse(true)));
      service.deleteResume('resume-1').subscribe();

      expect(apiServiceSpy.delete).toHaveBeenCalledWith(jasmine.stringMatching(/resume-1$/), true);
    });
  });

  describe('updateResume', () => {
    it('should PUT to the resume\'s own route, with the resume id in the URL', () => {
      apiServiceSpy.put.and.returnValue(of(okResponse({} as never)));

      service.updateResume('resume-1', { fileName: 'new-name' }).subscribe();

      expect(apiServiceSpy.put).toHaveBeenCalledWith(jasmine.stringMatching(/resume-1$/), jasmine.anything(), true);
    });

    it('should send only fileName when documentType is omitted', () => {
      apiServiceSpy.put.and.returnValue(of(okResponse({} as never)));

      service.updateResume('resume-1', { fileName: 'new-name' }).subscribe();

      const body = apiServiceSpy.put.calls.mostRecent().args[1];
      expect(body).toEqual({ fileName: 'new-name' });
    });

    it('should send only documentType when fileName is omitted', () => {
      apiServiceSpy.put.and.returnValue(of(okResponse({} as never)));

      service.updateResume('resume-1', { documentType: DOCUMENT_TYPES.COVER_LETTER }).subscribe();

      const body = apiServiceSpy.put.calls.mostRecent().args[1];
      expect(body).toEqual({ documentType: DOCUMENT_TYPES.COVER_LETTER });
    });

    it('should send both fields when both are provided', () => {
      apiServiceSpy.put.and.returnValue(of(okResponse({} as never)));

      service.updateResume('resume-1', { fileName: 'new-name', documentType: DOCUMENT_TYPES.RESUME }).subscribe();

      const body = apiServiceSpy.put.calls.mostRecent().args[1];
      expect(body).toEqual({ fileName: 'new-name', documentType: DOCUMENT_TYPES.RESUME });
    });
  });

  describe('submitFeedback', () => {
    const feedback: FeedbackSubmission = { message: 'Great app', rating: 5, pageUrl: '/dashboard' };

    it('should show and hide the loader around the request', () => {
      apiServiceSpy.post.and.returnValue(of(okResponse(true)));
      service.submitFeedback(feedback);

      expect(loaderServiceSpy.showLoader).toHaveBeenCalled();
      expect(loaderServiceSpy.hideLoader).toHaveBeenCalled();
    });

    it('should track success and open the success dialog when the response succeeds', () => {
      apiServiceSpy.post.and.returnValue(of(okResponse(true)));
      service.submitFeedback(feedback);

      expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.FEEDBACK_SUBMISSION_SUCCESS, jasmine.objectContaining({
        rating: 5, has_comments: true
      }));
      expect(dialogHelperSpy.openSuccessDialog).toHaveBeenCalledWith(FEEDBACK_SUCCESS_TITLE, FEEDBACK_SUCCESS_MESSAGE);
    });

    it('should not open the success dialog when the response is unsuccessful', () => {
      apiServiceSpy.post.and.returnValue(of({ statusCode: 200, success: false, message: '' } as APIResponse<boolean>));
      service.submitFeedback(feedback);

      expect(dialogHelperSpy.openSuccessDialog).not.toHaveBeenCalled();
    });

    it('should track failure and still hide the loader when the request errors', () => {
      apiServiceSpy.post.and.returnValue(throwError(() => new Error('feedback failed')));
      service.submitFeedback(feedback);

      expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.FEEDBACK_SUBMISSION_FAILED, jasmine.objectContaining({ rating: 5 }));
      expect(loaderServiceSpy.hideLoader).toHaveBeenCalled();
    });

    it('should not throw when the request errors (has its own error handler, unlike some other services in this sweep)', () => {
      apiServiceSpy.post.and.returnValue(throwError(() => new Error('feedback failed')));
      expect(() => service.submitFeedback(feedback)).not.toThrow();
    });
  });
});
