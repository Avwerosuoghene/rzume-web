import { TestBed } from '@angular/core/testing';
import { UiStateService } from './ui-state.service';

describe('UiStateService', () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;

  function setWidth(width: number): void {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  }

  function setHeight(height: number): void {
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
  }

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
  });

  afterEach(() => {
    setWidth(originalInnerWidth);
    setHeight(originalInnerHeight);
    document.documentElement.style.removeProperty('--vh');
  });

  function createService(): UiStateService {
    TestBed.configureTestingModule({ providers: [UiStateService] });
    return TestBed.inject(UiStateService);
  }

  it('should initialize isMobile based on the width at construction', () => {
    setWidth(400);
    const service = createService();
    expect(service.isMobile).toBe(true);
  });

  it('should treat exactly the breakpoint width (599) as NOT mobile (uses "<", unlike ScreenManagerService\'s "<=" — see findings log #39)', () => {
    setWidth(599);
    const service = createService();
    expect(service.isMobile).toBe(false);
  });

  it('should treat width above the breakpoint as not mobile', () => {
    setWidth(1200);
    const service = createService();
    expect(service.isMobile).toBe(false);
  });

  it('should set the --vh CSS custom property based on innerHeight at construction', () => {
    setHeight(800);
    createService();
    expect(document.documentElement.style.getPropertyValue('--vh')).toBe('8px');
  });

  it('should update isMobile and --vh on a resize event', () => {
    setWidth(1200);
    setHeight(800);
    const service = createService();

    setWidth(400);
    setHeight(600);
    window.dispatchEvent(new Event('resize'));

    expect(service.isMobile).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--vh')).toBe('6px');
  });

  it('should emit the updated isMobile value on isMobile$', (done) => {
    setWidth(1200);
    const service = createService();
    let emissionCount = 0;

    service.isMobile$.subscribe(isMobile => {
      emissionCount++;
      if (emissionCount === 1) {
        expect(isMobile).toBe(false); // initial synchronous replay from the BehaviorSubject
      } else if (emissionCount === 2) {
        expect(isMobile).toBe(true); // after the resize below
        done();
      }
    });

    setWidth(400);
    window.dispatchEvent(new Event('resize'));
  });
});
