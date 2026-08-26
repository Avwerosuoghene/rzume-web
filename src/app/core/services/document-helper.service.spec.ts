import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DocumentHelperService } from './document-helper.service';
import { ProfileManagementService } from './profile-management.service';
import { Resume } from '../models/interface/profile.models';
import { APIResponse } from '../models';
import { DialogCloseStatus } from '../models/enums/dialog.enums';

describe('DocumentHelperService', () => {
  let service: DocumentHelperService;
  let profileServiceSpy: jasmine.SpyObj<ProfileManagementService>;

  const resume = (id: string, fileName: string): Resume =>
    ({ id, fileName, uploadedAt: new Date(), url: 'http://example.com/r.pdf' });

  beforeEach(() => {
    profileServiceSpy = jasmine.createSpyObj('ProfileManagementService', ['getResumes']);

    TestBed.configureTestingModule({
      providers: [
        DocumentHelperService,
        { provide: ProfileManagementService, useValue: profileServiceSpy }
      ]
    });

    service = TestBed.inject(DocumentHelperService);
  });

  describe('fetchResumes', () => {
    it('should set resumes and stop loading on a successful response', () => {
      const r = resume('1', 'a.pdf');
      profileServiceSpy.getResumes.and.returnValue(of({ success: true, data: [r] } as APIResponse<Resume[]>));

      service.fetchResumes();

      expect(service.getResumes()).toEqual([r]);
    });

    it('should not update resumes when the response is unsuccessful', () => {
      profileServiceSpy.getResumes.and.returnValue(of({ success: false } as APIResponse<Resume[]>));
      service.fetchResumes();
      expect(service.getResumes()).toEqual([]);
    });

    it('should not throw an unhandled error when the request errors', () => {
      profileServiceSpy.getResumes.and.returnValue(throwError(() => new Error('network error')));
      expect(() => service.fetchResumes()).not.toThrow();
    });

    it('should stop loading even when the request errors', (done) => {
      profileServiceSpy.getResumes.and.returnValue(throwError(() => new Error('network error')));
      service.fetchResumes();

      service.isLoading$.subscribe(isLoading => {
        expect(isLoading).toBe(false);
        done();
      });
    });
  });

  describe('setResumes / getResumes / clearResumes', () => {
    it('should store and retrieve resumes', () => {
      const r = resume('1', 'a.pdf');
      service.setResumes([r]);
      expect(service.getResumes()).toEqual([r]);
    });

    it('should clear resumes back to an empty array', () => {
      service.setResumes([resume('1', 'a.pdf')]);
      service.clearResumes();
      expect(service.getResumes()).toEqual([]);
    });
  });

  describe('getSelectOptions', () => {
    it('should map resumes to select options', () => {
      service.setResumes([resume('1', 'a.pdf'), resume('2', 'b.pdf')]);
      expect(service.getSelectOptions()).toEqual([
        { value: '1', label: 'a.pdf' },
        { value: '2', label: 'b.pdf' }
      ]);
    });

    it('should add an upload option when there are no resumes at all', () => {
      service.setResumes([]);
      expect(service.getSelectOptions()).toEqual([{ value: 'upload-resume', label: '+ Upload Document' }]);
    });

    // This is the real gap fixed above: previously checked `all.length` (any resumes at all)
    // instead of `options.length` (anything selectable after exclusion) — with exactly one
    // resume and it excluded, the old code left an empty dropdown with no way to proceed.
    it('should add an upload option when exclusion filters out the only resume (previously a gap — see findings log #24)', () => {
      service.setResumes([resume('1', 'a.pdf')]);
      expect(service.getSelectOptions(['1'])).toEqual([{ value: 'upload-resume', label: '+ Upload Document' }]);
    });

    it('should exclude the given ids without adding an upload option when others remain', () => {
      service.setResumes([resume('1', 'a.pdf'), resume('2', 'b.pdf')]);
      expect(service.getSelectOptions(['1'])).toEqual([{ value: '2', label: 'b.pdf' }]);
    });
  });

  describe('handleSelection', () => {
    it('should navigate to the documents tab and close the dialog when "upload-resume" is selected', () => {
      const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
      const dialogRefSpy = jasmine.createSpyObj('dialogRef', ['close']);
      const event = { target: { value: 'upload-resume' } } as unknown as Event;

      service.handleSelection(event, routerSpy, dialogRefSpy);

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        ['/main/profile-management'],
        { queryParams: { tab: 'documents' } }
      );
      expect(dialogRefSpy.close).toHaveBeenCalledWith({ status: DialogCloseStatus.Cancelled });
    });

    it('should call onSelect with the chosen resume id otherwise', () => {
      const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
      const dialogRefSpy = jasmine.createSpyObj('dialogRef', ['close']);
      const onSelect = jasmine.createSpy('onSelect');
      const event = { target: { value: 'resume-1' } } as unknown as Event;

      service.handleSelection(event, routerSpy, dialogRefSpy, onSelect);

      expect(onSelect).toHaveBeenCalledWith('resume-1');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });
  });
});
