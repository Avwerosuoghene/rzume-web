import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CustomTableComponent } from '../../../components/custom-table/custom-table.component';
import { AngularMaterialModules, CoreModules } from '../../../core/modules';
import { ColumnDefinition } from '../../../core/models/interface/dashboard.models';
import { EMPTY_STATES, JOB_TABLE_COLUMNS, PAGINATION_DEFAULTS } from '../../../core/models/constants/dashboard.constants';
import { Subject, takeUntil, finalize } from 'rxjs';
import { JobListToolbarComponent } from '../../../components/job-list-toolbar/job-list-toolbar.component';
import { JobStatsComponent } from '../../../components/job-stats/job-stats.component';
import { JobApplicationService } from '../../../core/services/job-application.service';
import { JobApplicationStateService } from '../../../core/services/job-application-state.service';
import { JobApplicationItem, JobApplicationFilter, DeleteApplicationsPayload, JobApplicationStatItemDto } from '../../../core/models/interface/job-application.models';
import { ScreenManagerService, SearchStateService, DocumentHelperService } from '../../../core/services';
import { Resume } from '../../../core/models/interface/profile.models';
import { JobCardListComponent } from "../../../components/job-card-list/job-card-list.component";
import { EmptyStateWrapperComponent } from "../../../components/empty-state-wrapper/empty-state-wrapper.component";
import { buildPagination, mapApplicationToTableData, mapJobStats, normalizeFilter, resetPagination, updateFilterState, updatePagination } from '../../../core/helpers/dashboard.utils';
import { ITEMS_INCREMENT } from '../../../core/models';
import { DialogHelperService } from '../../../core/services/dialog-helper.service';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';
import { AnalyticsEvent } from '../../../core/models/analytics-events.enum';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AngularMaterialModules,
    CoreModules,
    JobListToolbarComponent,
    CustomTableComponent,
    JobStatsComponent,
    JobCardListComponent,
    EmptyStateWrapperComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly EMPTY_STATES = EMPTY_STATES;
  readonly JOB_TABLE_COLUMNS = JOB_TABLE_COLUMNS;

  statHighLights: JobApplicationStatItemDto[] = [];
  data: JobApplicationItem[] = [];
  jobListColumns: Array<ColumnDefinition> = this.JOB_TABLE_COLUMNS;
  resumes: Resume[] = [];

  totalPages = PAGINATION_DEFAULTS.totalPages;
  currentPage = PAGINATION_DEFAULTS.currentPage;
  itemsPerPage = PAGINATION_DEFAULTS.itemsPerPage;
  totalItems = PAGINATION_DEFAULTS.totalItems;


  selectedItems: Array<JobApplicationItem> = [];
  showEmptyState = true;
  isLoading = false;
  isMobile = false;

  currentFilter: JobApplicationFilter = {};
  private destroy$ = new Subject<void>();

  constructor(
    private state: JobApplicationStateService,
    private jobApplicationService: JobApplicationService,
    private searchStateService: SearchStateService,
    private screenManager: ScreenManagerService,
    private dialogHelperService: DialogHelperService,
    private documentHelper: DocumentHelperService,
    private cdr: ChangeDetectorRef,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit(): void {
    this.analyticsService.track(AnalyticsEvent.DASHBOARD_PAGE_LOADED);
    this.setUpSubscriptions();
    this.fetchResumes();
    this.initiateJobStats();
  }

  fetchResumes(): void {
    this.documentHelper.fetchResumes();
  }

  setUpSubscriptions() {
    this.setupScreenManagerSubscription();
    this.setupApplicationSubscription();
    this.setupSearchSubscription();
    this.setupResumeSubscription();
  }

  private setupResumeSubscription(): void {
    this.documentHelper.resumes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(resumes => this.resumes = resumes);
  }


  private setupScreenManagerSubscription(): void {
    this.screenManager.isMobile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isMobile => this.isMobile = isMobile);
  }

  private setupApplicationSubscription(): void {
    this.state.getApplications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => this.updateComponentState(state.items, buildPagination(state)));
  }

  private setupSearchSubscription(): void {
    this.searchStateService.filter$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filter => {
        const pagination = resetPagination();
        this.currentFilter = filter;
        this.currentPage = pagination.currentPage;
        this.itemsPerPage = pagination.itemsPerPage;
        this.loadUserAppliedJobs();
      });
  }

  handleLoadMore(): void {
    this.itemsPerPage += ITEMS_INCREMENT;
    this.loadUserAppliedJobs();
  }

  handleChangeInItemPerPage(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = PAGINATION_DEFAULTS.currentPage;
    this.loadUserAppliedJobs();
  }

  handlePageChanged(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.loadUserAppliedJobs();
    }
  }

  reloadDashboardData(): void {
    this.loadUserAppliedJobs();
    this.initiateJobStats();
  }

  loadUserAppliedJobs(): void {
    this.setIsLoading(true);

    this.jobApplicationService.getApplications({
      ...this.currentFilter,
      page: this.currentPage,
      pageSize: this.itemsPerPage
    }).pipe(
      finalize(() => this.setIsLoading(false))
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.updateComponentState(response.data.items, {
            totalCount: response.data.totalCount,
            totalPages: response.data.totalPages,
            currentPage: response.data.pageNumber,
            pageSize: response.data.pageSize
          });
        }
      },
      error: (error) => {
        this.analyticsService.track(AnalyticsEvent.DASHBOARD_LOAD_FAILED, {
          error_message: error.message || 'Unknown error',
          page: this.currentPage,
          pageSize: this.itemsPerPage
        });
      }
    });
  }

  private initiateJobStats(): void {
    this.jobApplicationService.getStats()
      .subscribe(response => {
        if (response.success && response.data) {
          this.statHighLights = mapJobStats(response.data);
          this.cdr.markForCheck();
        }
      });
  }

  private updateComponentState(
    applications: JobApplicationItem[],
    pagination: { totalCount: number; totalPages: number; currentPage: number; pageSize: number }
  ): void {
    this.showEmptyState = updateFilterState(applications, this.currentFilter);
    this.data = applications.map(mapApplicationToTableData);
    updatePagination(pagination, this);
  }

  private setIsLoading(isLoading: boolean): void {
    this.isLoading = isLoading;
    this.cdr.markForCheck();
  }

  addNewApplicationEntry(): void {
    this.dialogHelperService.openAddApplicationDialog(() => this.reloadDashboardData());

  }

  updateJobApplication(jobData: JobApplicationItem): void {
    this.dialogHelperService.openEditApplicationDialog(jobData, () => this.reloadDashboardData());
  }

  handleStatusUpdate(updateData: { item: JobApplicationItem }): void {
    this.dialogHelperService.updateApplication(updateData.item, () => this.reloadDashboardData());
  }

  handleDeleteApplications(applicationIds: string[]): void {
    const deletePayload: DeleteApplicationsPayload = { ids: applicationIds };
    this.jobApplicationService.deleteApplication(deletePayload)
      .subscribe(() => this.reloadDashboardData());
  }

  handleSelectionChanged(event: any): void {
    this.selectedItems = event;
  }

  handleFilterChange(filter: JobApplicationFilter): void {
    this.searchStateService.updateFilter(normalizeFilter(this.currentFilter, filter));
  }

  handleSearchChange(searchTerm: string): void {
    this.searchStateService.updateSearchTerm(searchTerm);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}