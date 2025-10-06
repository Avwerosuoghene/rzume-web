import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { JobApplicationFilter } from '../models/interface/job-application.models';

@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  private searchTermSubject = new BehaviorSubject<string>('');
  private filterSubject = new BehaviorSubject<JobApplicationFilter>({});

  searchTerm$ = this.searchTermSubject.asObservable().pipe(shareReplay({ bufferSize: 1, refCount: true }));
  filter$ = this.filterSubject.asObservable().pipe(shareReplay({ bufferSize: 1, refCount: true }));

  constructor() {}


  updateSearchTerm(searchTerm: string): void {
    this.searchTermSubject.next(searchTerm);
    
    const currentFilter = this.filterSubject.value;
    this.updateFilter({
      ...currentFilter,
      searchQuery: searchTerm || undefined
    });
  }

  updateFilter(filter: JobApplicationFilter): void {
    this.filterSubject.next(filter);
  }


  getCurrentSearchTerm(): string {
    return this.searchTermSubject.value;
  }


  getCurrentFilter(): JobApplicationFilter {
    return this.filterSubject.value;
  }


  clearSearch(): void {
    this.searchTermSubject.next('');
    this.filterSubject.next({});
  }

  clearSearchTerm(): void {
    const currentFilter = this.filterSubject.value;
    this.searchTermSubject.next('');
    this.updateFilter({
      ...currentFilter,
      searchQuery: undefined
    });
  }
}
