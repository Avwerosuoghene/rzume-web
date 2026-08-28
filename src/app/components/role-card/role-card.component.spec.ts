import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { RoleCardComponent } from './role-card.component';
import { DocumentItemComponent } from '../../pages/main/profile-management/document-item/document-item.component';
import { Role } from '../../core/models/interface/role.models';
import { AttachedDocument } from '../../core/models/interface/profile.models';
import { ACTION_TYPES } from '../../core/models';

describe('RoleCardComponent', () => {
  let component: RoleCardComponent;
  let fixture: ComponentFixture<RoleCardComponent>;

  const document = (id: string): AttachedDocument => ({
    id,
    resumeId: `resume-${id}`,
    fileName: `resume-${id}.pdf`,
    fileSize: 1024,
    fileType: 'application/pdf',
    documentType: 'Resume',
    documentUrl: `https://example.com/${id}.pdf`,
    uploadedAt: new Date()
  });

  const role = (documents: AttachedDocument[] = []): Role => ({
    id: 'role-1',
    title: 'UIUX Designer',
    industryName: 'Technology',
    documents,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleCardComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleCardComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    component.role = role();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the role title when role$ has data', () => {
    component.role = role();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('UIUX Designer');
  });

  it('should render the role industry', () => {
    component.role = role();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Technology');
  });

  it('should render one DocumentItemComponent per document on the role, once expanded', () => {
    component.role = role([document('1'), document('2')]);
    component.isExpanded = true;
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.directive(DocumentItemComponent));
    expect(items).toHaveSize(2);
  });

  it('should always show the kebab-menu actions variant, not the desktop icon pair, per Figma (node 1314:2681)', () => {
    component.role = role([document('1')]);
    component.isExpanded = true;
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.directive(DocumentItemComponent));
    expect(items[0].componentInstance.actionsVariant).toBe('menu');
  });

  it('should lay documents out side by side in a row when there are multiple and the card has room, per Figma (node 1314:2933) — not stacked full-width', () => {
    component.role = role([document('1'), document('2')]);
    component.isExpanded = true;
    // Karma's default headless window is ~756px, giving .role-card-documents only ~706px of
    // content width after the card's own padding — too narrow for two 400px-min-width cards plus
    // the 30px gap (830px) to fit on one row. Widen the host element to a realistic desktop width
    // so this test reflects "there's room" rather than an artifact of the test runner's viewport.
    (fixture.nativeElement as HTMLElement).style.width = '1000px';
    (fixture.nativeElement as HTMLElement).style.display = 'block';
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.directive(DocumentItemComponent));
    expect(items).toHaveSize(2);

    const firstTop = (items[0].nativeElement as HTMLElement).getBoundingClientRect().top;
    const secondTop = (items[1].nativeElement as HTMLElement).getBoundingClientRect().top;
    expect(firstTop).toBe(secondTop);
  });

  it('should wrap even just 2 documents onto separate rows once the card is too narrow for both 400px-min-width cards to fit side by side', () => {
    component.role = role([document('1'), document('2')]);
    component.isExpanded = true;
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.directive(DocumentItemComponent));
    const firstTop = (items[0].nativeElement as HTMLElement).getBoundingClientRect().top;
    const secondTop = (items[1].nativeElement as HTMLElement).getBoundingClientRect().top;
    expect(firstTop).not.toBe(secondTop);
  });

  it('should wrap documents onto additional rows once there are more than fit on one line (the 2-document cap was removed, so a role can have any number attached)', () => {
    const documents = Array.from({ length: 6 }, (_, i) => document(`${i + 1}`));
    component.role = role(documents);
    component.isExpanded = true;
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.directive(DocumentItemComponent));
    expect(items).toHaveSize(6);

    const tops = items.map(item => (item.nativeElement as HTMLElement).getBoundingClientRect().top);
    const distinctTops = new Set(tops);
    expect(distinctTops.size).toBeGreaterThan(1);
  });

  it('should pass a tighter filename truncate limit than DocumentItemComponent\'s own default, since this card is far narrower than Profile Management\'s full-width list', () => {
    component.role = role([document('1')]);
    component.isExpanded = true;
    fixture.detectChanges();

    const item = fixture.debugElement.query(By.directive(DocumentItemComponent)).componentInstance as DocumentItemComponent;
    expect(item.filenameTruncateLimit).toBe(18);
    expect(item.filenameTruncateLimit).toBeLessThan(30);
  });

  it('should give each document card an explicit min-width — a real floor (not 0) for the icon/text/menu to stay comfortable — with no max-width ceiling so it can keep growing to fill the row', () => {
    component.role = role([document('1')]);
    component.isExpanded = true;
    fixture.detectChanges();

    const item = fixture.debugElement.query(By.directive(DocumentItemComponent)).nativeElement as HTMLElement;
    const style = getComputedStyle(item);

    expect(style.minWidth).toBe('400px');
    expect(style.maxWidth).toBe('none');
  });

  it('should let the role card scroll horizontally rather than break layout if content ever exceeds its width', () => {
    component.role = role([document('1')]);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.role-card') as HTMLElement;
    const style = getComputedStyle(card);

    expect(style.overflowX).toBe('auto');
  });

  it('should map RoleDocument.documentUrl to DocumentItem.url (backend/frontend field names differ, see roles-api-gap)', () => {
    const doc = document('1');
    const mapped = component.toDocumentItem(doc);

    expect(mapped.url).toBe(doc.documentUrl);
  });

  it('should exclude download and edit from the document action menu (view already gets the user to the file; editing a document is a Documents-tab-only, library-management action — see plan-update-document-type)', () => {
    component.role = role([document('1')]);
    component.isExpanded = true;
    fixture.detectChanges();

    const item = fixture.debugElement.query(By.directive(DocumentItemComponent)).componentInstance as DocumentItemComponent;
    const keys = item.documentActions.map(a => a.key);

    expect(keys).not.toContain(ACTION_TYPES.DOWNLOAD);
    expect(keys).not.toContain(ACTION_TYPES.EDIT);
    expect(keys).toEqual([ACTION_TYPES.VIEW, ACTION_TYPES.DELETE]);
  });

  describe('onDeleteDocument', () => {
    it('should emit deleteDocument with the role and the document id', () => {
      const testRole = role([document('1')]);
      component.role = testRole;
      fixture.detectChanges();

      let emitted: { role: Role; documentId: string } | undefined;
      component.deleteDocument.subscribe(e => (emitted = e));

      component.onDeleteDocument('1');

      expect(emitted).toEqual({ role: testRole, documentId: '1' });
    });

    it('should call onDeleteDocument when DocumentItemComponent emits (delete)', () => {
      component.role = role([document('1')]);
      component.isExpanded = true;
      fixture.detectChanges();
      spyOn(component, 'onDeleteDocument');

      const item = fixture.debugElement.query(By.directive(DocumentItemComponent)).componentInstance as DocumentItemComponent;
      item.delete.emit('1');

      expect(component.onDeleteDocument).toHaveBeenCalledWith('1');
    });
  });

  describe('expand/collapse', () => {
    it('should be collapsed by default, showing the two-line summary and hiding the documents list', () => {
      component.role = role([document('1'), document('2')]);
      fixture.detectChanges();

      expect(component.isExpanded).toBe(false);
      expect(fixture.nativeElement.querySelector('.role-card-documents')).toBeFalsy();

      const summary = fixture.nativeElement.querySelector('.role-card-heading--collapsed') as HTMLElement;
      expect(summary).toBeTruthy();
      expect(summary.textContent).toContain('UIUX Designer');
      expect(summary.textContent).toContain('Technology');
      expect(summary.textContent).toContain('2 documents');
    });

    it('should place the title on its own line, with industry and document count sharing the line below it', () => {
      component.role = role([document('1'), document('2')]);
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('.role-card-heading--collapsed .role-card-title') as HTMLElement;
      const industryCount = fixture.nativeElement.querySelector('.role-card-heading--collapsed .role-card-industry-count') as HTMLElement;
      expect(title.getBoundingClientRect().top).not.toBe(industryCount.getBoundingClientRect().top);

      const industry = industryCount.querySelector('.role-card-industry') as HTMLElement;
      const count = industryCount.querySelector('.role-card-document-count') as HTMLElement;
      expect(industry.getBoundingClientRect().top).toBe(count.getBoundingClientRect().top);
    });

    it('should show a singular "1 document" label when the role has exactly one document', () => {
      component.role = role([document('1')]);
      fixture.detectChanges();

      const summary = fixture.nativeElement.querySelector('.role-card-heading--collapsed') as HTMLElement;
      expect(summary.textContent).toContain('1 document');
      expect(summary.textContent).not.toContain('1 documents');
    });

    it('should expand to show the full heading and documents list when the toggle is clicked, and not toggle from clicking the summary text itself', () => {
      component.role = role([document('1')]);
      fixture.detectChanges();

      const summary = fixture.nativeElement.querySelector('.role-card-heading--collapsed') as HTMLElement;
      summary.click();
      fixture.detectChanges();
      expect(component.isExpanded).toBe(false);

      const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.role-card-toggle');
      toggle.click();
      fixture.detectChanges();

      expect(component.isExpanded).toBe(true);
      expect(fixture.nativeElement.querySelector('.role-card-documents')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.role-card-heading--collapsed')).toBeFalsy();
    });

    it('should toggle back to collapsed, hiding the documents list again, on a second click', fakeAsync(() => {
      component.role = role([document('1')]);
      fixture.detectChanges();

      const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.role-card-toggle');
      toggle.click();
      fixture.detectChanges();
      toggle.click();
      fixture.detectChanges();
      // The documents list carries the :leave collapse animation — even under
      // NoopAnimationsModule, Angular defers actually removing the element from the DOM until
      // that (instant, but still async) transition resolves, so a tick is needed before it's
      // gone.
      tick();
      fixture.detectChanges();

      expect(component.isExpanded).toBe(false);
      expect(fixture.nativeElement.querySelector('.role-card-documents')).toBeFalsy();
    }));
  });

  describe('actions menu (see feature-spec-delete-role)', () => {
    // mat-menu-item's rendered text includes the mat-icon ligature text (e.g. "edit") concatenated
    // with the visible label span, so an exact-match {text} harness filter doesn't hit — find by
    // substring instead, same reason job-card-item's equivalent menu would need this too.
    async function findMenuItem(menu: MatMenuHarness, label: string) {
      const items = await menu.getItems();
      const texts = await Promise.all(items.map(item => item.getText()));
      const index = texts.findIndex(text => text.includes(label));
      return items[index];
    }

    it('should render a kebab menu trigger on the role card', async () => {
      component.role = role();
      fixture.detectChanges();

      const menu = await loader.getHarness(MatMenuHarness);
      expect(menu).toBeTruthy();
    });

    it('should emit editRole with the role when "Edit Role" is clicked', async () => {
      const testRole = role();
      component.role = testRole;
      fixture.detectChanges();

      let emitted: Role | undefined;
      component.editRole.subscribe(r => (emitted = r));

      const menu = await loader.getHarness(MatMenuHarness);
      await menu.open();
      const editItem = await findMenuItem(menu, 'Edit Role');
      await editItem.click();

      expect(emitted).toBe(testRole);
    });

    it('should emit delete with the role when "Remove Role" is clicked', async () => {
      const testRole = role();
      component.role = testRole;
      fixture.detectChanges();

      let emitted: Role | undefined;
      component.delete.subscribe(r => (emitted = r));

      const menu = await loader.getHarness(MatMenuHarness);
      await menu.open();
      const removeItem = await findMenuItem(menu, 'Remove Role');
      await removeItem.click();

      expect(emitted).toBe(testRole);
    });
  });
});
