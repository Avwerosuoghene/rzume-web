import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { FeedbackButtonComponent } from './feedback-button.component';
import { ScreenManagerService } from '../../core/services/screen-manager.service';
import { MixpanelService } from '../../core/services/analytics/mixpanel.service';
import { AnalyticsEvent } from '../../core/models/analytics-events.enum';

describe('FeedbackButtonComponent', () => {
  let component: FeedbackButtonComponent;
  let fixture: ComponentFixture<FeedbackButtonComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockScreenManager: jasmine.SpyObj<ScreenManagerService>;
  let mockAnalytics: jasmine.SpyObj<MixpanelService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockScreenManager = jasmine.createSpyObj('ScreenManagerService', ['getIsMobileView'], {
      isMobile$: of(false)
    });
    mockAnalytics = jasmine.createSpyObj('MixpanelService', ['track']);
    mockRouter = jasmine.createSpyObj('Router', [], { url: '/dashboard' });

    await TestBed.configureTestingModule({
      imports: [FeedbackButtonComponent, MatDialogModule],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: ScreenManagerService, useValue: mockScreenManager },
        { provide: MixpanelService, useValue: mockAnalytics },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display desktop version when not mobile', () => {
    const compiled = fixture.nativeElement;
    const feedbackText = compiled.querySelector('.feedback-text');
    expect(feedbackText).toBeTruthy();
    expect(feedbackText.textContent).toContain('Hey you!!!');
  });

  it('should track analytics event when button is clicked', () => {
    component.openFeedbackDialog();

    expect(mockAnalytics.track).toHaveBeenCalledWith(
      AnalyticsEvent.FEEDBACK_BUTTON_CLICKED,
      {
        source: 'floating_button',
        page: '/dashboard'
      }
    );
  });

  it('should open feedback dialog when button is clicked', () => {
    component.openFeedbackDialog();

    expect(mockDialog.open).toHaveBeenCalledWith(
      jasmine.any(Function),
      {
        width: '480px',
        maxWidth: '90vw',
        panelClass: 'feedback-dialog-panel',
        disableClose: false
      }
    );
  });

  it('should have fixed positioning styles', () => {
    const button = fixture.nativeElement.querySelector('.feedback-button');
    expect(button).toBeTruthy();
  });

  it('should display feedback icon', () => {
    const icon = fixture.nativeElement.querySelector('.feedback-icon');
    expect(icon).toBeTruthy();
    expect(icon.getAttribute('src')).toBe('/assets/icons/chat-icon.svg');
  });

  it('should display orange dot on desktop', () => {
    const dot = fixture.nativeElement.querySelector('.feedback-dot');
    expect(dot).toBeTruthy();
  });
});
