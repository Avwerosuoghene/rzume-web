import { Component } from '@angular/core';
import { AngularMaterialModules } from '../../core/modules';
import { CustomSearchInputComponent } from '../custom-search-input';
import { FilterDropdownComponent } from '../filter-dropdown';
import { AddJobDialogData, DialogCloseResponse, FilterOption, InfoDialogData } from '../../core/models';
import { JOB_FILTER_OPTIONS } from '../../core/models/constants/dashboard.constants';
import { JobAddDialogComponent } from '../job-add-dialog';
import { DialogService } from '../../core/services/dialog.service';
import { InfoDialogComponent } from '../info-dialog';

@Component({
  selector: 'app-job-list-toolbar',
  standalone: true,
  imports: [AngularMaterialModules, CustomSearchInputComponent, FilterDropdownComponent],
  templateUrl: './job-list-toolbar.component.html',
  styleUrl: './job-list-toolbar.component.scss'
})
export class JobListToolbarComponent {
  filterOptions: Array<FilterOption> = JOB_FILTER_OPTIONS;

  constructor(private dialogService: DialogService) { }


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



  handleOnCloseJobDialog(response?: DialogCloseResponse): void {
    if (!response) return

    const dialogData: InfoDialogData = {
      infoMessage: response?.message,
      statusIcon: response?.applicationStat
    }
    this.dialogService.openDialog<InfoDialogComponent, InfoDialogData>(InfoDialogComponent, dialogData);

  }
}
