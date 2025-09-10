import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobCardTabsComponent } from './partials/job-card-tabs/job-card-tabs.component';
import { JobCardItemComponent } from './partials/job-card-item/job-card-item.component';
import { JobApplicationItem } from '../../core/models/interface/job-application.models';
import { JOB_FILTER_OPTIONS } from '../../core/models/constants/dashboard.constants';
import { AngularMaterialModules } from '../../core/modules';

@Component({
  selector: 'app-job-card-list',
  standalone: true,
  imports: [CommonModule, JobCardTabsComponent, JobCardItemComponent, AngularMaterialModules],
  templateUrl: './job-card-list.component.html',
  styleUrls: ['./job-card-list.component.scss']
})
export class JobCardListComponent implements OnChanges {
  @Output() jobApplicationUpdate = new EventEmitter<JobApplicationItem>();
  @Output() jobStatusUpdate = new EventEmitter<{ item: JobApplicationItem }>();
  @Output() jobApplicationsDelete = new EventEmitter<string[]>();
  @Output() jobApplicationAddition = new EventEmitter<void>();
  @Input() jobs: JobApplicationItem[] = [];
  
  tabs = JOB_FILTER_OPTIONS.filter(option => option.value !== '' );
  activeTab: string = this.tabs[0].value;
  filteredJobs: JobApplicationItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jobs']) {
      this.filterJobs();
    }
  }

  handleTabChange(tab: string) {
    this.activeTab = tab;
    this.filterJobs();
  }

  private filterJobs() {
    this.filteredJobs = this.jobs.filter(job => job.status === this.activeTab);
  }
}
