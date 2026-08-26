import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AnalyticsConsentComponent } from './analytics-consent.component';
import { AnalyticsService } from '../../core/services/analytics/analytics.service';

describe('AnalyticsConsentComponent', () => {
  let component: AnalyticsConsentComponent;
  let fixture: ComponentFixture<AnalyticsConsentComponent>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  beforeEach(async () => {
    localStorage.clear();
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['optIn', 'optOut', 'hasOptedOut']);

    await TestBed.configureTestingModule({
      imports: [AnalyticsConsentComponent],
      providers: [{ provide: AnalyticsService, useValue: analyticsServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsConsentComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not show the banner immediately on init', () => {
    fixture.detectChanges();
    expect(component.showBanner).toBe(false);
  });

  it('should show the banner after a 2 second delay when no consent decision is stored', fakeAsync(() => {
    fixture.detectChanges();
    tick(2000);
    expect(component.showBanner).toBe(true);
  }));

  it('should not show the banner if the user already accepted', fakeAsync(() => {
    localStorage.setItem('analytics_consent', 'accepted');
    fixture.detectChanges();
    tick(2000);
    expect(component.showBanner).toBe(false);
  }));

  it('should not show the banner if the user already declined', fakeAsync(() => {
    localStorage.setItem('analytics_consent', 'declined');
    fixture.detectChanges();
    tick(2000);
    expect(component.showBanner).toBe(false);
  }));

  describe('acceptAnalytics', () => {
    it('should persist acceptance, opt in to analytics, and hide the banner', fakeAsync(() => {
      fixture.detectChanges();
      tick(2000);
      expect(component.showBanner).toBe(true);

      component.acceptAnalytics();

      expect(localStorage.getItem('analytics_consent')).toBe('accepted');
      expect(analyticsServiceSpy.optIn).toHaveBeenCalled();
      expect(analyticsServiceSpy.optOut).not.toHaveBeenCalled();
      expect(component.showBanner).toBe(false);
    }));
  });

  describe('declineAnalytics', () => {
    it('should persist the decline, opt out of analytics, and hide the banner', fakeAsync(() => {
      fixture.detectChanges();
      tick(2000);
      expect(component.showBanner).toBe(true);

      component.declineAnalytics();

      expect(localStorage.getItem('analytics_consent')).toBe('declined');
      expect(analyticsServiceSpy.optOut).toHaveBeenCalled();
      expect(analyticsServiceSpy.optIn).not.toHaveBeenCalled();
      expect(component.showBanner).toBe(false);
    }));
  });
});
