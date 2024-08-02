import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-dropdown',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './filter-dropdown.component.html',
  styleUrl: './filter-dropdown.component.scss'
})
export class FilterDropdownComponent {
  selectedFilter: string = '';
  @Input() filters: { value: string, label: string }[] = [];


  @Output() filterChange: EventEmitter<string> = new EventEmitter<string>();

  onFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filterChange.emit(value);
  }

}
