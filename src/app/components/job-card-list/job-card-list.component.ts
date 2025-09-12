import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { JobCardTabsComponent } from './partials/job-card-tabs/job-card-tabs.component';
import { JobCardItemComponent } from './partials/job-card-item/job-card-item.component';
import {
  JobApplicationFilter,
  JobApplicationItem
} from '../../core/models/interface/job-application.models';
import { JOB_FILTER_OPTIONS } from '../../core/models/constants/dashboard.constants';
import { AngularMaterialModules } from '../../core/modules';
import { EmptyStateWrapperComponent } from '../empty-state-wrapper/empty-state-wrapper.component';
import { CircularLoaderComponent } from '../circular-loader/circular-loader.component';
import { ApplicationStatus, SCROLL_DEBOUNCE_TIME, SCROLL_THRESHOLD } from '../../core/models';

@Component({
  selector: 'app-job-card-list',
  standalone: true,
  imports: [
    CommonModule,
    JobCardTabsComponent,
    JobCardItemComponent,
    AngularMaterialModules,
    EmptyStateWrapperComponent,
    CircularLoaderComponent
  ],
  templateUrl: './job-card-list.component.html',
  styleUrls: ['./job-card-list.component.scss']
})
export class JobCardListComponent implements AfterViewInit, OnDestroy {
  @Output() jobApplicationUpdate = new EventEmitter<JobApplicationItem>();
  @Output() jobStatusUpdate = new EventEmitter<{ item: JobApplicationItem }>();
  @Output() jobApplicationsDelete = new EventEmitter<string[]>();
  @Output() jobApplicationAddition = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<JobApplicationFilter>();
  @Output() loadMore = new EventEmitter<void>();

  @Input() jobs: JobApplicationItem[] = [];
  @Input() isLoading = false;
  @Input() totalItems = 0;

  @ViewChild('cardListContainer') private cardListContainer?: ElementRef<HTMLElement>;

  private destroy$ = new Subject<void>();

  readonly tabs = JOB_FILTER_OPTIONS.filter(option => option.value !== '');
  activeTab = this.tabs[0]?.value ?? '';
  currentFilter: JobApplicationFilter = {};

  ngAfterViewInit(): void {
    this.setupScrollListener();
  }

  setupScrollListener(): void {
    if (!this.cardListContainer) return;

    fromEvent<Event>(this.cardListContainer.nativeElement, 'scroll')
      .pipe(debounceTime(SCROLL_DEBOUNCE_TIME), takeUntil(this.destroy$))
      .subscribe(event => this.handleScroll(event));
  }

  handleScroll(event: Event): void {
    const target = event.target as HTMLElement;
  
    if (this.isAtBottom(target) && this.jobs.length < this.totalItems) {
      this.loadMore.emit();
    }
  }
  
  isAtBottom(target: HTMLElement): boolean {
    return target.scrollTop + target.clientHeight >= target.scrollHeight - SCROLL_THRESHOLD;
  }

  handleTabChange(tab: string): void {
    if (this.activeTab === tab) return;

    this.activeTab = tab;
    this.currentFilter = { ...this.currentFilter, status: this.activeTab as ApplicationStatus };
    this.filterChange.emit(this.currentFilter);
  }

  handleAddJobApplication(): void {
    this.jobApplicationAddition.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}