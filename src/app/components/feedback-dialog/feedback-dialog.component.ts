import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MixpanelService } from '../../core/services/analytics/mixpanel.service';
import { ProfileManagementService } from '../../core/services/profile-management.service';
import { AnalyticsEvent } from '../../core/models/analytics-events.enum';
import { FeedbackSubmission } from '../../core/models/interface/feedback.interface';
import { CircularLoaderComponent } from '../circular-loader';
import {
  FEEDBACK_DIALOG_TITLE,
  FEEDBACK_DIALOG_SUBTITLE,
  FEEDBACK_COMMENTS_LABEL,
  FEEDBACK_COMMENTS_PLACEHOLDER,
  FEEDBACK_SUBMIT_BUTTON,
  FEEDBACK_LATER_BUTTON,
  FEEDBACK_ERROR_MESSAGE,
  FEEDBACK_RATING_LABELS,
  FEEDBACK_RATING_MAX,
  FEEDBACK_COMMENTS_MAX_LENGTH
} from '../../core/models/constants/feedback.constants';

@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    CircularLoaderComponent
  ],
  templateUrl: './feedback-dialog.component.html',
  styleUrl: './feedback-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackDialogComponent {
  private analytics = inject(MixpanelService);
  private profileService = inject(ProfileManagementService);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<FeedbackDialogComponent>);
  private cdr = inject(ChangeDetectorRef);

  readonly title = FEEDBACK_DIALOG_TITLE;
  readonly subtitle = FEEDBACK_DIALOG_SUBTITLE;
  readonly commentsLabel = FEEDBACK_COMMENTS_LABEL;
  readonly commentsPlaceholder = FEEDBACK_COMMENTS_PLACEHOLDER;
  readonly submitButton = FEEDBACK_SUBMIT_BUTTON;
  readonly laterButton = FEEDBACK_LATER_BUTTON;
  readonly maxStars = FEEDBACK_RATING_MAX;
  readonly maxLength = FEEDBACK_COMMENTS_MAX_LENGTH;

  rating = 0;
  hoveredRating = 0;
  comments = '';
  isSubmitting = false;
  error: string | null = null;

  get ratingLabel(): string {
    const index = this.hoveredRating || this.rating;
    return FEEDBACK_RATING_LABELS[index];
  }

  get isSubmitDisabled(): boolean {
    return this.rating === 0 || this.isSubmitting;
  }

  getStarArray(): number[] {
    return Array.from({ length: this.maxStars }, (_, i) => i + 1);
  }

  onStarHover(star: number): void {
    this.hoveredRating = star;
  }

  onStarLeave(): void {
    this.hoveredRating = 0;
  }

  onStarClick(star: number): void {
    this.rating = star;
    this.error = null;
  }

  isStarFilled(star: number): boolean {
    const activeRating = this.hoveredRating || this.rating;
    return star <= activeRating;
  }

  submitFeedback(): void {
    if (this.isSubmitDisabled) return;

    const payload: FeedbackSubmission = {
      message: this.comments.trim() || '',
      rating: this.rating,
      pageUrl: this.router.url
    };

    this.dialogRef.close({ success: true, rating: this.rating, comments: this.comments });

    this.profileService.submitFeedback(payload);
  }

  onMaybeLater(): void {
    this.analytics.track(AnalyticsEvent.FEEDBACK_DISMISSED, {
      dismissal_type: 'maybe_later',
      rating_selected: this.rating > 0,
      has_comments: !!this.comments.trim()
    });

    this.dialogRef.close({ success: false });
  }

  onClose(): void {
    this.analytics.track(AnalyticsEvent.FEEDBACK_DISMISSED, {
      dismissal_type: 'close_button',
      rating_selected: this.rating > 0,
      has_comments: !!this.comments.trim()
    });

    this.dialogRef.close({ success: false });
  }
}
