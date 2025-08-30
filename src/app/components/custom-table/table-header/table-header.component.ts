import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColumnDefinition } from '../../../core/models/interface/dashboard.models';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ViewUtilities } from '../../../core/helpers';

@Component({
  selector: 'app-table-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, FormsModule],
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss']
})
export class TableHeaderComponent {
  @Input() columns: ColumnDefinition[] = [];
  @Input() allSelected = false;
  @Output() selectAll = new EventEmitter<boolean>();
  @Output() sort = new EventEmitter<string>();

  toggleAllSelectionsEvent(event: any): void {
    this.selectAll.emit(event);
  }

 getLongWidthItems(item: string) {
    return ViewUtilities.checkItemForLongElegibility(item);
  }

  getShortWidthItems(item: string) {
    return ViewUtilities.checkItemForShortElegibility(item);

  }
}