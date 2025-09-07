import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules';
import { ApplicationUtil, ViewUtilities } from '../../../core/helpers';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColumnDefinition } from '../../../core/models';
import { JobApplicationItem } from '../../../core/models/interface/job-application.models';

@Component({
  selector: 'app-table-body',
  standalone: true,
  imports: [AngularMaterialModules, CommonModule, FormsModule],
  templateUrl: './table-body.component.html',
  styleUrl: './table-body.component.scss'
})
export class TableBodyComponent  {

  @Input() data: JobApplicationItem[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() selectedItems: JobApplicationItem[] = [];
  @Output() checkBoxChanged = new EventEmitter<any>();
  @Output() edit = new EventEmitter<JobApplicationItem>(); 
  @Output() delete = new EventEmitter<string[]>();
  @Output() statusChange = new EventEmitter<{item: JobApplicationItem}>();

  triggerCheckboxChange(item: JobApplicationItem, event: any): void {
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
