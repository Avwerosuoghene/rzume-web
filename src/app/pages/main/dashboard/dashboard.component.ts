import { Component, OnDestroy, OnInit } from '@angular/core';
import { CustomTableComponent } from '../../../components/custom-table/custom-table.component';
import { AngularMaterialModules, CoreModules } from '../../../core/modules';
import { ColumnDefinition, StatHighlight } from '../../../core/models/interface/dashboard.models';
import { JOB_TABLE_COLUMNS, PAGINATION_DEFAULTS } from '../../../core/models/constants/dashboard.constants';
import { Subject } from 'rxjs';
import { JobListToolbarComponent } from '../../../components/job-list-toolbar/job-list-toolbar.component';
import { JobStatsComponent } from '../../../components/job-stats/job-stats.component';
import { JobApplicationService } from '../../../core/services/job-application.service';
import { JobApplicationStateService } from '../../../core/services/job-application-state.service';
import { JobApplicationItem, JobApplicationFilter } from '../../../core/models/interface/job-application.models';
import { DialogCloseStatus } from '../../../core/models/enums/dialog.enums';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, JobListToolbarComponent, CustomTableComponent, JobStatsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  statHighLights: Array<StatHighlight> = [];

  data: any[] = [];
  jobListColumns: Array<ColumnDefinition> = JOB_TABLE_COLUMNS;
  totalPages: number = PAGINATION_DEFAULTS.totalPages;
  currentPage: number = PAGINATION_DEFAULTS.currentPage;
  itemsPerPage: number = PAGINATION_DEFAULTS.itemsPerPage;
  totalItems: number = PAGINATION_DEFAULTS.totalItems;
  selectedItems: Array<any> = [];
  destroy$ = new Subject<void>();
  currentFilter: JobApplicationFilter = {};

  constructor(
    private state: JobApplicationStateService,
    private jobApplicationService: JobApplicationService
  ) { }

  ngOnInit(): void {
    this.initiateJobStats();
    this.setupApplicationSubscription();
    this.loadUserAppliedJobs();
  }

  private setupApplicationSubscription() {
    this.state.getApplications().subscribe(state => {
      this.updateComponentState(state.items, {
        totalCount: state.totalCount,
        totalPages: state.totalPages,
        currentPage: state.pageNumber,
        pageSize: state.pageSize
      });
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
      applicationDate: new Date(application.applicationDate).toLocaleDateString(),
      jobLink: application.jobLink,
      resumeLink: application.resumeLink,
      status: application.status
    };
  }

  private updateComponentState(applications: JobApplicationItem[], pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }) {
    this.data = applications.map(app => this.mapApplicationToTableData(app));
    this.totalItems = pagination.totalCount;
    this.totalPages = pagination.totalPages;
    this.currentPage = pagination.currentPage;
    this.itemsPerPage = pagination.pageSize;
  }

  initiateJobStats() {
    this.statHighLights.push(
      {
        description: 'Total Job Application',
        value: 20
      },
      {
        description: 'Total Interviews',
        value: 2
      },
      {
        description: 'Total Rejections',
        value: 305
      },
      {
        description: 'Total Offers',
        value: 3
      }
    )
  }



  handleSelectionChanged(event: any) {
    this.selectedItems = event;
  }

  handleFilterChange(filter: JobApplicationFilter): void {
    if (!filter.status || (filter.status as string) === '') {
      this.currentFilter = {
        ...this.currentFilter,
        status: undefined
      };
    } else {
      this.currentFilter = { ...this.currentFilter, ...filter };
    }

    this.currentPage = PAGINATION_DEFAULTS.currentPage;
    this.loadUserAppliedJobs();
  }

  handleSearchChange(searchTerm: string): void {
    this.currentFilter = {
      ...this.currentFilter,
      searchQuery: searchTerm || undefined
    };
    this.currentPage = PAGINATION_DEFAULTS.currentPage;
    this.loadUserAppliedJobs();
  }

  handleJobApplicationUpdate(updateData: any): void {
    if (!updateData || updateData.status === DialogCloseStatus.Cancelled) return;

    this.processJobApplicationUpdate(updateData);
  }

  private processJobApplicationUpdate(updateData: any): void {
    this.jobApplicationService.updateJobApplication(updateData.id, updateData)
      .subscribe({
        next: () => {
          this.loadUserAppliedJobs();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
