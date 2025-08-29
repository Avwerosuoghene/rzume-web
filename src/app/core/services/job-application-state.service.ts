import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { JobApplicationItem } from '../models/interface/job-application.models';
import { PaginatedItem } from '../models';
import { PAGINATION_DEFAULTS } from '../models/constants/dashboard.constants';

@Injectable({
    providedIn: 'root'
})
export class JobApplicationStateService {
    private initialState: PaginatedItem<JobApplicationItem> = {
        items: [],
        totalCount: PAGINATION_DEFAULTS.totalItems,
        totalPages: PAGINATION_DEFAULTS.totalPages,
        pageNumber: PAGINATION_DEFAULTS.currentPage,
        pageSize: PAGINATION_DEFAULTS.itemsPerPage,
        hasPrevious: false,
        hasNext: false
    };
    private state$ = new BehaviorSubject<PaginatedItem<JobApplicationItem>>(this.initialState);

    getApplications() {
        return this.state$.asObservable();
    }


    updateState(updatedState: PaginatedItem<JobApplicationItem>) {
        this.state$.next(updatedState);
    }

    updateApplications(updatedState: PaginatedItem<JobApplicationItem>) {
        this.updateState(updatedState);
    }

}