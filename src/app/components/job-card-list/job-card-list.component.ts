import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobCardTabsComponent } from './partials/job-card-tabs/job-card-tabs.component';
import { JobCardItemComponent } from './partials/job-card-item/job-card-item.component';
import { JobApplicationFilter, JobApplicationItem } from '../../core/models/interface/job-application.models';
import { JOB_FILTER_OPTIONS } from '../../core/models/constants/dashboard.constants';
import { AngularMaterialModules } from '../../core/modules';
import { EmptyStateWrapperComponent } from '../empty-state-wrapper/empty-state-wrapper.component';
import { ApplicationStatus } from '../../core/models';

@Component({
  selector: 'app-job-card-list',
  standalone: true,
  imports: [CommonModule, JobCardTabsComponent, JobCardItemComponent, AngularMaterialModules, EmptyStateWrapperComponent],
  templateUrl: './job-card-list.component.html',
  styleUrls: ['./job-card-list.component.scss']
})
export class JobCardListComponent{
  @Output() jobApplicationUpdate = new EventEmitter<JobApplicationItem>();
  @Output() jobStatusUpdate = new EventEmitter<{ item: JobApplicationItem }>();
  @Output() jobApplicationsDelete = new EventEmitter<string[]>();
  @Output() jobApplicationAddition = new EventEmitter<void>();
  @Input() jobs: JobApplicationItem[] = [];
  currentFilter: JobApplicationFilter = {};

  @Output() filterChange = new EventEmitter<JobApplicationFilter>();

  tabs = JOB_FILTER_OPTIONS.filter(option => option.value !== '');
  activeTab: string = this.tabs[0].value;


  handleTabChange(tab: string) {
    this.activeTab = tab;
    this.currentFilter.status = this.activeTab as ApplicationStatus;
    this.filterChange.emit(this.currentFilter);
  }

  handleAddJobApplication() {
    this.jobApplicationAddition.emit();
  }


}
