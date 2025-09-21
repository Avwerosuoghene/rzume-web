import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { JobApplicationService } from './job-application.service';
import { ApiService } from './api.service';
import { JobApplicationStateService } from './job-application-state.service';

describe('JobApplicationService', () => {
  let service: JobApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        JobApplicationService,
        ApiService,
        JobApplicationStateService
      ]
    });
    service = TestBed.inject(JobApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
