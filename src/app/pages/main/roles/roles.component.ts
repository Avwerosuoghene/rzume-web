import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';
import { DialogHelperService } from '../../../core/services/dialog-helper.service';
import { RoleService } from '../../../core/services/role.service';
import { RoleStateService } from '../../../core/services/role-state.service';
import { AnalyticsEvent } from '../../../core/models/analytics-events.enum';
import { RoleHelper } from '../../../core/helpers/role.helper';
import { RoleCardComponent } from '../../../components/role-card/role-card.component';
import { EmptyStateComponent } from '../../../components/empty-state/empty-state.component';
import { RoleCardSkeletonComponent } from '../../../components/skeletons/role-card-skeleton/role-card-skeleton.component';
import { IconStat } from '../../../core/models/enums';
import { ROLE_ERROR_MESSAGES, ROLE_EMPTY_STATES } from '../../../core/models/constants/role.constants';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RoleCardComponent, EmptyStateComponent, RoleCardSkeletonComponent],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesComponent implements OnInit, OnDestroy {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly dialogHelperService = inject(DialogHelperService);
  private readonly roleService = inject(RoleService);
  private readonly roleStateService = inject(RoleStateService);

  private readonly destroy$ = new Subject<void>();

  readonly roleLimit = RoleHelper.getRoleLimit();
  readonly roles$ = this.roleStateService.roles$;
  readonly stats$ = this.roleStateService.stats$;
  readonly loading$ = this.roleStateService.loading$;
  readonly emptyState = ROLE_EMPTY_STATES.NO_ROLES;

  ngOnInit(): void {
    this.analyticsService.track(AnalyticsEvent.PAGE_VIEWED, { page: 'roles' });

    this.roleService.getRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: () => this.dialogHelperService.openInfoDialog(IconStat.failed, ROLE_ERROR_MESSAGES.LOAD_FAILED)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAddRoleDialog(): void {
    this.dialogHelperService.openAddRoleDialog();
  }
}
