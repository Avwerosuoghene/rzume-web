import { FilterOption } from "../interface";
import { ColumnDefinition } from "../interface/dashboard.models";
import { APPLICATION_STATUS_OPTIONS } from "./application-status-options.constants";

export const PAGINATION_DEFAULTS = {
  totalPages: 1,
  currentPage: 1,
  itemsPerPage: 5,
  totalItems: 0,
} as const;

export const JOB_TABLE_COLUMNS = [
  { header: 'Company', field: 'companyName' },
  { header: 'Job Role', field: 'position' },
  { header: 'Resume Link', field: 'resumeLink' },
  { header: 'Status', field: 'status' },
  { header: 'Date', field: 'applicationDate' },
  { header: 'Action', field: 'action' }
] as Array<ColumnDefinition>;

export const JOB_FILTER_OPTIONS: FilterOption[] = [
  { value: '', label: 'All Status' },
  ...APPLICATION_STATUS_OPTIONS.map(option => ({
    value: option.value,
    label: option.name
  }))
];
