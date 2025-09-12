import { EmptyStateIcon } from "../enums";
import { FilterOption } from "../interface";
import { ColumnDefinition, EmptyStateConfig } from "../interface/dashboard.models";
import { APPLICATION_STATUS_OPTIONS } from "./application-status-options.constants";

export const PAGINATION_DEFAULTS = {
  totalPages: 1 as number,
  currentPage: 1 as number,
  itemsPerPage: 5 as number,
  totalItems: 0 as number,
} as const;

export const JOB_TABLE_COLUMNS = [
  { header: 'Company', field: 'companyName' },
  { header: 'Job Role', field: 'position' },
  { header: 'Resume Link', field: 'resumeLink' },
  { header: 'Job Link', field: 'jobLink' },
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


export const EMPTY_STATES = {
  noApplications: {
    title: 'No Applications Yet',
    message: "You haven't added any job applications yet. Click the button below to get started!",
    icon: EmptyStateIcon.NoApplications,
    showAction: true,
    actionText: 'Add First Application'
  },
  noSearchResults: {
    title: 'No Matching Results',
    message: 'No job applications match your search or filter criteria. Try adjusting your search or filters.',
    icon: EmptyStateIcon.NoResults,
    showAction: false
  }
};
