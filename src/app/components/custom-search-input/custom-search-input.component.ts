import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-custom-search-input',
  standalone: true,
  imports: [ FormsModule],
  templateUrl: './custom-search-input.component.html',
  styleUrl: './custom-search-input.component.scss'
})
export class CustomSearchInputComponent implements OnDestroy {
  searchText: string = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @Output() searchChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(500), 
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchChange.emit(searchTerm);
    });
  }

  onSearch(value: string): void {
    this.searchSubject.next(value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
