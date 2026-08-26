import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TableBodyComponent } from './table-body.component';
import { ActionMenuComponent } from '../../action-menu/action-menu.component';
import { JobApplicationItem } from '../../../core/models/interface/job-application.models';
import { ApplicationStatus, ACTION_TYPES } from '../../../core/models';

describe('TableBodyComponent', () => {
  let component: TableBodyComponent;
  let fixture: ComponentFixture<TableBodyComponent>;

  const item = (id: string): JobApplicationItem => ({
    id,
    position: `Position ${id}`,
    companyName: `Company ${id}`,
    status: ApplicationStatus.Applied,
    applicationDate: new Date()
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableBodyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getRowActions', () => {
    it('should include edit and changeStatus alongside delete when nothing is selected', () => {
      component.selectedItems = [];

      const keys = component.getRowActions(item('1')).map(a => a.key);

      expect(keys).toContain(ACTION_TYPES.EDIT);
      expect(keys).toContain(ACTION_TYPES.CHANGE_STATUS);
      expect(keys).toContain(ACTION_TYPES.DELETE);
    });

    it('should only include delete when rows are selected (bulk-select mode)', () => {
      component.selectedItems = [item('2')];

      const keys = component.getRowActions(item('1')).map(a => a.key);

      expect(keys).not.toContain(ACTION_TYPES.EDIT);
      expect(keys).not.toContain(ACTION_TYPES.CHANGE_STATUS);
      expect(keys).toContain(ACTION_TYPES.DELETE);
    });

    it('should emit edit with the row item when the edit action\'s callback is invoked', () => {
      spyOn(component.edit, 'emit');
      component.selectedItems = [];
      const row = item('1');

      component.getRowActions(row).find(a => a.key === ACTION_TYPES.EDIT)?.callback();

      expect(component.edit.emit).toHaveBeenCalledWith(row);
    });

    it('should emit statusChange with the row item when the changeStatus action\'s callback is invoked', () => {
      spyOn(component.statusChange, 'emit');
      component.selectedItems = [];
      const row = item('1');

      component.getRowActions(row).find(a => a.key === ACTION_TYPES.CHANGE_STATUS)?.callback();

      expect(component.statusChange.emit).toHaveBeenCalledWith({ item: row });
    });

    it('should delegate to the existing triggerDelete (single vs bulk) when the delete action\'s callback is invoked', () => {
      spyOn(component, 'triggerDelete');
      component.selectedItems = [];
      const row = item('1');

      component.getRowActions(row).find(a => a.key === ACTION_TYPES.DELETE)?.callback();

      expect(component.triggerDelete).toHaveBeenCalledWith(row);
    });
  });

  describe('ActionMenuComponent composition', () => {
    it('should render one ActionMenuComponent per row, in the "menu" variant', () => {
      component.data = [item('1'), item('2')];
      component.columns = [{ header: 'Actions', field: 'action' }];
      fixture.detectChanges();

      const menus = fixture.debugElement.queryAll(By.directive(ActionMenuComponent));
      expect(menus.length).toBe(2);
      for (const menu of menus) {
        expect((menu.componentInstance as ActionMenuComponent).variant).toBe('menu');
      }
    });
  });
});
