import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { EmptyStateWrapperComponent } from './empty-state-wrapper.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { JobApplicationFilter } from '../../core/models/interface/job-application.models';
import { ApplicationStatus } from '../../core/models/enums/shared.enums';

describe('EmptyStateWrapperComponent', () => {
  let component: EmptyStateWrapperComponent;
  let fixture: ComponentFixture<EmptyStateWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateWrapperComponent, EmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateWrapperComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.data).toEqual([]);
    expect(component.currentFilter).toEqual({});
    expect(component.showEmptyState).toBe(false);
    expect(component.hasSearchResults).toBe(true);
  });

  describe('ngOnChanges', () => {
    it('should call updateDisplayState when data changes', () => {
      spyOn(component as any, 'updateDisplayState');
      
      component.ngOnChanges({
        data: new SimpleChange([], [1, 2, 3], false)
      });

      expect((component as any).updateDisplayState).toHaveBeenCalled();
    });

    it('should call updateDisplayState when currentFilter changes', () => {
      spyOn(component as any, 'updateDisplayState');
      
      component.ngOnChanges({
        currentFilter: new SimpleChange({}, { searchQuery: 'test' }, false)
      });

      expect((component as any).updateDisplayState).toHaveBeenCalled();
    });
  });

  describe('updateDisplayState', () => {
    it('should show empty state when no data and no active filters', () => {
      component.data = [];
      component.currentFilter = {};
      
      (component as any).updateDisplayState();

      expect(component.showEmptyState).toBe(true);
      expect(component.hasSearchResults).toBe(true);
    });

    it('should not show empty state when has data', () => {
      component.data = [{ id: '1' }];
      component.currentFilter = {};
      
      (component as any).updateDisplayState();

      expect(component.showEmptyState).toBe(false);
      expect(component.hasSearchResults).toBe(true);
    });

    it('should not show empty state but show no search results when no data with search query', () => {
      component.data = [];
      component.currentFilter = { searchQuery: 'test' };
      
      (component as any).updateDisplayState();

      expect(component.showEmptyState).toBe(false);
      expect(component.hasSearchResults).toBe(false);
    });

    it('should not show empty state but show no search results when no data with status filter', () => {
      component.data = [];
      component.currentFilter = { status: ApplicationStatus.Applied };
      
      (component as any).updateDisplayState();

      expect(component.showEmptyState).toBe(false);
      expect(component.hasSearchResults).toBe(false);
    });

    it('should handle null data', () => {
      component.data = null as any;
      component.currentFilter = {};
      
      (component as any).updateDisplayState();

      expect(component.showEmptyState).toBe(true);
      expect(component.hasSearchResults).toBe(true);
    });

    it('should handle undefined data', () => {
      component.data = undefined as any;
      component.currentFilter = {};
      
      (component as any).updateDisplayState();

      expect(component.showEmptyState).toBe(true);
      expect(component.hasSearchResults).toBe(true);
    });
  });

  describe('onAction', () => {
    it('should emit actionButtonClicked event', () => {
      spyOn(component.actionButtonClicked, 'emit');

      component.onAction();

      expect(component.actionButtonClicked.emit).toHaveBeenCalled();
    });
  });

  it('should have EMPTY_STATES constant available', () => {
    expect(component.EMPTY_STATES).toBeDefined();
  });
});
