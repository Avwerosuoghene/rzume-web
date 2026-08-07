import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { ActionMenuComponent } from './action-menu.component';
import { ActionMenuItem, ACTION_TYPES, ACTION_TYPE_ICON_MAP, ACTION_TYPE_LABEL_MAP } from '../../core/models';

describe('ActionMenuComponent', () => {
  let component: ActionMenuComponent;
  let fixture: ComponentFixture<ActionMenuComponent>;
  let loader: HarnessLoader;

  function buildActions(): { actions: ActionMenuItem[]; downloadCallback: jasmine.Spy; deleteCallback: jasmine.Spy } {
    const downloadCallback = jasmine.createSpy('downloadCallback');
    const deleteCallback = jasmine.createSpy('deleteCallback');
    const actions: ActionMenuItem[] = [
      { key: ACTION_TYPES.DOWNLOAD, label: 'Download document', callback: downloadCallback },
      { key: ACTION_TYPES.DELETE, label: 'Delete document', callback: deleteCallback }
    ];
    return { actions, downloadCallback, deleteCallback };
  }

  // mat-menu-item's rendered text includes the mat-icon ligature text concatenated with the
  // visible label span, so an exact-match {text} harness filter doesn't hit — find by substring
  // instead (same reason role-card's kebab-menu tests need this, see role-card.component.spec.ts).
  async function findMenuItem(menu: MatMenuHarness, label: string) {
    const items = await menu.getItems();
    const texts = await Promise.all(items.map(item => item.getText()));
    const index = texts.findIndex(text => text.includes(label));
    return items[index];
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionMenuComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ActionMenuComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have an ACTION_TYPE_ICON_MAP entry for every supported ActionType', () => {
    for (const key of Object.values(ACTION_TYPES)) {
      expect(ACTION_TYPE_ICON_MAP[key]).toBeTruthy();
    }
  });

  it('should have an ACTION_TYPE_LABEL_MAP entry for every supported ActionType', () => {
    for (const key of Object.values(ACTION_TYPES)) {
      expect(ACTION_TYPE_LABEL_MAP[key]).toBeTruthy();
    }
  });

  describe('variant="icons" (default)', () => {
    it('should render one icon button per action, resolving each icon from the internal ACTION_TYPE_ICON_MAP', () => {
      const { actions } = buildActions();
      component.actions = actions;
      fixture.detectChanges();

      const images: HTMLImageElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.icon-btn img')
      );
      expect(images.length).toBe(2);
      expect(images.some(img => img.getAttribute('src') === ACTION_TYPE_ICON_MAP[ACTION_TYPES.DOWNLOAD])).toBe(true);
      expect(images.some(img => img.getAttribute('src') === ACTION_TYPE_ICON_MAP[ACTION_TYPES.DELETE])).toBe(true);
    });

    it('should use each action\'s explicit label as the icon button aria-label when provided', () => {
      const { actions } = buildActions();
      component.actions = actions;
      fixture.detectChanges();

      const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.icon-btn'));
      const ariaLabels = buttons.map(btn => btn.getAttribute('aria-label'));
      expect(ariaLabels).toContain('Download document');
      expect(ariaLabels).toContain('Delete document');
    });

    it('should fall back to ACTION_TYPE_LABEL_MAP[key] as the aria-label when no label is provided', () => {
      const callback = jasmine.createSpy('viewCallback');
      component.actions = [{ key: ACTION_TYPES.VIEW, callback }];
      fixture.detectChanges();

      const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('.icon-btn');
      expect(button?.getAttribute('aria-label')).toBe(ACTION_TYPE_LABEL_MAP[ACTION_TYPES.VIEW]);
    });

    it('should not render a mat-menu trigger at all', () => {
      const { actions } = buildActions();
      component.actions = actions;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('button[aria-label="Actions"]')).toBeFalsy();
    });

    it('should invoke the clicked action\'s own callback, not any other action\'s', () => {
      const { actions, downloadCallback, deleteCallback } = buildActions();
      component.actions = actions;
      fixture.detectChanges();

      const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.icon-btn'));
      const deleteButton = buttons.find(btn => btn.getAttribute('aria-label') === 'Delete document');
      deleteButton?.click();

      expect(deleteCallback).toHaveBeenCalled();
      expect(downloadCallback).not.toHaveBeenCalled();
    });
  });

  describe('variant="menu"', () => {
    it('should render a single kebab menu trigger, not the icon buttons', () => {
      const { actions } = buildActions();
      component.actions = actions;
      component.variant = 'menu';
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.icon-btn')).toBeFalsy();
    });

    it('should render one menu item per action, labelled with action.label', async () => {
      const { actions } = buildActions();
      component.actions = actions;
      component.variant = 'menu';
      fixture.detectChanges();

      const menu = await loader.getHarness(MatMenuHarness);
      await menu.open();

      const downloadItem = await findMenuItem(menu, 'Download document');
      const deleteItem = await findMenuItem(menu, 'Delete document');

      expect(downloadItem).toBeTruthy();
      expect(deleteItem).toBeTruthy();
    });

    it('should fall back to ACTION_TYPE_LABEL_MAP[key] for a menu item with no explicit label', async () => {
      const callback = jasmine.createSpy('renameCallback');
      component.actions = [{ key: ACTION_TYPES.RENAME, callback }];
      component.variant = 'menu';
      fixture.detectChanges();

      const menu = await loader.getHarness(MatMenuHarness);
      await menu.open();
      const renameItem = await findMenuItem(menu, ACTION_TYPE_LABEL_MAP[ACTION_TYPES.RENAME]);

      expect(renameItem).toBeTruthy();
    });

    it('should resolve each menu item\'s icon from the same internal ACTION_TYPE_ICON_MAP as the icons variant', async () => {
      const { actions } = buildActions();
      component.actions = actions;
      component.variant = 'menu';
      fixture.detectChanges();

      const menu = await loader.getHarness(MatMenuHarness);
      await menu.open();

      const images: HTMLImageElement[] = Array.from(document.querySelectorAll('.mat-mdc-menu-panel img'));
      expect(images.some(img => img.getAttribute('src') === ACTION_TYPE_ICON_MAP[ACTION_TYPES.DOWNLOAD])).toBe(true);
      expect(images.some(img => img.getAttribute('src') === ACTION_TYPE_ICON_MAP[ACTION_TYPES.DELETE])).toBe(true);
    });

    it('should invoke the clicked action\'s own callback when a menu item is clicked', async () => {
      const { actions, downloadCallback, deleteCallback } = buildActions();
      component.actions = actions;
      component.variant = 'menu';
      fixture.detectChanges();

      const menu = await loader.getHarness(MatMenuHarness);
      await menu.open();
      const deleteItem = await findMenuItem(menu, 'Delete document');
      await deleteItem.click();

      expect(deleteCallback).toHaveBeenCalled();
      expect(downloadCallback).not.toHaveBeenCalled();
    });
  });
});
