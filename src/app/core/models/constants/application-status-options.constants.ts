import { ApplicationStatus } from '../enums/shared.enums';
import { ApplicationStatusOption } from '../types/dropdown-option.types';

/**
 * Mapping of ApplicationStatus enum values to human-readable display names
 */
export const APPLICATION_STATUS_OPTIONS: ApplicationStatusOption[] = [
  {
    name: 'Wish List',
    value: ApplicationStatus.Wishlist
  },
  {
    name: 'Applied',
    value: ApplicationStatus.Applied
  },
  {
    name: 'In Progress',
    value: ApplicationStatus.InProgress
  },
  {
    name: 'Offered',
    value: ApplicationStatus.OfferReceived
  },
  {
    name: 'Rejected',
    value: ApplicationStatus.Rejected
  }
];
