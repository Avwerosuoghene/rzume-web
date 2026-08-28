import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EditDocumentModalComponent, EditDocumentModalData } from './edit-document-modal.component';
import { DialogCloseStatus } from '../../core/models';
import { DocumentItem } from '../../core/models/interface/profile.models';
import { DOCUMENT_TYPES } from '../../core/models/constants/profile.constants';

describe('EditDocumentModalComponent', () => {
  let component: EditDocumentModalComponent;
  let fixture: ComponentFixture<EditDocumentModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EditDocumentModalComponent>>;

  const mockDocument: DocumentItem = {
    id: 'doc-1',
    fileName: 'resume.pdf',
    fileSize: 1024,
    fileType: 'application/pdf',
    documentType: DOCUMENT_TYPES.RESUME,
    uploadedAt: new Date('2026-01-01'),
    url: 'http://example.com/resume.pdf'
  };

  const mockData: EditDocumentModalData = { document: mockDocument };

  function setup(data: EditDocumentModalData) {
    TestBed.resetTestingModule();
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [EditDocumentModalComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: data }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditDocumentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => setup(mockData));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the name field from the filename, without its extension', () => {
    expect(component.name).toBe('resume');
  });

  it('should expose the extension separately, unchanged, for read-only display', () => {
    expect(component.extension).toBe('.pdf');
  });

  it('should handle a filename with no extension at all', () => {
    setup({ document: { ...mockDocument, fileName: 'README' } });

    expect(component.name).toBe('README');
    expect(component.extension).toBe('');
  });

  it('should handle a filename with multiple dots, splitting only on the last one (matches the backend\'s Path.GetExtension)', () => {
    setup({ document: { ...mockDocument, fileName: 'my.resume.v2.pdf' } });

    expect(component.name).toBe('my.resume.v2');
    expect(component.extension).toBe('.pdf');
  });

  it('should initialize documentType from the document, defaulting to RESUME when it has none', () => {
    setup({ document: { ...mockDocument, documentType: null } });

    expect(component.documentType).toBe(DOCUMENT_TYPES.RESUME);
  });

  it('should populate documentTypeOptions from DOCUMENT_TYPE_LABELS', () => {
    expect(component.documentTypeOptions.map(([key]) => key)).toEqual(
      jasmine.arrayContaining([DOCUMENT_TYPES.RESUME, DOCUMENT_TYPES.COVER_LETTER, DOCUMENT_TYPES.CERTIFICATE, DOCUMENT_TYPES.OTHER])
    );
  });

  describe('validation', () => {
    it('should be valid when the name is non-empty', () => {
      component.name = 'my-resume';
      expect(component.isNameValid).toBe(true);
    });

    it('should be invalid when the name is empty or whitespace-only', () => {
      component.name = '   ';
      expect(component.isNameValid).toBe(false);
    });
  });

  describe('onCancel', () => {
    it('should close the dialog with a Cancelled status and null data', () => {
      component.onCancel();

      expect(dialogRefSpy.close).toHaveBeenCalledWith({ status: DialogCloseStatus.Cancelled, data: null });
    });
  });

  describe('onSave', () => {
    it('should close the dialog with the trimmed name (no extension — matches the backend\'s FileName contract) and selected type', () => {
      component.name = '  updated-resume  ';
      component.documentType = DOCUMENT_TYPES.COVER_LETTER;

      component.onSave();

      expect(dialogRefSpy.close).toHaveBeenCalledWith({
        status: DialogCloseStatus.Submitted,
        data: { fileName: 'updated-resume', documentType: DOCUMENT_TYPES.COVER_LETTER }
      });
    });

    it('should not close the dialog when the name is empty or whitespace-only', () => {
      component.name = '   ';

      component.onSave();

      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });
  });
});
