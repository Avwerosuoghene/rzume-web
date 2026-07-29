import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AnalyticsInterceptor } from './analytics.interceptor';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { AnalyticsEvent } from '../models/analytics-events.enum';

describe('AnalyticsInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  beforeEach(() => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['track']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
        { provide: HTTP_INTERCEPTORS, useClass: AnalyticsInterceptor, multi: true }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should track a successful call with status code and duration', (done) => {
    httpClient.get('/api/jobs').subscribe(() => {
      expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.API_CALL_SUCCESS, jasmine.objectContaining({
        endpoint: '/api/jobs',
        method: 'GET',
        status_code: 200
      }));
      done();
    });

    httpMock.expectOne('/api/jobs').flush({ ok: true });
  });

  it('should track a failed call with the error status', (done) => {
    httpClient.get('/api/jobs').subscribe({
      error: () => {
        expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.API_CALL_FAILED, jasmine.objectContaining({
          endpoint: '/api/jobs',
          method: 'GET',
          status_code: 401
        }));
        done();
      }
    });

    httpMock.expectOne('/api/jobs').flush('unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  // Real bug fixed here: previously, if track() itself threw inside tap's error callback,
  // RxJS would replace the real HttpErrorResponse with the tracking error on the stream —
  // corrupting what downstream code (e.g. an auth interceptor's 401 check) actually sees.
  // See test-backfill-findings.md #42.
  it('should still deliver the real HttpErrorResponse (with the correct status) even if analytics tracking itself throws', (done) => {
    analyticsServiceSpy.track.and.throwError('analytics down');
    spyOn(console, 'error');

    httpClient.get('/api/jobs').subscribe({
      error: (err) => {
        expect(err.status).toBe(401);
        done();
      }
    });

    httpMock.expectOne('/api/jobs').flush('unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should not throw when analytics tracking fails on a successful response', (done) => {
    analyticsServiceSpy.track.and.throwError('analytics down');
    spyOn(console, 'error');

    httpClient.get('/api/jobs').subscribe(() => {
      done();
    });

    httpMock.expectOne('/api/jobs').flush({ ok: true });
  });
});
