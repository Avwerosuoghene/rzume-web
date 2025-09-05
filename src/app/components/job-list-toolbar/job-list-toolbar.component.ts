import { Component, EventEmitter, Output } from '@angular/core';
import { AngularMaterialModules } from '../../core/modules';
import { CustomSearchInputComponent } from '../custom-search-input';
import { FilterDropdownComponent } from '../filter-dropdown';
import {  ApplicationStatus, FilterOption } from '../../core/models';
import { JOB_FILTER_OPTIONS } from '../../core/models/constants/dashboard.constants';
import { DialogService } from '../../core/services/dialog.service';
import { LoaderService } from '../../core/services';
import { JobApplicationService } from '../../core/services/job-application.service';
import { JobApplicationFilter } from '../../core/models/interface/job-application.models';
import { JobApplicationDialogService } from '../../core/services/job-application-dialog.service';

@Component({
  selector: 'app-job-list-toolbar',
  standalone: true,
  imports: [AngularMaterialModules, CustomSearchInputComponent, FilterDropdownComponent],
  templateUrl: './job-list-toolbar.component.html',
  styleUrl: './job-list-toolbar.component.scss'
})
export class JobListToolbarComponent {
  filterOptions: Array<FilterOption> = JOB_FILTER_OPTIONS;

  @Output() filterChange = new EventEmitter<JobApplicationFilter>();
  @Output() searchChange = new EventEmitter<string>();
  // @Output() jobApplicationUpdated = new EventEmitter<void>();
  @Output() jobApplicationAddition = new EventEmitter<void>();

  constructor(private dialogService: DialogService, private loaderService: LoaderService, private jobApplicationService: JobApplicationService, private jobDialogService: JobApplicationDialogService) { }

  handleFilterChange(filterValue: string): void {
    const filter: JobApplicationFilter = {};

    if (filterValue && filterValue !== '') {
      filter.status = filterValue as ApplicationStatus;
    }

    this.filterChange.emit(filter);
  }

  onSearch(searchTerm: string) {
    this.searchChange.emit(searchTerm);
  }

  onInitiateAddJobApplication() {
    this.jobApplicationAddition.emit();
  }

}
