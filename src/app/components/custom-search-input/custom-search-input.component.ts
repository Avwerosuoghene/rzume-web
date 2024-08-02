import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-search-input',
  standalone: true,
  imports: [ FormsModule],
  templateUrl: './custom-search-input.component.html',
  styleUrl: './custom-search-input.component.scss'
})
export class CustomSearchInputComponent {
  searchText: string = '';

  @Output() searchChange: EventEmitter<string> = new EventEmitter<string>();

  onSearch(value: string): void {
    this.searchChange.emit(value);
  }
}
