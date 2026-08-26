import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpHeaders, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthHelperService } from '../services/auth-helper.service';
import { TokenStorageUtil } from '../helpers/token-storage.util';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authHelperSpy: jasmine.SpyObj<AuthHelperService>;

  beforeEach(() => {
    authHelperSpy = jasmine.createSpyObj('AuthHelperService', ['logout']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthHelperService, useValue: authHelperSpy },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should attach the bearer token when one is stored and no Authorization header is set', () => {
    spyOn(TokenStorageUtil, 'getToken').and.returnValue('tok-1');

    httpClient.get('/api/jobs').subscribe();

    const req = httpMock.expectOne('/api/jobs');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok-1');
    req.flush({});
  });

  it('should not attach a token when none is stored', () => {
    spyOn(TokenStorageUtil, 'getToken').and.returnValue(null);

    httpClient.get('/api/jobs').subscribe();

    const req = httpMock.expectOne('/api/jobs');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should not overwrite an Authorization header the caller already set', () => {
    spyOn(TokenStorageUtil, 'getToken').and.returnValue('tok-1');

    httpClient.get('/api/jobs', { headers: new HttpHeaders({ Authorization: 'Bearer custom-token' }) }).subscribe();

    const req = httpMock.expectOne('/api/jobs');
    expect(req.request.headers.get('Authorization')).toBe('Bearer custom-token');
    req.flush({});
  });

  it('should log out and swallow the error (complete silently) on a 401 response', (done) => {
    spyOn(TokenStorageUtil, 'getToken').and.returnValue('tok-1');

    httpClient.get('/api/jobs').subscribe({
      next: () => fail('should not emit a value'),
      error: () => fail('should not error — 401 completes silently after logout'),
      complete: () => {
        expect(authHelperSpy.logout).toHaveBeenCalled();
        done();
      }
    });

    httpMock.expectOne('/api/jobs').flush('unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should re-throw the error and NOT log out for a non-401 error', (done) => {
    spyOn(TokenStorageUtil, 'getToken').and.returnValue('tok-1');

    httpClient.get('/api/jobs').subscribe({
      error: (err) => {
        expect(err.status).toBe(500);
        expect(authHelperSpy.logout).not.toHaveBeenCalled();
        done();
      }
    });

    httpMock.expectOne('/api/jobs').flush('server error', { status: 500, statusText: 'Server Error' });
  });
});
