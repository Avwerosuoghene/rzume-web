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
  { header: 'Company', field: 'company' },
  { header: 'Job Role', field: 'job_role' },
  { header: 'Cv Used', field: 'cv' },
  { header: 'Status', field: 'status' },
  { header: 'Date', field: 'date' },
  { header: 'Action', field: 'action' }
] as Array<ColumnDefinition>;

export const JOB_FILTER_OPTIONS: FilterOption[] = [
  { value: '', label: 'All Status' },
  ...APPLICATION_STATUS_OPTIONS.map(option => ({
    value: option.value,
    label: option.name
  }))
];
