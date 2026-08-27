import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, combineLatest, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';
import { DialogHelperService } from '../../../core/services/dialog-helper.service';
import { RoleService } from '../../../core/services/role.service';
import { RoleStateService } from '../../../core/services/role-state.service';
import { SearchStateService } from '../../../core/services/search-state.service';
import { AnalyticsEvent } from '../../../core/models/analytics-events.enum';
import { RoleHelper } from '../../../core/helpers/role.helper';
import { RoleCardComponent } from '../../../components/role-card/role-card.component';
import { EmptyStateComponent } from '../../../components/empty-state/empty-state.component';
import { RoleCardSkeletonComponent } from '../../../components/skeletons/role-card-skeleton/role-card-skeleton.component';
import { CustomSearchInputComponent } from '../../../components/custom-search-input/custom-search-input.component';
import { IconStat } from '../../../core/models/enums';
import { ROLE_ERROR_MESSAGES, ROLE_EMPTY_STATES } from '../../../core/models/constants/role.constants';
import { Role } from '../../../core/models/interface/role.models';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RoleCardComponent, EmptyStateComponent, RoleCardSkeletonComponent, CustomSearchInputComponent],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesComponent implements OnInit, OnDestroy {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly dialogHelperService = inject(DialogHelperService);
  private readonly roleService = inject(RoleService);
  private readonly roleStateService = inject(RoleStateService);
  private readonly searchStateService = inject(SearchStateService);

  private readonly destroy$ = new Subject<void>();

  readonly roleLimit = RoleHelper.getRoleLimit();
  readonly roles$ = this.roleStateService.roles$;
  readonly stats$ = this.roleStateService.stats$;
  readonly loading$ = this.roleStateService.loading$;
  readonly emptyState = ROLE_EMPTY_STATES.NO_ROLES;
  readonly noSearchResultsState = ROLE_EMPTY_STATES.NO_SEARCH_RESULTS;

  // Matches title OR industry — the same shared search box the mobile header uses for every page
  // (see the global-search plan in the vault) feeds this via SearchStateService.searchTerm$.
  readonly filteredRoles$: Observable<Role[]> = combineLatest([
    this.roleStateService.roles$,
    this.searchStateService.searchTerm$
  ]).pipe(
    map(([roles, term]) => this.filterRoles(roles, term))
  );

  private filterRoles(roles: Role[], term: string): Role[] {
    const query = term.trim().toLowerCase();
    if (!query) return roles;
    return roles.filter(role =>
      role.title.toLowerCase().includes(query) || role.industryName.toLowerCase().includes(query)
    );
  }

  onSearchChange(term: string): void {
    this.searchStateService.updateSearchTerm(term);
  }

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

  onEditRole(role: Role): void {
    this.dialogHelperService.openEditRoleDialog(role, () => {});
  }

  onDeleteRole(role: Role): void {
    this.dialogHelperService.openDeleteRoleConfirmation(role, () => {});
  }

  onDeleteRoleDocument(event: { role: Role; documentId: string }): void {
    this.dialogHelperService.openDeleteRoleDocumentConfirmation(event.role, event.documentId, () => {});
  }
}
