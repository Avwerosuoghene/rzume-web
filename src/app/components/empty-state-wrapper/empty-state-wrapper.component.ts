import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface EmptyStateConfig {
  title?: string;
  message?: string;
  icon?: string;
  showAction?: boolean;
  actionText?: string;
}

@Component({
  selector: 'app-empty-state-wrapper',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  templateUrl: './empty-state-wrapper.component.html',
  styleUrls: ['./empty-state-wrapper.component.scss']
})
export class EmptyStateWrapperComponent implements OnChanges {
  @Input() data: unknown[] = [];
  // Whether the caller currently has an active search/filter — domain-agnostic on purpose, so
  // this component doesn't need to know about JobApplicationFilter or any other caller-specific
  // filter shape. Each consumer computes this however makes sense for its own domain.
  @Input() hasActiveFilter = false;
  // Content shown when there's genuinely nothing yet (no filter active). Required — every
  // consumer has its own copy/icon here, there's no sensible app-wide default.
  @Input() emptyState!: EmptyStateConfig;
  // Content shown when a filter is active but matches nothing.
  @Input() noResultsState!: EmptyStateConfig;
  @Output() actionButtonClicked = new EventEmitter<void>();

  showEmptyState = false;
  hasSearchResults = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['hasActiveFilter']) {
      this.updateDisplayState();
    }
  }

  private updateDisplayState(): void {
    const hasNoItems = !this.data || this.data.length === 0;

    this.showEmptyState = hasNoItems && !this.hasActiveFilter;
    this.hasSearchResults = !(hasNoItems && this.hasActiveFilter);
  }

  onAction(): void {
    this.actionButtonClicked.emit();
  }
}
