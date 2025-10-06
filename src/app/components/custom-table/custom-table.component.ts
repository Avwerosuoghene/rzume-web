import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularMaterialModules } from '../../core/modules';
import { ApplicationStatus, CONFIRM_DELETE_MSG, DELETE_APP_TITLE, DialogCloseResponse, IconStat, InfoDialogData, JobStatChangeDialogData } from '../../core/models';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableBodyComponent } from './table-body/table-body.component';
import { TablePagintionComponent } from "./table-pagintion/table-pagintion.component";
import { ColumnDefinition } from '../../core/models/interface/dashboard.models';
import { JobApplicationItem } from '../../core/models/interface/job-application.models';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { DialogHelperService } from '../../core/services/dialog-helper.service';

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [FormsModule, CommonModule, AngularMaterialModules, TableHeaderComponent, TableBodyComponent, TablePagintionComponent],
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  constructor(
    private dialogHelper: DialogHelperService,
    private cdr: ChangeDetectorRef
  ) {}

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemPerPageChanged.emit(itemsPerPage);
  }

  changeJobStatus(data: { item: JobApplicationItem }) {
    this.dialogHelper.openJobStatusDialog(data.item, (updatedJobItem) => {
      this.jobStatusUpdate.emit({ item: updatedJobItem });
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

  handleDelete(ids: string[]) {
    this.dialogHelper.openDeleteConfirmation(this.selectedItems, () => {
      this.jobApplicationsDelete.emit(ids);
    }, DELETE_APP_TITLE );
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
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();
  }

  isAllSelected() {
    this.allItemsSelected = this.data.every(item => item.selected);
  }


}
