import { Component } from '@angular/core';
import { AngularMaterialModules } from '../../core/modules';
import { CustomSearchInputComponent } from '../custom-search-input';
import { FilterDropdownComponent } from '../filter-dropdown';
import { AddJobDialogData, ApplicationStatus, DialogCloseResponse, FilterOption } from '../../core/models';
import { JOB_FILTER_OPTIONS } from '../../core/models/constants/dashboard.constants';
import { JobAddDialogComponent } from '../job-add-dialog';
import { DialogService } from '../../core/services/dialog.service';
import { JobApplicationDialogData } from '../../core/models/constants/job-application-dialog-data';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { LoaderService } from '../../core/services';
import { JobApplicationService } from '../../core/services/job-application.service';
import { finalize } from 'rxjs';
import { CreateApplicationPayload } from '../../core/models/interface/job-application.models';

@Component({
  selector: 'app-job-list-toolbar',
  standalone: true,
  imports: [AngularMaterialModules, CustomSearchInputComponent, FilterDropdownComponent],
  templateUrl: './job-list-toolbar.component.html',
  styleUrl: './job-list-toolbar.component.scss'
})
export class JobListToolbarComponent {
  filterOptions: Array<FilterOption> = JOB_FILTER_OPTIONS;

  constructor(private dialogService: DialogService, private loaderService: LoaderService, private jobApplicationService: JobApplicationService) { }


  handleFilterChange(filterValue: string): void {
    console.log('Filter value:', filterValue);
  }

  onSearch(event: any) {
    console.log(event);
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



  handleOnCloseJobDialog(response?: DialogCloseResponse<JobApplicationDialogData>): void {
    if (!response) return
    if (response.status === DialogCloseStatus.Submitted) {
      this.createApplication(response.data);
    }
  }

  createApplication(data: JobApplicationDialogData) {
    this.loaderService.showLoader();
    const payload: CreateApplicationPayload = {
      position: data.role,
      companyName: data.company,
      jobLink: data.job_link,
      resumeLink: data.cv_link,
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
