import { TestBed } from '@angular/core/testing';
import { MockDataService } from './mock-data.service';

// NOTE: confirmed via grep that MockDataService has zero real consumers anywhere in the app —
// this is dead scaffolding, likely leftover from early development. Kept this test lightweight
// rather than exhaustive given its unused status. See test-backfill-findings.md #31.
describe('MockDataService', () => {
  let service: MockDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockDataService] });
    service = TestBed.inject(MockDataService);
  });

  it('should return the first page of mock orders', (done) => {
    service.getOrders(1, 5).subscribe(response => {
      expect(response.isSuccess).toBe(true);
      expect(response.data.data.length).toBe(5);
      done();
    });
  });

  it('should return the remaining orders on the second page', (done) => {
    service.getOrders(2, 5).subscribe(response => {
      expect(response.data.data.length).toBe(1);
      done();
    });
  });
});
