import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentItemComponent } from './document-item.component';
import { DocumentItem } from '../../../../core/models';
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

  it('should emit the document id on delete', () => {
    const spy = jasmine.createSpy('delete');
    component.delete.subscribe(spy);

    component.onDelete();

    expect(spy).toHaveBeenCalledWith('doc-1');
  });

  it('should emit the document id on download', () => {
    const spy = jasmine.createSpy('download');
    component.download.subscribe(spy);

    component.onDownload();

    expect(spy).toHaveBeenCalledWith('doc-1');
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
