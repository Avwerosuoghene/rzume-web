import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DocumentItemComponent } from './document-item.component';
import { ActionMenuComponent } from '../../../../components/action-menu/action-menu.component';
import { DocumentItem, ACTION_TYPES } from '../../../../core/models';
import { DocumentHelper } from '../../../../core/helpers';

describe('DocumentItemComponent', () => {
  let component: DocumentItemComponent;
  let fixture: ComponentFixture<DocumentItemComponent>;

  const mockDocument: DocumentItem = {
    id: 'doc-1',
    fileName: 'resume.pdf',
    fileSize: 2 * 1024 * 1024 + 512 * 1024,
    fileType: 'application/pdf',
    uploadedAt: new Date('2026-01-01'),
    url: 'http://example.com/resume.pdf'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentItemComponent);
    component = fixture.componentInstance;
    component.document = mockDocument;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('long filenames (see: card height growing to accommodate wrapped text)', () => {
    it('should truncate a filename longer than the character limit, with an ellipsis', () => {
      component.document = { ...mockDocument, fileName: 'a-very-long-resume-filename-that-goes-on-and-on.pdf' };
      fixture.detectChanges();

      const nameEl: HTMLElement = fixture.nativeElement.querySelector('.document-filename');
      expect(nameEl.textContent!.trim().endsWith('...')).toBe(true);
      expect(nameEl.textContent!.trim().length).toBeLessThan('a-very-long-resume-filename-that-goes-on-and-on.pdf'.length);
    });

    it('should not truncate a filename within the character limit', () => {
      component.document = { ...mockDocument, fileName: 'resume.pdf' };
      fixture.detectChanges();

      const nameEl: HTMLElement = fixture.nativeElement.querySelector('.document-filename');
      expect(nameEl.textContent!.trim()).toBe('resume.pdf');
    });

    it('should force the filename onto a single line via CSS, as a backstop regardless of the exact character limit chosen', () => {
      const nameEl: HTMLElement = fixture.nativeElement.querySelector('.document-filename');
      const style = getComputedStyle(nameEl);

      expect(style.whiteSpace).toBe('nowrap');
      expect(style.overflow).toBe('hidden');
      expect(style.textOverflow).toBe('ellipsis');
    });

    it('should default the truncate limit to 30 characters when filenameTruncateLimit is not set', () => {
      component.document = { ...mockDocument, fileName: 'a-very-long-resume-filename-that-goes-on-and-on.pdf' };
      fixture.detectChanges();

      const nameEl: HTMLElement = fixture.nativeElement.querySelector('.document-filename');
      expect(nameEl.textContent!.trim()).toBe('a-very-long-resume-filename-th...');
    });

    it('should truncate at a shorter, caller-supplied limit when filenameTruncateLimit is set (role-card uses a tighter limit than Profile Management\'s wider list)', () => {
      component.document = { ...mockDocument, fileName: 'a-very-long-resume-filename-that-goes-on-and-on.pdf' };
      component.filenameTruncateLimit = 12;
      fixture.detectChanges();

      const nameEl: HTMLElement = fixture.nativeElement.querySelector('.document-filename');
      expect(nameEl.textContent!.trim()).toBe('a-very-long-...');
    });
  });

  it('should emit the document id on edit', () => {
    const spy = jasmine.createSpy('edit');
    component.edit.subscribe(spy);

    component.onEdit();

    expect(spy).toHaveBeenCalledWith('doc-1');
  });

  it('should emit the document id on delete', () => {
    const spy = jasmine.createSpy('delete');
    component.delete.subscribe(spy);

    component.onDelete();

    expect(spy).toHaveBeenCalledWith('doc-1');
  });

  it('should open the document\'s url in a new tab on view (Figma "Parent action modal", node 1314:2597)', () => {
    spyOn(window, 'open');

    component.onView();

    expect(window.open).toHaveBeenCalledWith('http://example.com/resume.pdf', '_blank', 'noopener');
  });

  it('should emit the document id on download', () => {
    const spy = jasmine.createSpy('download');
    component.download.subscribe(spy);

    component.onDownload();

    expect(spy).toHaveBeenCalledWith('doc-1');
  });

  it('should default actionsVariant to "icons" (viewport-toggled desktop icons / mobile menu)', () => {
    expect(component.actionsVariant).toBe('icons');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.desktop-actions')).toBeTruthy();
    expect(compiled.querySelector('.mobile-actions')).toBeTruthy();
    expect(compiled.querySelector('.menu-actions')).toBeFalsy();
  });

  it('should render only the always-visible kebab menu when actionsVariant is "menu" (see role-card Figma node 1314:2681)', () => {
    component.actionsVariant = 'menu';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.menu-actions')).toBeTruthy();
    expect(compiled.querySelector('.desktop-actions')).toBeFalsy();
    expect(compiled.querySelector('.mobile-actions')).toBeFalsy();
  });

  describe('excludeActions', () => {
    it('should include view/edit/download/delete by default (excludeActions empty)', () => {
      const menu = fixture.debugElement.query(By.directive(ActionMenuComponent)).componentInstance as ActionMenuComponent;
      const keys = menu.actions.map(a => a.key);

      expect(keys).toEqual([ACTION_TYPES.VIEW, ACTION_TYPES.EDIT, ACTION_TYPES.DOWNLOAD, ACTION_TYPES.DELETE]);
    });

    it('should omit an action listed in excludeActions (e.g. role-card excluding download since it duplicates view)', () => {
      component.excludeActions = [ACTION_TYPES.DOWNLOAD];
      fixture.detectChanges();

      const menu = fixture.debugElement.query(By.directive(ActionMenuComponent)).componentInstance as ActionMenuComponent;
      const keys = menu.actions.map(a => a.key);

      expect(keys).toEqual([ACTION_TYPES.VIEW, ACTION_TYPES.EDIT, ACTION_TYPES.DELETE]);
    });

    it('should omit multiple excluded actions (e.g. role-card excluding both download and edit)', () => {
      component.excludeActions = [ACTION_TYPES.DOWNLOAD, ACTION_TYPES.EDIT];
      fixture.detectChanges();

      const menu = fixture.debugElement.query(By.directive(ActionMenuComponent)).componentInstance as ActionMenuComponent;
      const keys = menu.actions.map(a => a.key);

      expect(keys).toEqual([ACTION_TYPES.VIEW, ACTION_TYPES.DELETE]);
    });
  });

  describe('ActionMenuComponent composition', () => {
    it('should pass view/download/delete ActionMenuItems to every rendered ActionMenuComponent', () => {
      const menus = fixture.debugElement.queryAll(By.directive(ActionMenuComponent));
      expect(menus.length).toBeGreaterThan(0);

      for (const menu of menus) {
        const instance = menu.componentInstance as ActionMenuComponent;
        const keys = instance.actions.map(a => a.key);
        expect(keys).toContain(ACTION_TYPES.VIEW);
        expect(keys).toContain(ACTION_TYPES.DOWNLOAD);
        expect(keys).toContain(ACTION_TYPES.DELETE);
      }
    });

    it('should list view before download before delete, matching the Figma menu order', () => {
      const menu = fixture.debugElement.query(By.directive(ActionMenuComponent)).componentInstance as ActionMenuComponent;
      const keys = menu.actions.map(a => a.key);

      expect(keys.indexOf(ACTION_TYPES.VIEW)).toBeLessThan(keys.indexOf(ACTION_TYPES.DOWNLOAD));
      expect(keys.indexOf(ACTION_TYPES.DOWNLOAD)).toBeLessThan(keys.indexOf(ACTION_TYPES.DELETE));
    });

    it('should call onView() when the "view" action\'s callback is invoked', () => {
      spyOn(component, 'onView');

      const menu = fixture.debugElement.query(By.directive(ActionMenuComponent)).componentInstance as ActionMenuComponent;
      const viewAction = menu.actions.find(a => a.key === ACTION_TYPES.VIEW);
      viewAction?.callback();

      expect(component.onView).toHaveBeenCalled();
    });

    it('should call onDownload() when the "download" action\'s callback is invoked', () => {
      const spy = jasmine.createSpy('download');
      component.download.subscribe(spy);

      const menu = fixture.debugElement.query(By.directive(ActionMenuComponent)).componentInstance as ActionMenuComponent;
      const downloadAction = menu.actions.find(a => a.key === ACTION_TYPES.DOWNLOAD);
      downloadAction?.callback();

      expect(spy).toHaveBeenCalledWith('doc-1');
    });

    it('should call onDelete() when the "delete" action\'s callback is invoked', () => {
      const spy = jasmine.createSpy('delete');
      component.delete.subscribe(spy);

      const menu = fixture.debugElement.query(By.directive(ActionMenuComponent)).componentInstance as ActionMenuComponent;
      const deleteAction = menu.actions.find(a => a.key === ACTION_TYPES.DELETE);
      deleteAction?.callback();

      expect(spy).toHaveBeenCalledWith('doc-1');
    });

    it('should call onEdit() when the "edit" action\'s callback is invoked', () => {
      const spy = jasmine.createSpy('edit');
      component.edit.subscribe(spy);

      const menu = fixture.debugElement.query(By.directive(ActionMenuComponent)).componentInstance as ActionMenuComponent;
      const editAction = menu.actions.find(a => a.key === ACTION_TYPES.EDIT);
      editAction?.callback();

      expect(spy).toHaveBeenCalledWith('doc-1');
    });
  });

  it('should delegate the document icon to DocumentHelper', () => {
    spyOn(DocumentHelper, 'getDocumentIcon').and.returnValue('/assets/icons/pdf-icon.svg');

    expect(component.getDocumentIcon()).toBe('/assets/icons/pdf-icon.svg');
    expect(DocumentHelper.getDocumentIcon).toHaveBeenCalledWith('application/pdf');
  });

  describe('formatSize', () => {
    it('should format zero bytes', () => {
      expect(component.formatSize(0)).toBe('0 Bytes');
    });

    it('should format bytes below 1KB', () => {
      expect(component.formatSize(512)).toBe('512 Bytes');
    });

    it('should format kilobytes', () => {
      expect(component.formatSize(1024)).toBe('1 KB');
    });

    it('should format megabytes rounded to 2 decimal places', () => {
      expect(component.formatSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });

    it('should format gigabytes', () => {
      expect(component.formatSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    // NOTE: this component's own formatSize() (Bytes/KB/MB/GB, rounded to 2dp) produces a
    // DIFFERENT output than DocumentHelper.formatFileSize() (MB/KB only, unrounded) for the
    // exact same input — a real, live cross-component formatting inconsistency. See
    // test-backfill-findings.md #53.
    it('documents the formatting inconsistency with DocumentHelper.formatFileSize for the same input', () => {
      const bytes = mockDocument.fileSize!;
      expect(component.formatSize(bytes)).toBe('2.5 MB');
      expect(DocumentHelper.formatFileSize(bytes)).toBe('2.5MB');
    });
  });
});
