import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EMPTY_STATES } from '../../core/models/constants/dashboard.constants';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { JobApplicationFilter } from '../../core/models/interface/job-application.models';

@Component({
  selector: 'app-empty-state-wrapper',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  templateUrl: './empty-state-wrapper.component.html',
  styleUrls: ['./empty-state-wrapper.component.scss']
})
export class EmptyStateWrapperComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() currentFilter: JobApplicationFilter = {};
  @Output() actionButtonClicked = new EventEmitter<void>();

  EMPTY_STATES = EMPTY_STATES;
  showEmptyState: boolean = false;
  hasSearchResults: boolean = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['currentFilter']) {
      this.updateDisplayState();
    }
  }

  private updateDisplayState(): void {
    const hasNoItems = !this.data || this.data.length === 0;
    const hasActiveFilters = this.currentFilter && (this.currentFilter.searchQuery || this.currentFilter.status);

    this.showEmptyState = hasNoItems && !hasActiveFilters;
    this.hasSearchResults = !(hasNoItems && hasActiveFilters);
  }

  onAction(): void {
    this.actionButtonClicked.emit();
  }
}
