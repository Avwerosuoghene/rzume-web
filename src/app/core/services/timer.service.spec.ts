import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TimerService } from './timer.service';

describe('TimerService', () => {
  let service: TimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TimerService] });
    service = TestBed.inject(TimerService);
  });

  afterEach(() => {
    service.clearTimer();
  });

  it('should emit a countdown tick every second', fakeAsync(() => {
    const emitted: Array<{ minutes: number; seconds: number; timer: number }> = [];
    service.timeValues$.subscribe(v => emitted.push(v));

    service.setTimer(1); // 60 seconds
    tick(1000);
    tick(1000);

    expect(emitted[0]).toEqual({ minutes: 0, seconds: 59, timer: 59 });
    expect(emitted[1]).toEqual({ minutes: 0, seconds: 58, timer: 58 });
    service.clearTimer();
  }));

  it('should clear the interval and stop emitting once the timer reaches zero', fakeAsync(() => {
    const emitted: Array<{ minutes: number; seconds: number; timer: number }> = [];
    service.timeValues$.subscribe(v => emitted.push(v));

    service.setTimer(0); // starts at 0 seconds — the very first tick sees timer===0 and clears
    tick(1000);

    expect(emitted.length).toBe(0);

    // Further ticks produce nothing further, confirming the interval was actually cleared
    tick(2000);
    expect(emitted.length).toBe(0);
  }));

  it('should not leak a running interval when setTimer is called again before the first finishes (fixed — see findings log #37)', fakeAsync(() => {
    const emitted: Array<{ minutes: number; seconds: number; timer: number }> = [];
    service.timeValues$.subscribe(v => emitted.push(v));

    service.setTimer(4); // 240s
    tick(1000); // one tick from the first timer: 239

    service.setTimer(4); // restart — should clear the first interval, not run both
    tick(1000); // one tick from the second timer only

    // If the bug were present, this tick would produce TWO emissions (one from each
    // still-running interval) instead of one.
    const emissionsAfterRestart = emitted.slice(1);
    expect(emissionsAfterRestart.length).toBe(1);
    expect(emissionsAfterRestart[0].timer).toBe(239);

    service.clearTimer();
  }));

  describe('clearTimer', () => {
    it('should stop emissions and be safe to call when no timer is running', () => {
      expect(() => service.clearTimer()).not.toThrow();
      expect(() => service.clearTimer()).not.toThrow();
    });
  });
});
