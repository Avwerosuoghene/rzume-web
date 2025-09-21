import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobCardTabsComponent } from './job-card-tabs.component';
import { FilterOption } from '../../../../core/models';

describe('JobCardTabsComponent', () => {
  let component: JobCardTabsComponent;
  let fixture: ComponentFixture<JobCardTabsComponent>;

  const mockTabs: FilterOption[] = [
    { label: 'All', value: '' },
    { label: 'Applied', value: 'Applied' },
    { label: 'In Progress', value: 'InProgress' },
    { label: 'Rejected', value: 'Rejected' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCardTabsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(JobCardTabsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.tabs).toEqual([]);
    expect(component.activeTab).toBe('');
  });

  describe('ngOnInit', () => {
    it('should select first tab when tabs are available', () => {
      spyOn(component, 'selectTab');
      component.tabs = mockTabs;

      component.ngOnInit();

      expect(component.selectTab).toHaveBeenCalledWith(mockTabs[0]);
    });

    it('should handle empty tabs array', () => {
      spyOn(component, 'selectTab');
      component.tabs = [];

      component.ngOnInit();

      expect(component.selectTab).toHaveBeenCalledWith(component.tabs[0]);
    });
  });

  describe('selectTab', () => {
    it('should set active tab and emit tabChange event', () => {
      spyOn(component.tabChange, 'emit');
      const selectedTab = mockTabs[1];

      component.selectTab(selectedTab);

      expect(component.activeTab).toBe(selectedTab.value);
      expect(component.tabChange.emit).toHaveBeenCalledWith(selectedTab.value);
    });

    it('should handle undefined tab', () => {
      spyOn(component.tabChange, 'emit');
      component.activeTab = 'previous';

      // Test with a tab that has undefined value
      const undefinedTab = { label: 'Invalid', value: undefined as any };
      component.selectTab(undefinedTab);

      expect(component.activeTab).toBeUndefined();
      expect(component.tabChange.emit).toHaveBeenCalledWith(undefined);
    });
  });

  it('should have required input and output properties', () => {
    expect(component.tabs).toBeDefined();
    expect(component.activeTab).toBeDefined();
    expect(component.tabChange).toBeDefined();
  });
});
