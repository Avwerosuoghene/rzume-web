import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobCardTabsComponent } from '../job-card-tabs/job-card-tabs.component';
import { JobCardItemComponent } from '../job-card-item/job-card-item.component';
import { JobApplicationItem } from '../../core/models/interface/job-application.models';
import { ApplicationStatus } from '../../core/models';

@Component({
  selector: 'app-job-card-list',
  standalone: true,
  imports: [CommonModule, JobCardTabsComponent, JobCardItemComponent],
  templateUrl: './job-card-list.component.html',
  styleUrls: ['./job-card-list.component.scss']
})
export class JobCardListComponent implements OnChanges {
  @Input() jobs: JobApplicationItem[] = [];
  
  tabs = [ApplicationStatus.Applied, ApplicationStatus.InProgress, ApplicationStatus.OfferReceived, ApplicationStatus.Rejected];
  activeTab: string = ApplicationStatus.Applied;
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
