import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ScreenManagerService } from '../../core/services/screen-manager.service';
import { MixpanelService } from '../../core/services/analytics/mixpanel.service';
import { AnalyticsEvent } from '../../core/models/analytics-events.enum';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';

@Component({
  selector: 'app-feedback-button',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './feedback-button.component.html',
  styleUrl: './feedback-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackButtonComponent {
  private dialog = inject(MatDialog);
  private screenManager = inject(ScreenManagerService);
  private analytics = inject(MixpanelService);
  private router = inject(Router);

  isMobile$: Observable<boolean> = this.screenManager.isMobile$;

  openFeedbackDialog(): void {
    this.analytics.track(AnalyticsEvent.FEEDBACK_BUTTON_CLICKED, {
      source: 'floating_button',
      page: this.router.url
    });

    this.dialog.open(FeedbackDialogComponent, {
      width: '480px',
      maxWidth: '90vw',
      panelClass: 'feedback-dialog-panel',
      backdropClass: 'blurred',
      disableClose: false
    });
  }
}
