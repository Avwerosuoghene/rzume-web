import { Component, OnDestroy, OnInit } from '@angular/core';
import { CustomTableComponent } from '../../../components/custom-table/custom-table.component';
import { AngularMaterialModules, CoreModules } from '../../../core/modules';
import {  MockDataService } from '../../../core/services';
import { ColumnDefinition, StatHighlight } from '../../../core/models/interface/dashboard.models';
import { JOB_TABLE_COLUMNS, PAGINATION_DEFAULTS } from '../../../core/models/constants/dashboard.constants';
import { Subject } from 'rxjs';
import { JobListToolbarComponent } from '../../../components/job-list-toolbar/job-list-toolbar.component';
import { JobStatsComponent } from '../../../components/job-stats/job-stats.component';
import { JobApplicationService } from '../../../core/services/job-application.service';

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

  constructor(
    private mockDataService: MockDataService,
    private jobApplicationService: JobApplicationService
  ) { }

  ngOnInit(): void {
    this.initiateJobStats();
    this.loadUserAppliedJobs(this.currentPage);
  }


  handleChangeInItemPerPage(event: number): void {
    this.itemsPerPage = event;
  }

  handlePageChanged(page: number) {
    this.currentPage = page;
  }

  loadUserAppliedJobs(page: number): void {
    this.jobApplicationService.getApplications({
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.data = response.data.items.map(item => ({
            id: item.id,
            company: item.companyName,
            job_role: item.position,
            status: item.status,
            date: new Date(item.applicationDate).toLocaleDateString(),
            location: item.location,
            notes: item.notes
          }));
          this.totalItems = response.data.totalCount;
          this.totalPages = response.data.totalPages;
          this.currentPage = response.data.pageNumber;
          this.itemsPerPage = response.data.pageSize;
        }
      },
      error: (error) => {
        console.error('Error fetching job applications:', error);
      }
    });
    
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
