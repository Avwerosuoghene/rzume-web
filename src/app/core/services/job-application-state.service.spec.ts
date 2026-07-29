import { TestBed } from '@angular/core/testing';
import { JobApplicationStateService } from './job-application-state.service';
import { PaginatedItem } from '../models';
import { JobApplicationItem } from '../models/interface/job-application.models';

describe('JobApplicationStateService', () => {
  let service: JobApplicationStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [JobApplicationStateService] });
    service = TestBed.inject(JobApplicationStateService);
  });

  it('should start with the default pagination state and no items', (done) => {
    service.getApplications().subscribe(state => {
      expect(state).toEqual({
        items: [],
        totalCount: 0,
        totalPages: 1,
        pageNumber: 1,
        pageSize: 5,
        hasPrevious: false,
        hasNext: false
      });
      done();
    });
  });

  it('should emit the updated state to existing subscribers when updateApplications is called', (done) => {
    const newState: PaginatedItem<JobApplicationItem> = {
      items: [{ id: '1' } as JobApplicationItem],
      totalCount: 1,
      totalPages: 1,
      pageNumber: 1,
      pageSize: 5,
      hasPrevious: false,
      hasNext: false
    };

    let callCount = 0;
    service.getApplications().subscribe(state => {
      callCount++;
      if (callCount === 2) {
        expect(state).toEqual(newState);
        done();
      }
    });

    service.updateApplications(newState);
  });

  it('should give a late subscriber the current state immediately (BehaviorSubject replay)', () => {
    const newState: PaginatedItem<JobApplicationItem> = {
      items: [{ id: '1' } as JobApplicationItem],
      totalCount: 1, totalPages: 1, pageNumber: 1, pageSize: 5, hasPrevious: false, hasNext: false
    };
    service.updateApplications(newState);

    let received: PaginatedItem<JobApplicationItem> | undefined;
    service.getApplications().subscribe(state => (received = state));

    expect(received).toEqual(newState);
  });
});
