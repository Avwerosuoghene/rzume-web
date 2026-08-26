import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabNavigationComponent } from './tab-navigation.component';
import { ProfileTabConfig } from '../../../../core/models/constants/profile.constants';

describe('TabNavigationComponent', () => {
  let component: TabNavigationComponent;
  let fixture: ComponentFixture<TabNavigationComponent>;

  const tabs: ProfileTabConfig[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'documents', label: 'Documents' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabNavigationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TabNavigationComponent);
    component = fixture.componentInstance;
    component.tabs = tabs;
    component.activeTabId = 'profile';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onTabClick', () => {
    it('should emit the tab id when a different tab is clicked', () => {
      const spy = jasmine.createSpy('tabChange');
      component.tabChange.subscribe(spy);

      component.onTabClick('documents');

      expect(spy).toHaveBeenCalledWith('documents');
    });

    it('should not emit when the already-active tab is clicked', () => {
      const spy = jasmine.createSpy('tabChange');
      component.tabChange.subscribe(spy);

      component.onTabClick('profile');

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('isActive', () => {
    it('should return true for the active tab id', () => {
      expect(component.isActive('profile')).toBe(true);
    });

    it('should return false for a non-active tab id', () => {
      expect(component.isActive('documents')).toBe(false);
    });
  });

  it('trackByTabId should return the tab id', () => {
    expect(component.trackByTabId(0, tabs[1])).toBe('documents');
  });
});
