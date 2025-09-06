import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';
import { JobStatusChangeComponent } from '../job-status-change/job-status-change.component';
import { AngularMaterialModules } from '../../core/modules';
import { ApplicationStatus, CONFIRM_DELETE_MSG, DialogCloseResponse, IconStat, InfoDialogData, JobStatChangeDialogData } from '../../core/models';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableBodyComponent } from './table-body/table-body.component';
import { TablePagintionComponent } from "./table-pagintion/table-pagintion.component";
import { ColumnDefinition } from '../../core/models/interface/dashboard.models';
import { JobApplicationItem } from '../../core/models/interface/job-application.models';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [FormsModule, CommonModule, AngularMaterialModules, TableHeaderComponent, TableBodyComponent, TablePagintionComponent],
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.scss']
})
export class CustomTableComponent {
  @Input() data: JobApplicationItem[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 5;
  @Output() itemPerPageChanged: EventEmitter<number> = new EventEmitter<number>();
  @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();
  @Output() onSelectionChanged: EventEmitter<Array<JobApplicationItem>> = new EventEmitter<Array<JobApplicationItem>>();
  @Output() jobApplicationUpdate: EventEmitter<JobApplicationItem> = new EventEmitter<JobApplicationItem>();
  @Output() jobStatusUpdate: EventEmitter<{ item: JobApplicationItem }> = new EventEmitter<{ item: JobApplicationItem }>();
  @Output() jobApplicationsDelete: EventEmitter<string[]> = new EventEmitter<string[]>();

  selectedItems: Array<JobApplicationItem> = [];
  totalItems: number = 20;
  allItemsSelected: boolean = false;

  constructor(private dialog: MatDialog) {

  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemPerPageChanged.emit(itemsPerPage);
  }

  changeJobStatus(data: { item: JobApplicationItem }) {
    const dialogRef = this.openJobStatusDialog(data.item);

    dialogRef.afterClosed().subscribe(response => {
      this.handleDialogResponse(response, data.item);
    });
  }

  openJobStatusDialog(item: JobApplicationItem) {
    const dialogData: JobStatChangeDialogData = { jobItem: item };
    return this.dialog.open(JobStatusChangeComponent, {
      data: dialogData,
      backdropClass: 'blurred',
      disableClose: true,
    });
  }

  handleDialogResponse(
    response: DialogCloseResponse<{ status: ApplicationStatus }> | undefined,
    item: JobApplicationItem
  ) {
    if (!response || response.status !== DialogCloseStatus.Submitted) return;

    const updatedJobItem = this.buildUpdatedJobItem(item, response.data.status);
    this.emitJobStatusUpdate(updatedJobItem);
  }

  buildUpdatedJobItem(item: JobApplicationItem, status: ApplicationStatus): JobApplicationItem {
    return { id: item.id, status };
  }

  emitJobStatusUpdate(item: JobApplicationItem) {
    this.jobStatusUpdate.emit({ item });
  }

  deleteApplications() {
    const message = this.buildDeleteMessage();
    const ids = this.selectedItems.map(item => item.id);
  
    const dialogRef = this.openConfirmationDialog(message);
  
    dialogRef.afterClosed().subscribe(response => {
      this.handleDeleteDialogClose(response, ids);
    });
  }
  
  openConfirmationDialog(message: string) {
    const dialogData: InfoDialogData = {
      infoMessage: message,
      statusIcon: IconStat.success,
    };
  
    return this.dialog.open(InfoDialogComponent, {
      data: dialogData,
      backdropClass: 'blurred',
      disableClose: true,
    });
  }
  
  handleDeleteDialogClose(
    response: DialogCloseResponse<any> | undefined,
    ids: string[]
  ): void {
    if (response?.status !== DialogCloseStatus.Submitted) return;

    this.jobApplicationsDelete.emit(ids);
  }

  buildDeleteMessage(): string {
   
    return this.selectedItems.length > 1
      ? `Kindly confirm you want to delete ${this.selectedItems.length} applications`
      : CONFIRM_DELETE_MSG;
  }

  onCheckboxChange(item: JobApplicationItem, event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.checked) {
      this.addSelectedItem(item);
    } else {
      this.removeSelectedItem(item);
    }
  
    this.isAllSelected();
    this.onSelectionChanged.emit(this.selectedItems);
  }
  
  addSelectedItem(item: JobApplicationItem): void {
    if (!this.selectedItems.some(selected => selected.id === item.id)) {
      this.selectedItems = [...this.selectedItems, item]; 
    }
  }
  
  removeSelectedItem(item: JobApplicationItem): void {
    this.selectedItems = this.selectedItems.filter(selected => selected.id !== item.id);
  }

  editJobApplication(application: JobApplicationItem) {
    this.jobApplicationUpdate.emit(application);
  }

  onPageChange(page: number): void {
    this.pageChanged.emit(page);
  }

  toggleAllSelections(event: any) {
    const checked = event.target.checked;

    if (checked) {
      this.selectedItems = [...this.data];
      this.data.forEach(item => item.selected = true);
    } else {
      this.selectedItems = [];
      this.data.forEach(item => item.selected = false);
    }

    this.onSelectionChanged.emit(this.selectedItems);
  }

  isAllSelected() {
    this.allItemsSelected = this.data.every(item => item.selected);
  }


}
