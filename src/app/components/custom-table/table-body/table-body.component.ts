import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApplicationUtil, ViewUtilities } from '../../../core/helpers';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColumnDefinition, ActionMenuItem, ACTION_TYPES } from '../../../core/models';
import { JobApplicationItem } from '../../../core/models/interface/job-application.models';
import { TruncatePipe } from '../../../core/pipes/truncate.pipe';
import { ActionMenuComponent } from '../../action-menu/action-menu.component';

@Component({
  selector: 'app-table-body',
  standalone: true,
  imports: [CommonModule, FormsModule, TruncatePipe, ActionMenuComponent],
  templateUrl: './table-body.component.html',
  styleUrl: './table-body.component.scss'
})
export class TableBodyComponent  {

  @Input() data: JobApplicationItem[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() selectedItems: JobApplicationItem[] = [];
  @Output() checkBoxChanged = new EventEmitter<{ item: JobApplicationItem; event: Event }>();
  @Output() edit = new EventEmitter<JobApplicationItem>();
  @Output() delete = new EventEmitter<string[]>();
  @Output() statusChange = new EventEmitter<{item: JobApplicationItem}>();
  @Output() rowClick = new EventEmitter<JobApplicationItem>();

  triggerCheckboxChange(item: JobApplicationItem, event: Event): void {
    this.checkBoxChanged.emit({item, event});
  }

  triggerApplicationEdit(application: JobApplicationItem): void {
    this.edit.emit(application);
  }

  triggerDelete(item: JobApplicationItem): void {
    if (this.selectedItems.length > 0) {
      this.delete.emit(this.selectedItems.map(i => i.id));
    } else {
      this.delete.emit([item.id]);
    }
  }

  triggerStatusChange(item: JobApplicationItem): void {
    this.statusChange.emit({ item });
  }

  getRowActions(item: JobApplicationItem): ActionMenuItem[] {
    const actions: ActionMenuItem[] = [];

    if (!this.selectedItems.length) {
      actions.push(
        { key: ACTION_TYPES.EDIT, callback: () => this.triggerApplicationEdit(item) },
        { key: ACTION_TYPES.CHANGE_STATUS, callback: () => this.triggerStatusChange(item) }
      );
    }

    actions.push({ key: ACTION_TYPES.DELETE, label: 'Remove', callback: () => this.triggerDelete(item) });

    return actions;
  }

  onRowClick(item: JobApplicationItem): void {
    this.rowClick.emit(item);
  }

  getLongWidthItems(item: string) {
    return ViewUtilities.checkItemForLongElegibility(item);
  }

  getShortWidthItems(item: string) {
    return ViewUtilities.checkItemForShortElegibility(item);
  }

  getStatusDisplayName(status: string): string {
    return ApplicationUtil.getDisplayName(status);
  }
}
