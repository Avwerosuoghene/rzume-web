import { TestBed } from '@angular/core/testing';

import { TimerUtilityService } from './timer-utility.service';

describe('TimerUtilityService', () => {
  let service: TimerUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
