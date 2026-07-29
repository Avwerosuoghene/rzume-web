import { animateCountUp } from './animation.helper';
import { StatHighlight } from '../models/interface/dashboard.models';

type TestStat = StatHighlight & { displayValue?: number };

describe('animateCountUp', () => {
  let rafCallbacks: FrameRequestCallback[];
  let rafSpy: jasmine.Spy;
  let cafSpy: jasmine.Spy;
  let nextId: number;

  beforeEach(() => {
    rafCallbacks = [];
    nextId = 1;
    rafSpy = spyOn(window, 'requestAnimationFrame').and.callFake((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return nextId++;
    });
    cafSpy = spyOn(window, 'cancelAnimationFrame');
  });

  function runFrame(timestamp: number): void {
    const cb = rafCallbacks.shift();
    cb?.(timestamp);
  }

  it('should schedule the first animation frame immediately', () => {
    animateCountUp({ description: 'Total', value: 100 }, 0, 500, () => {});
    expect(rafSpy).toHaveBeenCalledTimes(1);
  });

  it('should progressively update displayValue toward the target as frames advance', () => {
    const stat: TestStat = { description: 'Total', value: 100 };
    const onUpdate = jasmine.createSpy('onUpdate');

    animateCountUp(stat, 0, 1000, onUpdate);

    runFrame(1000);   // establishes startTime, progress = 0
    expect(stat.displayValue).toBe(0);

    runFrame(1500);   // 50% through the duration
    expect(stat.displayValue).toBeGreaterThan(0);
    expect(stat.displayValue).toBeLessThan(100);

    expect(onUpdate).toHaveBeenCalled();
  });

  it('should snap to the exact final value and stop scheduling once the duration elapses', () => {
    const stat: TestStat = { description: 'Total', value: 100 };
    const onUpdate = jasmine.createSpy('onUpdate');

    animateCountUp(stat, 0, 1000, onUpdate);

    runFrame(1000);              // start
    rafSpy.calls.reset();
    runFrame(1000 + 1000);       // progress = 1 (fully elapsed)

    expect(stat.displayValue).toBe(100);
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it('should animate from a non-zero start value toward the target', () => {
    const stat: TestStat = { description: 'Total', value: 50 };
    animateCountUp(stat, 10, 1000, () => {});

    runFrame(2000);
    expect(stat.displayValue).toBe(10);
  });

  it('should cancel the scheduled frame when the returned stop function is called', () => {
    const cancel = animateCountUp({ description: 'Total', value: 100 }, 0, 500, () => {});
    cancel();

    expect(cafSpy).toHaveBeenCalledWith(1);
  });
});
