import { PAGINATION_DEFAULTS } from "../models/constants/dashboard.constants";
import { JobApplicationFilter, JobApplicationItem } from "../models/interface/job-application.models";

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