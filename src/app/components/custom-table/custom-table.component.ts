import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';
import { JobAddDialogComponent } from '../job-add-dialog/job-add-dialog.component';
import { JobStatusChangeComponent } from '../job-status-change/job-status-change.component';
import { AngularMaterialModules } from '../../core/modules';
import { AddJobDialogData, CONFIRM_DELETE_MSG, DialogCloseResponse, IconStat, InfoDialogData, JobStatChangeDialogData } from '../../core/models';
import { ViewUtilities } from '../../core/helpers';
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
  // @Input() itemsPerPage: number = 10;
  @Output() itemPerPageChanged: EventEmitter<number> = new EventEmitter<number>();
  @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();
  @Output() onSelectionChanged: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

  selectedItems: Array<any> = [];
  totalItems: number = 20;
  allItemsSelected: boolean = false;

  constructor(private dialog: MatDialog) {

  }

  ngOnInit(): void { 
    console.log(this.columns)
  }



  onItemsPerPageChange(itemsPerPage: any): void {
    this.currentPage = 1;
    
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
    this.currentPage = page;
    this.pageChanged.emit(this.currentPage);

  }



  getPageNumbers(): number[] {
    const pages = [];

    if (this.totalPages <= 4) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (this.currentPage === 1 || this.currentPage === 2) {
        pages.push(2, 3);
      } else if (this.currentPage === this.totalPages || this.currentPage === this.totalPages - 1) {
        pages.push(this.totalPages - 2, this.totalPages - 1);
      } else {
        pages.push(this.currentPage, this.currentPage + 1);
        if (this.currentPage - 1 > 1) {
          pages.push(this.currentPage - 1);
        }
      }

      if (!pages.includes(this.totalPages)) {
        pages.push(this.totalPages);
      }
    }

    // Remove duplicates and sort
    return [...new Set(pages)].sort((a, b) => a - b);
  }

  getStatusStyle(statusValue: string): string{

    return ''
  }

  getLongWidthItems(item: string) {
    return ViewUtilities.checkItemForLongElegibility(item);
  }

  getShortWidthItems(item: string) {
    return ViewUtilities.checkItemForShortElegibility(item);

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
