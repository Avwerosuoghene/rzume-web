import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FeedbackDialogComponent } from './feedback-dialog.component';
import { MixpanelService } from '../../core/services/analytics/mixpanel.service';
import { AnalyticsEvent } from '../../core/models/analytics-events.enum';
import {
  FEEDBACK_DIALOG_TITLE,
  FEEDBACK_DIALOG_SUBTITLE,
  FEEDBACK_SUBMIT_BUTTON,
  FEEDBACK_LATER_BUTTON
} from '../../core/models/constants/feedback.constants';

describe('FeedbackDialogComponent', () => {
  let component: FeedbackDialogComponent;
  let fixture: ComponentFixture<FeedbackDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<FeedbackDialogComponent>>;
  let mockAnalytics: jasmine.SpyObj<MixpanelService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockAnalytics = jasmine.createSpyObj('MixpanelService', ['track']);
    mockRouter = jasmine.createSpyObj('Router', [], { url: '/dashboard' });

    await TestBed.configureTestingModule({
      imports: [
        FeedbackDialogComponent,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        FormsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MixpanelService, useValue: mockAnalytics },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display dialog title and subtitle', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.feedback-title');
    const subtitle = compiled.querySelector('.feedback-subtitle');

    expect(title.textContent).toContain(FEEDBACK_DIALOG_TITLE);
    expect(subtitle.textContent).toContain(FEEDBACK_DIALOG_SUBTITLE);
  });

  it('should render 5 stars', () => {
    const stars = fixture.nativeElement.querySelectorAll('.star-button');
    expect(stars.length).toBe(5);
  });

  it('should update rating when star is clicked', () => {
    const stars = fixture.nativeElement.querySelectorAll('.star-button');
    stars[2].click();
    fixture.detectChanges();

    expect(component.rating).toBe(3);
  });

  it('should update hovered rating on star hover', () => {
    component.onStarHover(4);
    expect(component.hoveredRating).toBe(4);
  });

  it('should reset hovered rating on star leave', () => {
    component.onStarHover(4);
    component.onStarLeave();
    expect(component.hoveredRating).toBe(0);
  });

  it('should disable submit button when no rating selected', () => {
    component.rating = 0;
    expect(component.isSubmitDisabled).toBe(true);
  });

  it('should enable submit button when rating is selected', () => {
    component.rating = 3;
    component.isSubmitting = false;
    expect(component.isSubmitDisabled).toBe(false);
  });

  it('should call profile service with complete payload on feedback submission', () => {
    component.rating = 4;
    component.comments = 'Great app!';
    spyOn(component['profileService'], 'submitFeedback');

    component.submitFeedback();

    expect(component['profileService'].submitFeedback).toHaveBeenCalledWith({
      message: 'Great app!',
      rating: 4,
      pageUrl: jasmine.any(String)
    });
  });

  it('should close dialog immediately on submit', () => {
    component.rating = 5;
    component.comments = 'Excellent!';
    spyOn(component['profileService'], 'submitFeedback');

    component.submitFeedback();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      success: true,
      rating: 5,
      comments: 'Excellent!'
    });
  });

  it('should track analytics event when dismissed with maybe later', () => {
    component.rating = 3;
    component.comments = 'Some feedback';

    component.onMaybeLater();

    expect(mockAnalytics.track).toHaveBeenCalledWith(
      AnalyticsEvent.FEEDBACK_DISMISSED,
      {
        dismissal_type: 'maybe_later',
        rating_selected: true,
        has_comments: true
      }
    );
  });

  it('should track analytics event when dismissed with close button', () => {
    component.rating = 0;
    component.comments = '';

    component.onClose();

    expect(mockAnalytics.track).toHaveBeenCalledWith(
      AnalyticsEvent.FEEDBACK_DISMISSED,
      {
        dismissal_type: 'close_button',
        rating_selected: false,
        has_comments: false
      }
    );
  });

  it('should close dialog with failure when maybe later is clicked', () => {
    component.onMaybeLater();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ success: false });
  });

  it('should display comments textarea', () => {
    const textarea = fixture.nativeElement.querySelector('.comments-textarea');
    expect(textarea).toBeTruthy();
  });

  it('should bind comments to textarea', () => {
    const textarea = fixture.nativeElement.querySelector('.comments-textarea');
    component.comments = 'Test comment';
    fixture.detectChanges();

    expect(component.comments).toBe('Test comment');
  });

  it('should display submit and later buttons', () => {
    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('.submit-button');
    const laterButton = compiled.querySelector('.later-button');

    expect(submitButton.textContent).toContain(FEEDBACK_SUBMIT_BUTTON);
    expect(laterButton.textContent).toContain(FEEDBACK_LATER_BUTTON);
  });

  it('should show loading state during submission', fakeAsync(() => {
    component.rating = 4;
    component.submitFeedback();

    expect(component.isSubmitting).toBe(true);

    tick(1500);

    expect(component.isSubmitting).toBe(false);
  }));

  it('should return correct rating label', () => {
    component.rating = 0;
    expect(component.ratingLabel).toBe('');

    component.rating = 1;
    expect(component.ratingLabel).toBe('Poor');

    component.rating = 5;
    expect(component.ratingLabel).toBe('Amazing');
  });

  it('should determine if star is filled correctly', () => {
    component.rating = 3;
    expect(component.isStarFilled(1)).toBe(true);
    expect(component.isStarFilled(3)).toBe(true);
    expect(component.isStarFilled(4)).toBe(false);
  });

  it('should prioritize hovered rating over selected rating', () => {
    component.rating = 2;
    component.hoveredRating = 4;

    expect(component.isStarFilled(3)).toBe(true);
    expect(component.isStarFilled(5)).toBe(false);
  });
});
