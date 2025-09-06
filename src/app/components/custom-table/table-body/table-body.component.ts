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
export class TableBodyComponent {

  @Input() data: any[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() selectedItems: any[] = [];
  @Output() checkBoxChanged = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>(); 
  @Output() delete = new EventEmitter<any>();
  @Output() statusChange = new EventEmitter<{item: JobApplicationItem}>();

  triggerCheckboxChange(item: any, event: any): void {
    this.checkBoxChanged.emit({item, event});
  }

  triggerApplicationEdit(application: any): void {
    this.edit.emit(application);
  }

  triggerDelete(): void {
    this.delete.emit();
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
