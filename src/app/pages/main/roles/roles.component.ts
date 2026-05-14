import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';
import { AnalyticsEvent } from '../../../core/models/analytics-events.enum';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesComponent implements OnInit {

  private analyticsService = inject(AnalyticsService);

  isLoading = false;

  ngOnInit(): void {
    this.analyticsService.track(AnalyticsEvent.PAGE_VIEWED, { page: 'roles' });
  }
}
