import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';
import { AnalyticsEvent } from '../../../core/models/analytics-events.enum';
import { RoleHelper } from '../../../core/helpers/role.helper';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);

  readonly roleLimit = RoleHelper.getRoleLimit();
  readonly roleCount = 0;

  ngOnInit(): void {
    this.analyticsService.track(AnalyticsEvent.PAGE_VIEWED, { page: 'roles' });
  }
}
