import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RoleCardComponent } from './role-card.component';
import { DocumentItemComponent } from '../../pages/main/profile-management/document-item/document-item.component';
import { Role, RoleDocument } from '../../core/models/interface/role.models';

describe('RoleCardComponent', () => {
  let component: RoleCardComponent;
  let fixture: ComponentFixture<RoleCardComponent>;

  const document = (id: string): RoleDocument => ({
    id,
    fileName: `resume-${id}.pdf`,
    fileSize: 1024,
    fileType: 'application/pdf',
    documentUrl: `https://example.com/${id}.pdf`,
    uploadedAt: new Date()
  });

  const role = (documents: RoleDocument[] = []): Role => ({
    id: 'role-1',
    title: 'UIUX Designer',
    industryName: 'Technology',
    documents,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleCardComponent);
    component = fixture.componentInstance;
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

  it('should render one DocumentItemComponent per document on the role', () => {
    component.role = role([document('1'), document('2')]);
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.directive(DocumentItemComponent));
    expect(items).toHaveSize(2);
  });

  it('should map RoleDocument.documentUrl to DocumentItem.url (backend/frontend field names differ, see roles-api-gap)', () => {
    const doc = document('1');
    const mapped = component.toDocumentItem(doc);

    expect(mapped.url).toBe(doc.documentUrl);
  });

  it('should not render any actions menu (edit/delete are deferred to a later pass)', () => {
    component.role = role();
    fixture.detectChanges();

    const menuTrigger = fixture.nativeElement.querySelector('[mat-icon-button], [matMenuTriggerFor], mat-menu');
    expect(menuTrigger).toBeNull();
  });
});
