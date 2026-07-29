import { ApplicationUtil } from './application.util';
import { ApplicationStatus } from '../models';
import { APPLICATION_STATUS_OPTIONS } from '../models/constants/application-status-options.constants';

describe('ApplicationUtil', () => {
  describe('getDisplayName', () => {
    it('should return the mapped display name when the status has an option', () => {
      expect(ApplicationUtil.getDisplayName(ApplicationStatus.Wishlist)).toBe('Wish List');
      expect(ApplicationUtil.getDisplayName(ApplicationStatus.Applied)).toBe('Applied');
      expect(ApplicationUtil.getDisplayName(ApplicationStatus.InProgress)).toBe('In Progress');
      expect(ApplicationUtil.getDisplayName(ApplicationStatus.OfferReceived)).toBe('Offered');
      expect(ApplicationUtil.getDisplayName(ApplicationStatus.Rejected)).toBe('Rejected');
    });

    it('should return the raw status value when no option is mapped for it', () => {
      expect(ApplicationUtil.getDisplayName(ApplicationStatus.Submitted)).toBe('Submitted');
    });

    it('should return the raw value when given an arbitrary unmapped string', () => {
      expect(ApplicationUtil.getDisplayName('SomeUnknownStatus')).toBe('SomeUnknownStatus');
    });
  });

  describe('getAllOptions', () => {
    it('should return the full application status options list', () => {
      expect(ApplicationUtil.getAllOptions()).toBe(APPLICATION_STATUS_OPTIONS);
      expect(ApplicationUtil.getAllOptions().length).toBe(5);
    });
  });
});
