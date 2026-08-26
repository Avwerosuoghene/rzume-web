import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { AnalyticsTrackingService } from './analytics-tracking.service';
import { AnalyticsService } from './analytics/analytics.service';

describe('AnalyticsTrackingService', () => {
  let service: AnalyticsTrackingService;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let routerEvents$: Subject<RouterEvent>;

  beforeEach(() => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['trackPageView']);
    routerEvents$ = new Subject<RouterEvent>();

    TestBed.configureTestingModule({
      providers: [
        AnalyticsTrackingService,
        { provide: Router, useValue: { events: routerEvents$.asObservable() } },
        { provide: AnalyticsService, useValue: analyticsServiceSpy }
      ]
    });

    service = TestBed.inject(AnalyticsTrackingService);
    service.ngOnInit();
  });

  function emitNavigation(url: string): void {
    routerEvents$.next(new NavigationEnd(1, url, url));
  }

  it('should track "home" for the root URL', () => {
    emitNavigation('/');
    expect(analyticsServiceSpy.trackPageView).toHaveBeenCalledWith('home', { url: '/' });
  });

  it('should track the auth sub-page name', () => {
    emitNavigation('/auth/login');
    expect(analyticsServiceSpy.trackPageView).toHaveBeenCalledWith('login', { url: '/auth/login' });
  });

  it('should default to "auth" when no auth sub-page is given', () => {
    emitNavigation('/auth');
    expect(analyticsServiceSpy.trackPageView).toHaveBeenCalledWith('auth', { url: '/auth' });
  });

  it('should track the main sub-page name', () => {
    emitNavigation('/main/jobs');
    expect(analyticsServiceSpy.trackPageView).toHaveBeenCalledWith('jobs', { url: '/main/jobs' });
  });

  it('should default to "dashboard" when no main sub-page is given', () => {
    emitNavigation('/main');
    expect(analyticsServiceSpy.trackPageView).toHaveBeenCalledWith('dashboard', { url: '/main' });
  });

  it('should join other path segments with underscores', () => {
    emitNavigation('/some/other/path');
    expect(analyticsServiceSpy.trackPageView).toHaveBeenCalledWith('some_other_path', { url: '/some/other/path' });
  });

  it('should ignore non-NavigationEnd router events', () => {
    routerEvents$.next({ id: 1 } as RouterEvent);
    expect(analyticsServiceSpy.trackPageView).not.toHaveBeenCalled();
  });
});
