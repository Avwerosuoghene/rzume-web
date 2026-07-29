import { TestBed } from '@angular/core/testing';
import { SearchStateService } from './search-state.service';
import { ApplicationStatus } from '../models/enums/shared.enums';

describe('SearchStateService', () => {
  let service: SearchStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SearchStateService] });
    service = TestBed.inject(SearchStateService);
  });

  it('should start with an empty search term and empty filter', () => {
    expect(service.getCurrentSearchTerm()).toBe('');
    expect(service.getCurrentFilter()).toEqual({});
  });

  describe('updateSearchTerm', () => {
    it('should update the search term and sync it into the filter as searchQuery', () => {
      service.updateSearchTerm('engineer');

      expect(service.getCurrentSearchTerm()).toBe('engineer');
      expect(service.getCurrentFilter()).toEqual({ searchQuery: 'engineer' });
    });

    it('should preserve other existing filter fields when updating the search term', () => {
      service.updateFilter({ status: ApplicationStatus.Applied });
      service.updateSearchTerm('engineer');

      expect(service.getCurrentFilter()).toEqual({ status: ApplicationStatus.Applied, searchQuery: 'engineer' });
    });

    it('should clear searchQuery from the filter (not set it to an empty string) when given an empty term', () => {
      service.updateSearchTerm('engineer');
      service.updateSearchTerm('');

      expect(service.getCurrentFilter().searchQuery).toBeUndefined();
    });
  });

  describe('updateFilter', () => {
    it('should replace the current filter entirely', () => {
      service.updateFilter({ searchQuery: 'a', status: ApplicationStatus.Applied });
      service.updateFilter({ status: ApplicationStatus.Rejected });

      expect(service.getCurrentFilter()).toEqual({ status: ApplicationStatus.Rejected });
    });
  });

  describe('clearSearch', () => {
    it('should reset both the search term and the entire filter object', () => {
      service.updateFilter({ status: ApplicationStatus.Applied });
      service.updateSearchTerm('engineer');

      service.clearSearch();

      expect(service.getCurrentSearchTerm()).toBe('');
      expect(service.getCurrentFilter()).toEqual({});
    });
  });

  describe('clearSearchTerm', () => {
    it('should clear only the search term, preserving other filter fields', () => {
      service.updateFilter({ status: ApplicationStatus.Applied });
      service.updateSearchTerm('engineer');

      service.clearSearchTerm();

      expect(service.getCurrentSearchTerm()).toBe('');
      expect(service.getCurrentFilter()).toEqual({ status: ApplicationStatus.Applied, searchQuery: undefined });
    });
  });

  describe('searchTerm$ / filter$', () => {
    it('should emit the current search term immediately to a new subscriber', () => {
      service.updateSearchTerm('engineer');

      let received: string | undefined;
      service.searchTerm$.subscribe(v => (received = v));

      expect(received).toBe('engineer');
    });

    it('should emit the current filter immediately to a new subscriber', () => {
      service.updateFilter({ status: ApplicationStatus.Applied });

      let received: unknown;
      service.filter$.subscribe(v => (received = v));

      expect(received).toEqual({ status: ApplicationStatus.Applied });
    });
  });
});
