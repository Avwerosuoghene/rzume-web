import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { JobApplicationService } from './job-application.service';
import { ApiService } from './api.service';
import { JobApplicationStateService } from './job-application-state.service';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsEvent } from '../models/analytics-events.enum';
import { APIResponse, PaginatedItem } from '../models';
import { ApplicationStatus } from '../models/enums/shared.enums';
import { CreateApplicationPayload, JobApplicationItem, UpdateApplicationPayload } from '../models/interface/job-application.models';

describe('JobApplicationService', () => {
  let service: JobApplicationService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let stateServiceSpy: jasmine.SpyObj<JobApplicationStateService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  const okResponse = <T>(data?: T): APIResponse<T> => ({ statusCode: 200, success: true, message: '', data });

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);
    stateServiceSpy = jasmine.createSpyObj('JobApplicationStateService', ['updateApplications']);
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['track', 'incrementUserProperty']);

    TestBed.configureTestingModule({
      providers: [
        JobApplicationService,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: JobApplicationStateService, useValue: stateServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy }
      ]
    });

    service = TestBed.inject(JobApplicationService);
  });

  describe('addApplication', () => {
    const payload: CreateApplicationPayload = { companyName: 'Acme', position: 'Eng', status: ApplicationStatus.Applied };

    it('should track creation and increment total_applications on success, and refresh the list', () => {
      apiServiceSpy.post.and.returnValue(of(okResponse(true)));
      apiServiceSpy.get.and.returnValue(of(okResponse({ items: [] } as unknown as PaginatedItem<JobApplicationItem>)));

      service.addApplication(payload).subscribe();

      expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.JOB_APPLICATION_CREATED, jasmine.objectContaining({
        company: 'Acme', position: 'Eng'
      }));
      expect(analyticsServiceSpy.incrementUserProperty).toHaveBeenCalledWith('total_applications', 1);
      expect(apiServiceSpy.get).toHaveBeenCalled();
    });

    it('should not refresh the list or increment the counter when the response is unsuccessful', () => {
      apiServiceSpy.post.and.returnValue(of({ statusCode: 200, success: false, message: '', data: false } as APIResponse<boolean>));
      service.addApplication(payload).subscribe();

      expect(apiServiceSpy.get).not.toHaveBeenCalled();
      expect(analyticsServiceSpy.incrementUserProperty).not.toHaveBeenCalled();
    });

    it('should not throw an unhandled error when the post-add refresh itself fails', () => {
      apiServiceSpy.post.and.returnValue(of(okResponse(true)));
      apiServiceSpy.get.and.returnValue(throwError(() => new Error('refresh failed')));

      expect(() => service.addApplication(payload).subscribe()).not.toThrow();
    });

    it('should track failure and re-throw when the create call errors', (done) => {
      const error = new Error('create failed');
      apiServiceSpy.post.and.returnValue(throwError(() => error));

      service.addApplication(payload).subscribe({
        error: (err) => {
          expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.JOB_APPLICATION_CREATE_FAILED, jasmine.objectContaining({
            company: 'Acme', position: 'Eng'
          }));
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('updateStatus', () => {
    it('should track a status change on success', (done) => {
      apiServiceSpy.put.and.returnValue(of(okResponse(true)));
      const item = { status: ApplicationStatus.InProgress } as JobApplicationItem;

      service.updateStatus(item, 'app-1').subscribe(() => {
        expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.JOB_APPLICATION_STATUS_CHANGED, {
          application_id: 'app-1',
          new_status: ApplicationStatus.InProgress
        });
        done();
      });
    });
  });

  describe('updateJobApplication', () => {
    it('should PUT to the application-specific URL using the given id', () => {
      apiServiceSpy.put.and.returnValue(of(okResponse(true)));
      const payload: UpdateApplicationPayload = { position: 'Senior Eng' };

      service.updateJobApplication('app-1', payload).subscribe();

      expect(apiServiceSpy.put).toHaveBeenCalledWith(
        jasmine.stringMatching(/\/app-1$/),
        payload,
        true
      );
    });

    it('should track the update on success', (done) => {
      apiServiceSpy.put.and.returnValue(of(okResponse(true)));
      const payload: UpdateApplicationPayload = { position: 'Senior Eng' };

      service.updateJobApplication('app-1', payload).subscribe(() => {
        expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.JOB_APPLICATION_UPDATED, { application_id: 'app-1' });
        done();
      });
    });
  });

  describe('deleteApplication', () => {
    it('should track a single deletion when only one id is given', (done) => {
      apiServiceSpy.delete.and.returnValue(of(okResponse(true)));

      service.deleteApplication({ ids: ['1'] }).subscribe(() => {
        expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.JOB_APPLICATION_DELETED);
        done();
      });
    });

    it('should track a bulk deletion with the count when multiple ids are given', (done) => {
      apiServiceSpy.delete.and.returnValue(of(okResponse(true)));

      service.deleteApplication({ ids: ['1', '2', '3'] }).subscribe(() => {
        expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.JOB_APPLICATION_BULK_DELETED, { count: 3 });
        done();
      });
    });
  });

  describe('getApplications', () => {
    it('should update state with the returned page on success', (done) => {
      const page = { items: [{ id: '1' } as JobApplicationItem] } as PaginatedItem<JobApplicationItem>;
      apiServiceSpy.get.and.returnValue(of(okResponse(page)));

      service.getApplications().subscribe(() => {
        expect(stateServiceSpy.updateApplications).toHaveBeenCalledWith(page);
        done();
      });
    });

    it('should track a search-initiated event when the search query changes', () => {
      apiServiceSpy.get.and.returnValue(of(okResponse({ items: [] } as unknown as PaginatedItem<JobApplicationItem>)));

      service.getApplications({ searchQuery: 'engineer' }).subscribe();

      expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.JOB_SEARCH_INITIATED, { search_term: 'engineer' });
    });

    it('should not re-track search-initiated when the same search query is repeated', () => {
      apiServiceSpy.get.and.returnValue(of(okResponse({ items: [] } as unknown as PaginatedItem<JobApplicationItem>)));

      service.getApplications({ searchQuery: 'engineer' }).subscribe();
      analyticsServiceSpy.track.calls.reset();
      service.getApplications({ searchQuery: 'engineer' }).subscribe();

      expect(analyticsServiceSpy.track).not.toHaveBeenCalledWith(AnalyticsEvent.JOB_SEARCH_INITIATED, jasmine.any(Object));
    });

    it('should track a filter-applied event when the status filter changes', () => {
      apiServiceSpy.get.and.returnValue(of(okResponse({ items: [] } as unknown as PaginatedItem<JobApplicationItem>)));

      service.getApplications({ status: ApplicationStatus.Rejected }).subscribe();

      expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.JOB_FILTER_APPLIED, {
        filter_type: 'status',
        filter_value: ApplicationStatus.Rejected
      });
    });

    it('should track a search-failed event and re-throw when the request errors', (done) => {
      const error = new Error('search failed');
      apiServiceSpy.get.and.returnValue(throwError(() => error));

      service.getApplications({ searchQuery: 'x' }).subscribe({
        error: (err) => {
          expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.JOB_SEARCH_FAILED, jasmine.any(Object));
          expect(err).toBe(error);
          done();
        }
      });
    });

    it('should omit undefined/empty filter fields from the request params', () => {
      apiServiceSpy.get.and.returnValue(of(okResponse({ items: [] } as unknown as PaginatedItem<JobApplicationItem>)));

      service.getApplications({ searchQuery: 'x' }).subscribe();

      const calledOptions = apiServiceSpy.get.calls.mostRecent().args[0] as { params: Array<{ name: string }> };
      const paramNames = calledOptions.params.map(p => p.name);
      expect(paramNames).toContain('searchQuery');
      expect(paramNames).not.toContain('status');
      expect(paramNames).not.toContain('startDate');
    });
  });

  describe('getStats', () => {
    it('should request the stats endpoint with bearer auth', () => {
      apiServiceSpy.get.and.returnValue(of(okResponse({} as never)));
      service.getStats().subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith(jasmine.objectContaining({
        withBearer: true,
        handleResponse: true
      }));
    });
  });
});
