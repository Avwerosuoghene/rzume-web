import { Component, OnDestroy, OnInit } from '@angular/core';
import { CustomTableComponent } from '../../../components/custom-table/custom-table.component';
import { AngularMaterialModules, CoreModules } from '../../../core/modules';
import {  MockDataService } from '../../../core/services';
import { ColumnDefinition, StatHighlight } from '../../../core/models/interface/dashboard.models';
import { JOB_TABLE_COLUMNS, PAGINATION_DEFAULTS } from '../../../core/models/constants/dashboard.constants';
import { Subject } from 'rxjs';
import { JobListToolbarComponent } from '../../../components/job-list-toolbar/job-list-toolbar.component';
import { JobStatsComponent } from '../../../components/job-stats/job-stats.component';

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

  constructor(private mockDataService: MockDataService) { }

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
    this.mockDataService.getOrders(page, this.itemsPerPage).subscribe(response => {
      this.data = response.data.data;
      this.totalItems = response.data.total;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
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
