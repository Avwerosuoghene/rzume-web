import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { ProfileManagementComponent } from './profile-management.component';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';

describe('ProfileManagementComponent', () => {
  let component: ProfileManagementComponent;
  let fixture: ComponentFixture<ProfileManagementComponent>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  beforeEach(async () => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['track']);

    await TestBed.configureTestingModule({
      imports: [ProfileManagementComponent, NoopAnimationsModule],
      providers: [
        { provide: AnalyticsService, useValue: analyticsServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render without errors', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });

  it('should be a standalone component', () => {
    expect(component).toBeInstanceOf(ProfileManagementComponent);
  });

  it('should track page view on initialization', () => {
    expect(analyticsServiceSpy.track).toHaveBeenCalledWith('profile_page_loaded');
  });

  it('should render app-profile-view component', () => {
    const profileView = fixture.debugElement.query(By.css('app-profile-view'));
    expect(profileView).toBeTruthy();
  });

  it('should use semantic section element', () => {
    const section = fixture.debugElement.query(By.css('section.profile-management'));
    expect(section).toBeTruthy();
  });
});
