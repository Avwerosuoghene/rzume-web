import { TestBed } from '@angular/core/testing';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LoaderService] });
    service = TestBed.inject(LoaderService);
  });

  it('should start with the loader hidden', (done) => {
    service.globalLoaderSubject.subscribe(isLoading => {
      expect(isLoading).toBe(false);
      done();
    });
  });

  it('should emit true after showLoader', (done) => {
    service.showLoader();
    service.globalLoaderSubject.subscribe(isLoading => {
      expect(isLoading).toBe(true);
      done();
    });
  });

  it('should emit false after hideLoader', (done) => {
    service.showLoader();
    service.hideLoader();
    service.globalLoaderSubject.subscribe(isLoading => {
      expect(isLoading).toBe(false);
      done();
    });
  });

  it('should give a late subscriber the current value immediately (shareReplay)', () => {
    service.showLoader();
    let received: boolean | undefined;
    service.globalLoaderSubject.subscribe(v => (received = v));
    expect(received).toBe(true);
  });
});
