import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmUploadModalComponent, ConfirmUploadModalData } from './confirm-upload-modal.component';
import { DialogCloseStatus } from '../../core/models';
import { DOCUMENT_TYPES } from '../../core/models/constants/profile.constants';

describe('ConfirmUploadModalComponent', () => {
  let component: ConfirmUploadModalComponent;
  let fixture: ComponentFixture<ConfirmUploadModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmUploadModalComponent>>;

  const file1 = new File(['a'], 'resume.pdf', { type: 'application/pdf' });
  const file2 = new File(['b'], 'cover-letter.pdf', { type: 'application/pdf' });

  const mockData: ConfirmUploadModalData = { files: [file1, file2] };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ConfirmUploadModalComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build one entry per file, defaulting each to DOCUMENT_TYPES.RESUME', () => {
    expect(component.entries).toEqual([
      { file: file1, documentType: DOCUMENT_TYPES.RESUME },
      { file: file2, documentType: DOCUMENT_TYPES.RESUME }
    ]);
  });

  it('should render the file name for every selected file', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('resume.pdf');
    expect(text).toContain('cover-letter.pdf');
  });

  it('should render a document type dropdown for every selected file', () => {
    const selects = fixture.nativeElement.querySelectorAll('mat-select, select');
    expect(selects.length).toBe(2);
  });

  it('should close the dialog with a Cancelled status and null data on onCancel()', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ status: DialogCloseStatus.Cancelled, data: null });
  });

  it('should close the dialog with a Submitted status and the current entries (including any per-file document type changes) on onConfirm()', () => {
    component.entries = [
      { file: file1, documentType: DOCUMENT_TYPES.RESUME },
      { file: file2, documentType: DOCUMENT_TYPES.COVER_LETTER }
    ];

    component.onConfirm();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      status: DialogCloseStatus.Submitted,
      data: component.entries
    });
  });

  describe('subtitleText (see feedback: singular wording should not assume multiple files)', () => {
    it('should reference "this file" when exactly one file is selected', () => {
      component.entries = [{ file: file1, documentType: DOCUMENT_TYPES.RESUME }];
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.modal-message').textContent).toContain('this file');
    });

    it('should reference "each file" when multiple files are selected', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.modal-message').textContent).toContain('each file');
    });
  });

  describe('confirmButtonLabel', () => {
    it('should read "Upload" for a single file', () => {
      component.entries = [{ file: file1, documentType: DOCUMENT_TYPES.RESUME }];
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.upload-button').textContent.trim()).toBe('Upload');
    });

    it('should read "Upload All" for multiple files', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.upload-button').textContent.trim()).toBe('Upload All');
    });
  });
});
