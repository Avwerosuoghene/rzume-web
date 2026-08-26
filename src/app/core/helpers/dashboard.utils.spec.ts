import {
  hasActiveFilters,
  mapApplicationToTableData,
  resetPagination,
  updateFilterState,
  updatePagination,
  mapJobStats,
  normalizeFilter,
  buildPagination,
  getBaseRoutes,
  getFeatureRoutes
} from './dashboard.utils';
import { ApplicationStatus } from '../models';
import { JobApplicationFilter, JobApplicationItem } from '../models/interface/job-application.models';
import { PAGINATION_DEFAULTS } from '../models/constants/dashboard.constants';
import { ConfigService } from '../services/config.service';

describe('dashboard.utils', () => {
  describe('hasActiveFilters', () => {
    it('should return false when the filter is empty', () => {
      expect(hasActiveFilters({})).toBe(false);
    });

    it('should return true when searchQuery is set', () => {
      expect(hasActiveFilters({ searchQuery: 'engineer' })).toBe(true);
    });

    it('should return true when any other filter field is set', () => {
      expect(hasActiveFilters({ status: ApplicationStatus.Applied })).toBe(true);
    });

    it('should return false when given an undefined filter', () => {
      expect(hasActiveFilters(undefined as unknown as JobApplicationFilter)).toBe(false);
    });
  });

  describe('mapApplicationToTableData', () => {
    it('should convert applicationDate to a Date instance when present', () => {
      const application = { applicationDate: '2024-01-15' } as unknown as JobApplicationItem;
      const result = mapApplicationToTableData(application);
      expect(result.applicationDate).toEqual(new Date('2024-01-15'));
    });

    it('should leave applicationDate undefined when not present', () => {
      const application = {} as JobApplicationItem;
      const result = mapApplicationToTableData(application);
      expect(result.applicationDate).toBeUndefined();
    });
  });

  describe('resetPagination', () => {
    it('should return the default pagination values', () => {
      expect(resetPagination()).toEqual({
        currentPage: PAGINATION_DEFAULTS.currentPage,
        itemsPerPage: PAGINATION_DEFAULTS.itemsPerPage
      });
    });
  });

  describe('updateFilterState', () => {
    it('should return true when there are no applications and no active filters', () => {
      expect(updateFilterState([], {})).toBe(true);
    });

    it('should return false when there are applications even with no active filters', () => {
      expect(updateFilterState([{ id: '1' } as JobApplicationItem], {})).toBe(false);
    });

    it('should return false when there are no applications but a filter is active', () => {
      expect(updateFilterState([], { searchQuery: 'foo' })).toBe(false);
    });
  });

  describe('updatePagination', () => {
    it('should mutate the state object with the pagination response values', () => {
      const state = { totalItems: 0, totalPages: 0, currentPage: 0, itemsPerPage: 0 };
      updatePagination({ totalCount: 42, totalPages: 5, currentPage: 2, pageSize: 10 }, state);

      expect(state).toEqual({ totalItems: 42, totalPages: 5, currentPage: 2, itemsPerPage: 10 });
    });
  });

  describe('mapJobStats', () => {
    it('should return only the stat entries that are present', () => {
      const result = mapJobStats({
        totalApplications: { description: 'Total', value: 10 },
        rejected: { description: 'Rejected', value: 2 },
        inProgress: undefined,
        offerReceived: undefined
      });

      expect(result).toEqual([
        { description: 'Total', value: 10 },
        { description: 'Rejected', value: 2 }
      ]);
    });

    it('should return an empty array when no stats are present', () => {
      expect(mapJobStats({})).toEqual([]);
    });
  });

  describe('normalizeFilter', () => {
    it('should merge the new filter into the current filter when status is set', () => {
      const current: JobApplicationFilter = { status: ApplicationStatus.Applied, searchQuery: 'old' };
      const result = normalizeFilter(current, { status: ApplicationStatus.Rejected });

      expect(result).toEqual({ status: ApplicationStatus.Rejected, searchQuery: 'old' });
    });

    it('should clear status and keep the rest of the current filter when new status is undefined', () => {
      const current: JobApplicationFilter = { status: ApplicationStatus.Applied, searchQuery: 'old' };
      const result = normalizeFilter(current, {});

      expect(result).toEqual({ status: undefined, searchQuery: 'old' });
    });

    it('should clear status and keep the rest of the current filter when new status is null', () => {
      const current: JobApplicationFilter = { status: ApplicationStatus.Applied, searchQuery: 'old' };
      const result = normalizeFilter(current, { status: null as unknown as ApplicationStatus });

      expect(result).toEqual({ status: undefined, searchQuery: 'old' });
    });
  });

  describe('buildPagination', () => {
    it('should map a paginated API response to the pagination shape', () => {
      expect(buildPagination({ totalCount: 20, totalPages: 2, pageNumber: 1, pageSize: 10 })).toEqual({
        totalCount: 20,
        totalPages: 2,
        currentPage: 1,
        pageSize: 10
      });
    });
  });

  describe('getBaseRoutes', () => {
    it('should return the dashboard, roles, and jobs routes', () => {
      const routes = getBaseRoutes();
      expect(routes.map(r => r.name)).toEqual(['Dashboard', 'Roles', 'Jobs']);
    });
  });

  describe('getFeatureRoutes', () => {
    it('should include the profile route when enableProfileManagement is true', () => {
      const configService = { featureFlags: { enableProfileManagement: true } } as ConfigService;
      const routes = getFeatureRoutes(configService);

      expect(routes.map(r => r.name)).toEqual(['Profile']);
    });

    it('should return no routes when enableProfileManagement is false', () => {
      const configService = { featureFlags: { enableProfileManagement: false } } as ConfigService;
      expect(getFeatureRoutes(configService)).toEqual([]);
    });
  });
});
