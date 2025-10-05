import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
  SimpleChanges,
  OnChanges,
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
import { ApplicationStatus, DELETE_APP_TITLE, SCROLL_DEBOUNCE_TIME, SCROLL_THRESHOLD } from '../../core/models';
import { DialogHelperService } from '../../core/services/dialog-helper.service';

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
export class JobCardListComponent implements  AfterViewInit, OnDestroy, OnChanges {
  @Output() jobApplicationUpdate = new EventEmitter<JobApplicationItem>();
  @Output() jobStatusUpdate = new EventEmitter<{ item: JobApplicationItem }>();
  @Output() jobApplicationsDelete = new EventEmitter<string[]>();
  @Output() jobApplicationAddition = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<JobApplicationFilter>();
  @Output() loadMore = new EventEmitter<void>();

  @Input() jobs: JobApplicationItem[] = [];
  @Input() isLoading = false;
  @Input() totalItems = 0;
  showEmptyState: boolean = false;


  @ViewChild('cardListContainer') private cardListContainer?: ElementRef<HTMLElement>;

  private destroy$ = new Subject<void>();

  readonly tabs = JOB_FILTER_OPTIONS;
  activeTab = this.tabs[0]?.value ?? '';
  currentFilter: JobApplicationFilter = {};

  constructor(private dialogHelper: DialogHelperService) { }

  ngAfterViewInit(): void {
    this.setupScrollListener();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jobs'] || changes['currentFilter']) {
      this.updateDisplayState();
    }
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

  handleJobApplicationDelete(item: JobApplicationItem){
    this.dialogHelper.openDeleteConfirmation([item], () => {
      this.jobApplicationsDelete.emit([item.id]);
    }, DELETE_APP_TITLE);
  }

  handleJobStatusUpdate(item: JobApplicationItem) {
    this.dialogHelper.openJobStatusDialog(item, (updatedJobItem) => {
      this.jobStatusUpdate.emit({ item: updatedJobItem });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateDisplayState(): void {
    const hasNoItems = !this.jobs || this.jobs.length === 0;
    const hasActiveFilters = this.currentFilter && (this.currentFilter.searchQuery || this.currentFilter.status);

    this.showEmptyState = hasNoItems && !hasActiveFilters;
    console.log(this.showEmptyState)
  }

}