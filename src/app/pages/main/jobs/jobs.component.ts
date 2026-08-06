import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';
import { AnalyticsEvent } from '../../../core/models/analytics-events.enum';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  isMobile = false;
  isLoading = false;

  ngOnInit(): void {
    this.analyticsService.track(AnalyticsEvent.PAGE_VIEWED, { page: 'jobs' });
  }

}
