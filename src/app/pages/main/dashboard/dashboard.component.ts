import { Component, OnDestroy, OnInit } from '@angular/core';
import { CustomTableComponent } from '../../../components/custom-table/custom-table.component';
import { AngularMaterialModules, CoreModules } from '../../../core/modules';
import { ColumnDefinition } from '../../../core/models/interface/dashboard.models';
import { EMPTY_STATES, JOB_TABLE_COLUMNS, PAGINATION_DEFAULTS } from '../../../core/models/constants/dashboard.constants';
import { Subject } from 'rxjs';
import { JobListToolbarComponent } from '../../../components/job-list-toolbar/job-list-toolbar.component';
import { JobStatsComponent } from '../../../components/job-stats/job-stats.component';
import { JobApplicationService } from '../../../core/services/job-application.service';
import { JobApplicationStateService } from '../../../core/services/job-application-state.service';
import { JobApplicationItem, JobApplicationFilter, DeleteApplicationsPayload, JobApplicationStatItemDto } from '../../../core/models/interface/job-application.models';
import { DialogCloseStatus } from '../../../core/models/enums/dialog.enums';
import { AddJobDialogData, DialogCloseResponse } from '../../../core/models';
import { JobApplicationDialogService } from '../../../core/services/job-application-dialog.service';
import { SearchStateService } from '../../../core/services/search-state.service';
import { JobCardListComponent } from "../../../components/job-card-list/job-card-list.component";
import { EmptyStateWrapperComponent } from "../../../components/empty-state-wrapper/empty-state-wrapper.component";

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
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  EMPTY_STATES = EMPTY_STATES;

  statHighLights: JobApplicationStatItemDto[] = [];

  data: JobApplicationItem[] = [];
  jobListColumns: Array<ColumnDefinition> = JOB_TABLE_COLUMNS;
  totalPages: number = PAGINATION_DEFAULTS.totalPages;
  currentPage: number = PAGINATION_DEFAULTS.currentPage;
  itemsPerPage: number = PAGINATION_DEFAULTS.itemsPerPage;
  totalItems: number = PAGINATION_DEFAULTS.totalItems;
  selectedItems: Array<JobApplicationItem> = [];
  showEmptyState: boolean = true;
  destroy$ = new Subject<void>();
  currentFilter: JobApplicationFilter = {};
  

  constructor(
    private state: JobApplicationStateService,
    private jobApplicationService: JobApplicationService,
    private jobDialogService: JobApplicationDialogService,
    private searchStateService: SearchStateService
  ) { }

  ngOnInit(): void {
    this.initiateJobStats();
    this.setupApplicationSubscription();
    this.setupSearchSubscription();
  }

  setupApplicationSubscription() {
    this.state.getApplications().subscribe(state => {
      this.updateComponentState(state.items, {
        totalCount: state.totalCount,
        totalPages: state.totalPages,
        currentPage: state.pageNumber,
        pageSize: state.pageSize
      });
    });
  }

  private setupSearchSubscription() {
    this.searchStateService.filter$.subscribe(filter => {
      this.currentFilter = filter;
      this.currentPage = PAGINATION_DEFAULTS.currentPage;
      this.loadUserAppliedJobs();
    });
  }

  handleChangeInItemPerPage(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = PAGINATION_DEFAULTS.currentPage;;
    this.loadUserAppliedJobs();
  }

  handlePageChanged(page: number): void {

    if (page !== this.currentPage) {
      this.currentPage = page;
      this.loadUserAppliedJobs();
    }
  }

  reloadDashboardData() {
    this.initiateJobStats();
    this.loadUserAppliedJobs();
  }

  loadUserAppliedJobs(): void {
    this.jobApplicationService.getApplications({
      ...this.currentFilter,
      page: this.currentPage,
      pageSize: this.itemsPerPage
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.updateComponentState(response.data.items, {
            totalCount: response.data.totalCount,
            totalPages: response.data.totalPages,
            currentPage: response.data.pageNumber,
            pageSize: response.data.pageSize
          });
        }
      }
    });
  }

  private mapApplicationToTableData(application: JobApplicationItem): JobApplicationItem {
    return {
      id: application.id,
      position: application.position,
      companyName: application.companyName,
      userId: application.userId,
      applicationDate: application.applicationDate
        ? new Date(application.applicationDate)
        : undefined,
      jobLink: application.jobLink,
      resumeLink: application.resumeLink,
      status: application.status,
      notes: application.notes
    };
  }

  updateComponentState(
    applications: JobApplicationItem[],
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    }
  ) {
    this.updateFilterState(applications);
    this.data = applications.map(this.mapApplicationToTableData);
    this.updatePagination(pagination);
  }
  
  updateFilterState(applications: JobApplicationItem[]) {
    const hasNoApplications = applications.length === 0;
    const hasNoFilters = !this.currentFilter?.searchQuery && !Object.values(this.currentFilter || {}).some(val => val);
    this.showEmptyState = hasNoApplications && hasNoFilters;
  }
  
  updatePagination(pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }) {
    this.totalItems = pagination.totalCount;
    this.totalPages = pagination.totalPages;
    this.currentPage = pagination.currentPage;
    this.itemsPerPage = pagination.pageSize;
  }

  initiateJobStats(): void {
    this.jobApplicationService.getStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const stats = response.data;
          this.statHighLights = [
            stats.totalApplications,
            stats.rejected,
            stats.inProgress,
            stats.offerReceived
          ].filter(Boolean);
        }
      }
    });
  }



  handleSelectionChanged(event: any) {
    this.selectedItems = event;
  }

  handleFilterChange(filter: JobApplicationFilter): void {
    const currentFilter = this.searchStateService.getCurrentFilter();
    let updatedFilter: JobApplicationFilter;
    
    if (!filter.status || (filter.status as string) === '') {
      updatedFilter = {
        ...currentFilter,
        status: undefined
      };
    } else {
      updatedFilter = { ...currentFilter, ...filter };
    }

    this.searchStateService.updateFilter(updatedFilter);
  }

  handleSearchChange(searchTerm: string): void {
    this.searchStateService.updateSearchTerm(searchTerm);
  }

  addNewApplicationEntry() {
    const dialogData: AddJobDialogData = { isEditing: false };
    this.jobDialogService.openAddJobDialog(dialogData)
      .afterClosed()
      .subscribe(response => {
        this.jobDialogService.handleDialogClose(response, payload => {
          this.jobDialogService.createApplication(payload, () => this.reloadDashboardData());
        });
      });
  }

  updateJobApplication(jobData: JobApplicationItem) {
    const dialogData: AddJobDialogData = { isEditing: true, jobApplicationData: jobData };
    this.jobDialogService.openAddJobDialog(dialogData)
      .afterClosed()
      .subscribe(response => this.handleUpdateDialogResponse(response, jobData.id));
  }

  handleUpdateDialogResponse(
    response: DialogCloseResponse<JobApplicationItem> | undefined,
    jobId: string
  ) {
    if (!response) return;
    if (response.status === DialogCloseStatus.Submitted && response.data) {
      this.jobDialogService.updateApplication(response.data, () => this.reloadDashboardData());
    }
  }

  handleStatusUpdate(updateData: { item: JobApplicationItem }) {
    this.jobDialogService.updateApplication(updateData.item, () => this.reloadDashboardData());
  }

  handleDeleteApplications(applicationIds: string[]): void {
    const deletePayload: DeleteApplicationsPayload = { ids: applicationIds };

    this.jobApplicationService.deleteApplication(deletePayload).subscribe({
      next: () => {
        this.reloadDashboardData();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
