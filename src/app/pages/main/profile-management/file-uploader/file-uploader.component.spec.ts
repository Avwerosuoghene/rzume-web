import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploaderComponent } from './file-uploader.component';

describe('FileUploaderComponent', () => {
  let component: FileUploaderComponent;
  let fixture: ComponentFixture<FileUploaderComponent>;

  const pdfFile = new File(['a'], 'resume.pdf', { type: 'application/pdf' });
  const docxFile = new File(['a'], 'resume.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  const imageFile = new File(['a'], 'photo.png', { type: 'image/png' });

  function makeDragEvent(type: string, files: File[]): DragEvent {
    const dataTransfer = new DataTransfer();
    files.forEach(f => dataTransfer.items.add(f));
    return new DragEvent(type, { dataTransfer });
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('drag state', () => {
    it('should set isDragging true on dragover', () => {
      component.onDragOver(makeDragEvent('dragover', []));
      expect(component.isDragging).toBe(true);
    });

    it('should set isDragging false on dragleave', () => {
      component.onDragOver(makeDragEvent('dragover', []));
      component.onDragLeave(makeDragEvent('dragleave', []));
      expect(component.isDragging).toBe(false);
    });

    it('should reset isDragging false on drop', () => {
      component.onDragOver(makeDragEvent('dragover', []));
      component.onDrop(makeDragEvent('drop', [pdfFile]));
      expect(component.isDragging).toBe(false);
    });
  });

  describe('file validation', () => {
    it('should emit only valid files, filtering out disallowed types', () => {
      const spy = jasmine.createSpy('filesSelected');
      component.filesSelected.subscribe(spy);

      component.onDrop(makeDragEvent('drop', [pdfFile, imageFile]));

      expect(spy).toHaveBeenCalledWith([pdfFile]);
    });

    it('should not emit anything when every dropped file is invalid, with no rejection feedback', () => {
      const spy = jasmine.createSpy('filesSelected');
      component.filesSelected.subscribe(spy);

      component.onDrop(makeDragEvent('drop', [imageFile]));

      expect(spy).not.toHaveBeenCalled();
    });

    it('should reject a file that exceeds the configured max size', () => {
      component.maxFileSize = 0;
      const spy = jasmine.createSpy('filesSelected');
      component.filesSelected.subscribe(spy);

      component.onDrop(makeDragEvent('drop', [pdfFile]));

      expect(spy).not.toHaveBeenCalled();
    });

    it('should accept a second allowed type when configured', () => {
      const spy = jasmine.createSpy('filesSelected');
      component.filesSelected.subscribe(spy);

      component.onDrop(makeDragEvent('drop', [docxFile]));

      expect(spy).toHaveBeenCalledWith([docxFile]);
    });
  });

  describe('onFileSelected (native input change)', () => {
    it('should emit valid files chosen via the file input', () => {
      const spy = jasmine.createSpy('filesSelected');
      component.filesSelected.subscribe(spy);

      const input = document.createElement('input');
      input.type = 'file';
      spyOnProperty(input, 'files', 'get').and.returnValue({
        0: pdfFile,
        length: 1,
        item: (i: number) => (i === 0 ? pdfFile : null),
        [Symbol.iterator]: function* () { yield pdfFile; }
      } as unknown as FileList);

      component.onFileSelected({ target: input } as unknown as Event);

      expect(spy).toHaveBeenCalledWith([pdfFile]);
    });
  });

  describe('fileRestrictionsText', () => {
    it('should describe the allowed types and max size', () => {
      component.allowedFileTypes = ['application/pdf'];
      component.maxFileSize = 2 * 1024 * 1024;

      expect(component.fileRestrictionsText).toBe('PDF only (max. 2MB)');
    });
  });
});
