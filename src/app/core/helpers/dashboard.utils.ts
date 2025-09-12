import { PAGINATION_DEFAULTS } from "../models/constants/dashboard.constants";
import { JobApplicationFilter, JobApplicationItem, JobApplicationStatItemDto } from "../models/interface/job-application.models";

export function hasActiveFilters(filter: JobApplicationFilter): boolean {
    return !!filter?.searchQuery || Object.values(filter || {}).some(val => !!val);
}

export function mapApplicationToTableData(application: JobApplicationItem): JobApplicationItem {
    return {
        ...application,
        applicationDate: application.applicationDate ? new Date(application.applicationDate) : undefined
    };
}

export function resetPagination() {
    return {
        currentPage: PAGINATION_DEFAULTS.currentPage,
        itemsPerPage: PAGINATION_DEFAULTS.itemsPerPage
    };
}

export function updateFilterState(applications: JobApplicationItem[], filter: JobApplicationFilter): boolean {
    const hasNoApplications = applications.length === 0;
    const hasNoFilters = !hasActiveFilters(filter);
    return hasNoApplications && hasNoFilters;
}

export function updatePagination(
    pagination: { totalCount: number; totalPages: number; currentPage: number; pageSize: number },
    state: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        itemsPerPage: number;
    }
) {
    state.totalItems = pagination.totalCount;
    state.totalPages = pagination.totalPages;
    state.currentPage = pagination.currentPage;
    state.itemsPerPage = pagination.pageSize;
}

export function mapJobStats(stats: any): JobApplicationStatItemDto[] {
    return [
        stats.totalApplications,
        stats.rejected,
        stats.inProgress,
        stats.offerReceived
    ].filter(Boolean);
}

export function normalizeFilter(currentFilter: JobApplicationFilter, newFilter: JobApplicationFilter): JobApplicationFilter {
    if (newFilter.status === undefined || newFilter.status === null) {
        return { ...currentFilter, status: undefined };
    }
    return { ...currentFilter, ...newFilter };
}

export function buildPagination(data: any) {
    return {
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        currentPage: data.pageNumber,
        pageSize: data.pageSize
    };
}
