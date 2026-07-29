import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  const backend = 'https://api.example.com';

  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const configServiceSpy = jasmine.createSpyObj('ConfigService', [], {
      apiUrls: { backend }
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: ConfigService, useValue: configServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('get', () => {
    it('should request the built URL and return the response body', (done) => {
      service.get<{ id: number }>({ route: 'jobs', handleResponse: false }).subscribe(result => {
        expect(result).toEqual({ id: 1 });
        done();
      });

      const req = httpMock.expectOne(`${backend}/jobs`);
      expect(req.request.method).toBe('GET');
      req.flush({ id: 1 });
    });

    it('should append query params', () => {
      service.get({
        route: 'jobs',
        handleResponse: false,
        params: [{ name: 'page', value: '2' }]
      }).subscribe();

      const req = httpMock.expectOne(r => r.url === `${backend}/jobs` && r.params.get('page') === '2');
      req.flush({});
    });

    it('should carry the correct statusCode (not undefined) on a failed request', (done) => {
      service.get({ route: 'jobs', handleResponse: false }).subscribe({
        error: (err) => {
          expect(err.statusCode).toBe(404);
          done();
        }
      });

      httpMock.expectOne(`${backend}/jobs`).flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should open an info dialog and still error when handleResponse is true', (done) => {
      service.get({ route: 'jobs', handleResponse: true }).subscribe({
        error: (err) => {
          expect(dialogSpy.open).toHaveBeenCalled();
          expect(err.statusCode).toBe(500);
          done();
        }
      });

      httpMock.expectOne(`${backend}/jobs`).flush('Server error', { status: 500, statusText: 'Server Error' });
    });

    it('should not open a dialog when handleResponse is false', (done) => {
      service.get({ route: 'jobs', handleResponse: false }).subscribe({
        error: () => {
          expect(dialogSpy.open).not.toHaveBeenCalled();
          done();
        }
      });

      httpMock.expectOne(`${backend}/jobs`).flush('error', { status: 500, statusText: 'Server Error' });
    });

    it('should fall back to a generic error message when the server gives none', (done) => {
      service.get({ route: 'jobs', handleResponse: false }).subscribe({
        error: (err) => {
          expect(err.errorMessage).toBeTruthy();
          done();
        }
      });

      httpMock.expectOne(`${backend}/jobs`).flush(null, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('post', () => {
    it('should POST the body with a JSON content-type header by default', () => {
      service.post('jobs', { title: 'Engineer' }, false).subscribe();

      const req = httpMock.expectOne(`${backend}/jobs`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({});
    });

    it('should carry the correct statusCode on a failed POST', (done) => {
      service.post('jobs', {}, false).subscribe({
        error: (err) => {
          expect(err.statusCode).toBe(400);
          done();
        }
      });

      httpMock.expectOne(`${backend}/jobs`).flush('bad request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('put', () => {
    it('should PUT the body to the built URL', () => {
      service.put('jobs/1', { title: 'Updated' }, false).subscribe();

      const req = httpMock.expectOne(`${backend}/jobs/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });
  });

  describe('delete', () => {
    it('should DELETE at the built URL', () => {
      service.delete('jobs/1', false).subscribe();

      const req = httpMock.expectOne(`${backend}/jobs/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should carry the correct statusCode on a failed DELETE', (done) => {
      service.delete('jobs/1', false).subscribe({
        error: (err) => {
          expect(err.statusCode).toBe(403);
          done();
        }
      });

      httpMock.expectOne(`${backend}/jobs/1`).flush('forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('custom headers', () => {
    it('should merge caller-supplied headers with the default content-type', () => {
      const customHeaders = new HttpHeaders({ 'X-Custom': 'value' });
      service.post('jobs', {}, false, customHeaders).subscribe();

      const req = httpMock.expectOne(`${backend}/jobs`);
      expect(req.request.headers.get('X-Custom')).toBe('value');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({});
    });

    it('should skip the default content-type header when useJsonContentType is false', () => {
      service.post('jobs', {}, false, undefined, false, false).subscribe();
      const req = httpMock.expectOne(`${backend}/jobs`);
      expect(req.request.headers.has('Content-Type')).toBe(false);
      req.flush({});
    });
  });
});
