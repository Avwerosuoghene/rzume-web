import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AngularMaterialModules } from '../../core/modules';
import { CustomSearchInputComponent } from '../custom-search-input';
import { FilterDropdownComponent } from '../filter-dropdown';
import {  ApplicationStatus, BorderRadius, FilterOption } from '../../core/models';
import { JOB_FILTER_OPTIONS } from '../../core/models/constants/dashboard.constants';
import { JobApplicationFilter } from '../../core/models/interface/job-application.models';

@Component({
  selector: 'app-job-list-toolbar',
  standalone: true,
  imports: [AngularMaterialModules, CustomSearchInputComponent, FilterDropdownComponent],
  templateUrl: './job-list-toolbar.component.html',
  styleUrl: './job-list-toolbar.component.scss'
})
export class JobListToolbarComponent implements OnInit {
  borderRadius = BorderRadius.small;
  filterOptions: Array<FilterOption> = JOB_FILTER_OPTIONS;

  @Output() filterChange = new EventEmitter<JobApplicationFilter>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() jobApplicationAddition = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
    this.handleFilterChange('');
  }

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
