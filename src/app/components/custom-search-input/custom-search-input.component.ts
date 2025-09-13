import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnDestroy, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-custom-search-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './custom-search-input.component.html',
  styleUrl: './custom-search-input.component.scss',
})
export class CustomSearchInputComponent implements OnDestroy {
  @Input() borderRadius: number = 8;
  searchText: string = '';
  isFocused = false;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @Output() searchChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
    this.setupSearchListener();
  }

  setupSearchListener(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => this.searchChange.emit(searchTerm));
  }

  onSearch(value: string): void {
    this.searchSubject.next(value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
