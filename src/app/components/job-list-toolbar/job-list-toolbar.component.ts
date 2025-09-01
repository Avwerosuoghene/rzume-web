import { Component, EventEmitter, Output } from '@angular/core';
import { AngularMaterialModules } from '../../core/modules';
import { CustomSearchInputComponent } from '../custom-search-input';
import { FilterDropdownComponent } from '../filter-dropdown';
import { AddJobDialogData, ApplicationStatus, DialogCloseResponse, FilterOption } from '../../core/models';
import { JOB_FILTER_OPTIONS } from '../../core/models/constants/dashboard.constants';
import { JobAddDialogComponent } from '../job-add-dialog';
import { DialogService } from '../../core/services/dialog.service';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { LoaderService } from '../../core/services';
import { JobApplicationService } from '../../core/services/job-application.service';
import { finalize } from 'rxjs';
import { CreateApplicationPayload, JobApplicationFilter, JobApplicationItem } from '../../core/models/interface/job-application.models';

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
  @Output() jobApplicationUpdated = new EventEmitter<void>();

  constructor(private dialogService: DialogService, private loaderService: LoaderService, private jobApplicationService: JobApplicationService) { }

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


  addNewApplicationEntry() {
    const dialogData: AddJobDialogData = {
      isEditing: false
    }
    const jobAdditionDialog = this.dialogService.openDialog<JobAddDialogComponent, AddJobDialogData>(
      JobAddDialogComponent,
      dialogData,
      { disableClose: true }
    );
    jobAdditionDialog.afterClosed().subscribe(response => this.handleOnCloseJobDialog(response))
  }



  handleOnCloseJobDialog(response?: DialogCloseResponse<JobApplicationItem>): void {
    if (!response) return
  
    if (response.status === DialogCloseStatus.Submitted) {
      this.createApplication(response.data);
    }
  }

  updateJobApplication(jobData: any) {
    const dialogData: AddJobDialogData = {
      isEditing: true,
      jobApplicationData: jobData
    }
    console.log(jobData)
    const jobUpdateDialog = this.dialogService.openDialog<JobAddDialogComponent, AddJobDialogData>(
      JobAddDialogComponent,
      dialogData,
      { disableClose: true }
    );
    jobUpdateDialog.afterClosed().subscribe(response => this.handleOnCloseUpdateJobDialog(response, jobData.id))
  }

  private handleOnCloseUpdateJobDialog(response?: DialogCloseResponse<JobApplicationItem>, jobId?: string): void {
    if (!response || !jobId) return
    if (response.status === DialogCloseStatus.Submitted) {
      this.processUpdateApplication(response.data, jobId);
    }
  }

  private processUpdateApplication(data: JobApplicationItem, jobId: string): void {
    this.loaderService.showLoader();
    const payload = this.buildUpdatePayload(data);
    
    this.jobApplicationService.updateStatus(payload, jobId)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: () => {
          this.jobApplicationUpdated.emit();
        }
      });
  }

  private buildUpdatePayload(data: JobApplicationItem) {
    return {
      position: data.position,
      companyName: data.companyName,
      jobLink: data.jobLink,
      resumeLink: data.resumeLink,
      status: data.status as ApplicationStatus
    };
  }

  createApplication(data: JobApplicationItem) {
    this.loaderService.showLoader();
    const payload: CreateApplicationPayload = {
      position: data.position,
      companyName: data.companyName,
      jobLink: data.jobLink,
      resumeLink: data.resumeLink,
      applicationDate: data.applicationDate,  
      status: data.status as ApplicationStatus
    };


    this.jobApplicationService.addApplication(payload)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: () => {
          console.log('success')
        }
      });

  }
}
