import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { EmptyStateWrapperComponent, EmptyStateConfig } from './empty-state-wrapper.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

describe('EmptyStateWrapperComponent', () => {
  let component: EmptyStateWrapperComponent;
  let fixture: ComponentFixture<EmptyStateWrapperComponent>;

  const emptyState: EmptyStateConfig = {
    title: 'No items yet',
    message: 'Add one to get started.',
    icon: 'folder_open',
    showAction: true,
    actionText: 'Add item'
  };

  const noResultsState: EmptyStateConfig = {
    title: 'No matches',
    message: 'Try a different search.',
    icon: 'search_off'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateWrapperComponent, EmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateWrapperComponent);
    component = fixture.componentInstance;
    component.emptyState = emptyState;
    component.noResultsState = noResultsState;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.data).toEqual([]);
    expect(component.hasActiveFilter).toBe(false);
    expect(component.showEmptyState).toBe(false);
    expect(component.hasSearchResults).toBe(true);
  });

  describe('ngOnChanges', () => {
    it('should call updateDisplayState when data changes', () => {
      spyOn(component as unknown as { updateDisplayState: () => void }, 'updateDisplayState');

      component.ngOnChanges({
        data: new SimpleChange([], [1, 2, 3], false)
      });

      expect(component['updateDisplayState']).toHaveBeenCalled();
    });

    it('should call updateDisplayState when hasActiveFilter changes', () => {
      spyOn(component as unknown as { updateDisplayState: () => void }, 'updateDisplayState');

      component.ngOnChanges({
        hasActiveFilter: new SimpleChange(false, true, false)
      });

      expect(component['updateDisplayState']).toHaveBeenCalled();
    });
  });

  describe('updateDisplayState', () => {
    it('should show empty state when no data and no active filter', () => {
      component.data = [];
      component.hasActiveFilter = false;

      component['updateDisplayState']();

      expect(component.showEmptyState).toBe(true);
      expect(component.hasSearchResults).toBe(true);
    });

    it('should not show empty state when has data', () => {
      component.data = [{ id: '1' }];
      component.hasActiveFilter = false;

      component['updateDisplayState']();

      expect(component.showEmptyState).toBe(false);
      expect(component.hasSearchResults).toBe(true);
    });

    it('should not show empty state but show no search results when no data with an active filter', () => {
      component.data = [];
      component.hasActiveFilter = true;

      component['updateDisplayState']();

      expect(component.showEmptyState).toBe(false);
      expect(component.hasSearchResults).toBe(false);
    });

    it('should handle null data', () => {
      component.data = null as unknown as unknown[];
      component.hasActiveFilter = false;

      component['updateDisplayState']();

      expect(component.showEmptyState).toBe(true);
      expect(component.hasSearchResults).toBe(true);
    });

    it('should handle undefined data', () => {
      component.data = undefined as unknown as unknown[];
      component.hasActiveFilter = false;

      component['updateDisplayState']();

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

  describe('rendered content, driven by the caller-supplied emptyState/noResultsState configs', () => {
    it('should render the caller\'s emptyState content when genuinely empty', () => {
      component.data = [];
      component.hasActiveFilter = false;
      component['updateDisplayState']();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(emptyState.title);
      expect(fixture.nativeElement.textContent).toContain(emptyState.message);
    });

    it('should render the caller\'s noResultsState content when a filter is active with no matches', () => {
      component.data = [];
      component.hasActiveFilter = true;
      component['updateDisplayState']();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(noResultsState.title);
      expect(fixture.nativeElement.textContent).toContain(noResultsState.message);
    });

    it('should project content when there is data', () => {
      component.data = [{ id: '1' }];
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
    });
  });
});
