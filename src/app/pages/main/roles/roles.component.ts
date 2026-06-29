import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';
import { AnalyticsEvent } from '../../../core/models/analytics-events.enum';
import { ROLE_LIMIT } from '../../../core/models/constants/role.constants';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  readonly roleLimit = ROLE_LIMIT;
  readonly roleCount = 0;

  ngOnInit(): void {
    this.analyticsService.track(AnalyticsEvent.PAGE_VIEWED, { page: 'roles' });
  }
}
