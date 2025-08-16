import { FilterOption } from "../interface";
import { ColumnDefinition } from "../interface/dashboard.models";

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
] as Array<ColumnDefinition>;

export const JOB_FILTER_OPTIONS = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
] as Array<FilterOption>;
