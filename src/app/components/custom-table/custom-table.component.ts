import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';
import { JobAddDialogComponent } from '../job-add-dialog/job-add-dialog.component';
import { JobStatusChangeComponent } from '../job-status-change/job-status-change.component';
import { AngularMaterialModules } from '../../core/modules';
import { AddJobDialogData, CONFIRM_DELETE_MSG, DialogCloseResponse, IconStat, InfoDialogData, JobStatChangeDialogData } from '../../core/models';
import { JobApplicationDialogData } from '../../core/models/constants/job-application-dialog-data';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableBodyComponent } from './table-body/table-body.component';
import { TablePagintionComponent } from "./table-pagintion/table-pagintion.component";
import { ColumnDefinition } from '../../core/models/interface/dashboard.models';

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [FormsModule, CommonModule, AngularMaterialModules, TableHeaderComponent, TableBodyComponent, TablePagintionComponent],
  templateUrl: './custom-table.component.html',
  styleUrl: './custom-table.component.scss'
})
export class CustomTableComponent {
  @Input() data: any[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 1;
  @Output() itemPerPageChanged: EventEmitter<number> = new EventEmitter<number>();
  @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();
  @Output() onSelectionChanged: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

  selectedItems: Array<any> = [];
  totalItems: number = 20;
  allItemsSelected: boolean = false;

  constructor(private dialog: MatDialog) {

  }

  onItemsPerPageChange(itemsPerPage: any): void {
    this.itemPerPageChanged.emit(itemsPerPage);
  }

  changeJobStatus(status: string) {
    const dialogData: JobStatChangeDialogData = {
      status: status
    }
    this.dialog.open(JobStatusChangeComponent, {
      data: dialogData,
      backdropClass: "blurred",
      disableClose: true
    })
  }

  deleteJob() {
    const dialogData : InfoDialogData = {
      infoMessage: CONFIRM_DELETE_MSG,
      statusIcon: IconStat.success
    }

    const deleteConfirmDialog = this.dialog.open(InfoDialogComponent, {
      data:dialogData,
      backdropClass: "blurred"
    });
  }

  onCheckboxChange(item: any, event: any): void {
    this.selectedItems = [];
    if (event.target.checked) {
      this.selectedItems.push(item);
    } else {
      const itemIndex = this.selectedItems.indexOf(item);
      this.selectedItems.splice(itemIndex, 1);
    }
    this.isAllSelected();
    this.onSelectionChanged.emit(this.selectedItems);
  }

  editJobApplication() {
    const dialogData: AddJobDialogData = {
      isEditing: true
    }
    const jobAdditionDialog = this.dialog.open(JobAddDialogComponent, {
      data: dialogData,
      backdropClass: "blurred",
      disableClose: true
    });
    jobAdditionDialog.afterClosed().subscribe((res?: DialogCloseResponse<JobApplicationDialogData>) => {
      if (!res) return
    })
  }

  onPageChange(page: number): void {
    this.pageChanged.emit(page);
  }

  toggleAllSelections(event: any) {
    const checked = event.target.checked;
    this.selectedItems = [];

    this.data.forEach(item => {
      this.selectedItems.push(item);
      item.selected = checked;
    });
    this.onSelectionChanged.emit(this.selectedItems);
  }

  isAllSelected() {
    this.allItemsSelected = this.data.every(item => item.selected);
  }


}
