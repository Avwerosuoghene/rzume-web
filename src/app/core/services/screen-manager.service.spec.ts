import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ScreenManagerService } from './screen-manager.service';

describe('ScreenManagerService', () => {
  let service: ScreenManagerService;
  let originalInnerWidth: number;

  function setWidth(width: number): void {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  }

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    setWidth(originalInnerWidth);
  });

  function createService(): void {
    TestBed.configureTestingModule({ providers: [ScreenManagerService] });
    service = TestBed.inject(ScreenManagerService);
  }

  it('should initialize isMobile based on the current window width at construction', () => {
    setWidth(400);
    createService();
    expect(service.getIsMobileView()).toBe(true);
  });

  it('should treat exactly the breakpoint width (599) as mobile', () => {
    setWidth(599);
    createService();
    expect(service.getIsMobileView()).toBe(true);
  });

  it('should treat 600 and above as not mobile', () => {
    setWidth(600);
    createService();
    expect(service.getIsMobileView()).toBe(false);
  });

  it('should update isMobile after a debounced resize event', fakeAsync(() => {
    setWidth(1200);
    createService();
    expect(service.getIsMobileView()).toBe(false);

    setWidth(400);
    window.dispatchEvent(new Event('resize'));
    tick(200);

    expect(service.getIsMobileView()).toBe(true);
  }));

  it('should not update isMobile before the debounce window elapses', fakeAsync(() => {
    setWidth(1200);
    createService();

    setWidth(400);
    window.dispatchEvent(new Event('resize'));
    tick(100);

    expect(service.getIsMobileView()).toBe(false);
    tick(100);
  }));

  it('should emit the current value immediately to a new subscriber of isMobile$', () => {
    setWidth(400);
    createService();

    let received: boolean | undefined;
    service.isMobile$.subscribe(v => (received = v));

    expect(received).toBe(true);
  });

  it('should stop listening to resize after ngOnDestroy', fakeAsync(() => {
    setWidth(1200);
    createService();
    service.ngOnDestroy();

    setWidth(400);
    window.dispatchEvent(new Event('resize'));
    tick(200);

    expect(service.getIsMobileView()).toBe(false);
  }));
});
