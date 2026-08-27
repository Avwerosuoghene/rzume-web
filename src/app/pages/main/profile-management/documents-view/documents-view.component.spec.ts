import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DocumentsViewComponent } from './documents-view.component';
import { DocumentHelperService } from '../../../../core/services/document-helper.service';
import { ProfileManagementService } from '../../../../core/services/profile-management.service';
import { DialogHelperService } from '../../../../core/services/dialog-helper.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { SearchStateService } from '../../../../core/services/search-state.service';
import { DocumentItem } from '../../../../core/models/interface/profile.models';
import { DocumentHelper } from '../../../../core/helpers';
import { DOCUMENT_TYPES } from '../../../../core/models/constants/profile.constants';
import { IconStat } from '../../../../core/models/enums';
import { ConfirmedUploadEntry } from '../../../../components/confirm-upload-modal/confirm-upload-modal.component';

describe('DocumentsViewComponent', () => {
  let component: DocumentsViewComponent;
  let fixture: ComponentFixture<DocumentsViewComponent>;
  let documentHelperSpy: jasmine.SpyObj<DocumentHelperService>;
  let profileServiceSpy: jasmine.SpyObj<ProfileManagementService>;
  let dialogHelperSpy: jasmine.SpyObj<DialogHelperService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let loaderServiceSpy: jasmine.SpyObj<LoaderService>;
  let searchStateService: SearchStateService;

  const mockDoc: DocumentItem = {
    id: 'doc-1',
    fileName: 'resume.pdf',
    fileSize: 1024,
    fileType: 'application/pdf',
    uploadedAt: new Date('2026-01-01'),
    url: 'http://example.com/resume.pdf'
  };

  beforeEach(async () => {
    documentHelperSpy = jasmine.createSpyObj('DocumentHelperService', ['fetchResumes']);
    profileServiceSpy = jasmine.createSpyObj('ProfileManagementService', ['uploadResume', 'deleteResume']);
    dialogHelperSpy = jasmine.createSpyObj('DialogHelperService', ['openSuccessDialog', 'openDeleteConfirmation', 'openInfoDialog', 'openConfirmUploadDialog']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);

    await TestBed.configureTestingModule({
      imports: [DocumentsViewComponent, NoopAnimationsModule],
      providers: [
        { provide: DocumentHelperService, useValue: documentHelperSpy },
        { provide: ProfileManagementService, useValue: profileServiceSpy },
        { provide: DialogHelperService, useValue: dialogHelperSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        SearchStateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsViewComponent);
    component = fixture.componentInstance;
    component.documents = [mockDoc];
    component.uploadLimit = 2;
    searchStateService = TestBed.inject(SearchStateService);
    fixture.detectChanges();
  });

  afterEach(() => {
    searchStateService.clearSearchTerm();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onFilesSelected', () => {
    it('should do nothing when no files are provided', () => {
      component.onFilesSelected([]);
      expect(dialogHelperSpy.openConfirmUploadDialog).not.toHaveBeenCalled();
    });

    it('should show the limit-reached dialog instead of opening the confirm dialog when the limit is reached', () => {
      component.documents = [mockDoc, { ...mockDoc, id: 'doc-2' }];
      component.uploadLimit = 2;

      const file = new File(['content'], 'new.pdf', { type: 'application/pdf' });
      component.onFilesSelected([file]);

      expect(dialogHelperSpy.openInfoDialog).toHaveBeenCalled();
      expect(dialogHelperSpy.openConfirmUploadDialog).not.toHaveBeenCalled();
    });

    it('should open the confirm-upload dialog with every file that fits under the remaining limit (see test-backfill #54)', () => {
      component.documents = [];
      component.uploadLimit = 3;
      const file1 = new File(['a'], 'first.pdf', { type: 'application/pdf' });
      const file2 = new File(['b'], 'second.pdf', { type: 'application/pdf' });

      component.onFilesSelected([file1, file2]);

      expect(dialogHelperSpy.openConfirmUploadDialog).toHaveBeenCalledWith([file1, file2], jasmine.any(Function));
    });

    it('should only pass files up to the remaining limit to the confirm dialog, leaving the rest out (see test-backfill #54)', () => {
      component.documents = [mockDoc];
      component.uploadLimit = 2;
      const file1 = new File(['a'], 'first.pdf', { type: 'application/pdf' });
      const file2 = new File(['b'], 'second.pdf', { type: 'application/pdf' });

      component.onFilesSelected([file1, file2]);

      expect(dialogHelperSpy.openConfirmUploadDialog).toHaveBeenCalledWith([file1], jasmine.any(Function));
    });

    describe('after the confirm-upload dialog is confirmed', () => {
      function confirmWith(entries: ConfirmedUploadEntry[]) {
        dialogHelperSpy.openConfirmUploadDialog.and.callFake((_files: File[], onConfirm: (entries: ConfirmedUploadEntry[]) => void) => onConfirm(entries));
      }

      it('should upload every confirmed entry using its own chosen document type', () => {
        profileServiceSpy.uploadResume.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: mockDoc }));
        const file1 = new File(['a'], 'first.pdf', { type: 'application/pdf' });
        const file2 = new File(['b'], 'second.pdf', { type: 'application/pdf' });
        confirmWith([
          { file: file1, documentType: DOCUMENT_TYPES.RESUME },
          { file: file2, documentType: DOCUMENT_TYPES.COVER_LETTER }
        ]);

        component.onFilesSelected([file1, file2]);

        expect(profileServiceSpy.uploadResume).toHaveBeenCalledWith({ file: file1, type: DOCUMENT_TYPES.RESUME });
        expect(profileServiceSpy.uploadResume).toHaveBeenCalledWith({ file: file2, type: DOCUMENT_TYPES.COVER_LETTER });
      });

      it('should show a skipped-files message after the success dialog closes when more files were selected than remaining slots', () => {
        component.documents = [mockDoc];
        component.uploadLimit = 2;
        profileServiceSpy.uploadResume.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: mockDoc }));
        dialogHelperSpy.openSuccessDialog.and.callFake((_t: string, _m: string, onClosed?: () => void) => onClosed?.());
        const file1 = new File(['a'], 'first.pdf', { type: 'application/pdf' });
        const file2 = new File(['b'], 'second.pdf', { type: 'application/pdf' });
        confirmWith([{ file: file1, documentType: DOCUMENT_TYPES.RESUME }]);

        component.onFilesSelected([file1, file2]);

        expect(dialogHelperSpy.openInfoDialog).toHaveBeenCalledWith(IconStat.warn, jasmine.any(String));
      });

      it('should NOT show a skipped-files message when every selected file fits under the limit', () => {
        component.documents = [];
        component.uploadLimit = 3;
        profileServiceSpy.uploadResume.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: mockDoc }));
        dialogHelperSpy.openSuccessDialog.and.callFake((_t: string, _m: string, onClosed?: () => void) => onClosed?.());
        const file = new File(['a'], 'first.pdf', { type: 'application/pdf' });
        confirmWith([{ file, documentType: DOCUMENT_TYPES.RESUME }]);

        component.onFilesSelected([file]);

        expect(dialogHelperSpy.openInfoDialog).not.toHaveBeenCalled();
      });

      it('should set isUploading during the upload and reset it once complete', () => {
        profileServiceSpy.uploadResume.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: mockDoc }));
        const file = new File(['a'], 'first.pdf', { type: 'application/pdf' });
        confirmWith([{ file, documentType: DOCUMENT_TYPES.RESUME }]);

        component.onFilesSelected([file]);

        expect(component.isUploading).toBe(false);
      });

      it('should show a success dialog and refresh resumes after a successful upload', () => {
        profileServiceSpy.uploadResume.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: mockDoc }));
        const file = new File(['a'], 'first.pdf', { type: 'application/pdf' });
        confirmWith([{ file, documentType: DOCUMENT_TYPES.RESUME }]);

        component.onFilesSelected([file]);

        expect(dialogHelperSpy.openSuccessDialog).toHaveBeenCalled();
        expect(documentHelperSpy.fetchResumes).toHaveBeenCalled();
      });

      it('should not show a success dialog when the upload response reports failure', () => {
        profileServiceSpy.uploadResume.and.returnValue(of({ success: false, statusCode: 400, message: 'failed', data: undefined as unknown as DocumentItem }));
        const file = new File(['a'], 'first.pdf', { type: 'application/pdf' });
        confirmWith([{ file, documentType: DOCUMENT_TYPES.RESUME }]);

        component.onFilesSelected([file]);

        expect(dialogHelperSpy.openSuccessDialog).not.toHaveBeenCalled();
        expect(documentHelperSpy.fetchResumes).not.toHaveBeenCalled();
      });
    });
  });

  describe('onDeleteDocument', () => {
    it('should do nothing when the document id is not found', () => {
      component.onDeleteDocument('missing-id');
      expect(dialogHelperSpy.openDeleteConfirmation).not.toHaveBeenCalled();
    });

    it('should open a delete confirmation for a known document', () => {
      component.onDeleteDocument('doc-1');
      expect(dialogHelperSpy.openDeleteConfirmation).toHaveBeenCalledWith(
        [mockDoc] as unknown as Parameters<typeof dialogHelperSpy.openDeleteConfirmation>[0],
        jasmine.any(Function),
        jasmine.any(String)
      );
    });

    it('should delete the document, refresh, and show a success dialog on confirm', () => {
      profileServiceSpy.deleteResume.and.returnValue(of({ success: true, statusCode: 200, message: 'ok', data: true }));

      component.onDeleteDocument('doc-1');
      const onConfirm = dialogHelperSpy.openDeleteConfirmation.calls.mostRecent().args[1];
      onConfirm();

      expect(loaderServiceSpy.showLoader).toHaveBeenCalled();
      expect(loaderServiceSpy.hideLoader).toHaveBeenCalled();
      expect(dialogHelperSpy.openSuccessDialog).toHaveBeenCalled();
    });

    it('should not show a success dialog when the delete response reports failure', () => {
      profileServiceSpy.deleteResume.and.returnValue(of({ success: false, statusCode: 400, message: 'failed', data: false }));

      component.onDeleteDocument('doc-1');
      const onConfirm = dialogHelperSpy.openDeleteConfirmation.calls.mostRecent().args[1];
      onConfirm();

      expect(dialogHelperSpy.openSuccessDialog).not.toHaveBeenCalled();
    });
  });

  describe('onDownloadDocument', () => {
    it('should do nothing when the document id is not found', () => {
      spyOn(DocumentHelper, 'downloadDocument');
      component.onDownloadDocument('missing-id');
      expect(DocumentHelper.downloadDocument).not.toHaveBeenCalled();
      expect(snackBarSpy.open).not.toHaveBeenCalled();
    });

    it('should show a snackbar and trigger the download for a known document', () => {
      spyOn(DocumentHelper, 'downloadDocument');

      component.onDownloadDocument('doc-1');

      expect(snackBarSpy.open).toHaveBeenCalled();
      expect(DocumentHelper.downloadDocument).toHaveBeenCalledWith(mockDoc.url, mockDoc.fileName);
    });

    it('should use downloadUrl instead of url when the document has a separate download link', () => {
      spyOn(DocumentHelper, 'downloadDocument');
      const docWithDownloadUrl: DocumentItem = {
        ...mockDoc,
        id: 'doc-2',
        url: 'http://example.com/inline/resume.pdf',
        downloadUrl: 'http://example.com/attachment/resume.pdf'
      };
      component.documents = [docWithDownloadUrl];

      component.onDownloadDocument('doc-2');

      expect(DocumentHelper.downloadDocument).toHaveBeenCalledWith(docWithDownloadUrl.downloadUrl!, docWithDownloadUrl.fileName);
    });
  });

  describe('isUploadLimitReached', () => {
    it('should be false when below the limit', () => {
      component.documents = [mockDoc];
      component.uploadLimit = 2;
      expect(component.isUploadLimitReached).toBe(false);
    });

    it('should be true when at the limit', () => {
      component.documents = [mockDoc, { ...mockDoc, id: 'doc-2' }];
      component.uploadLimit = 2;
      expect(component.isUploadLimitReached).toBe(true);
    });
  });

  it('trackByDocId should return the document id', () => {
    expect(component.trackByDocId(0, mockDoc)).toBe('doc-1');
  });

  describe('search (page-aware search bar — see global-search plan)', () => {
    const resume: DocumentItem = { ...mockDoc, id: 'd1', fileName: 'resume.pdf' };
    const coverLetter: DocumentItem = { ...mockDoc, id: 'd2', fileName: 'cover-letter.pdf' };
    const certificate: DocumentItem = { ...mockDoc, id: 'd3', fileName: 'certificate.pdf' };

    beforeEach(() => {
      component.documents = [resume, coverLetter, certificate];
      fixture.detectChanges();
    });

    it('should show every document when the search term is empty', () => {
      expect(component.filteredDocuments).toEqual([resume, coverLetter, certificate]);
    });

    it('should filter documents by filename, case-insensitively, when the search term changes', () => {
      searchStateService.updateSearchTerm('COVER');
      fixture.detectChanges();

      expect(component.filteredDocuments).toEqual([coverLetter]);
    });

    it('should show every document again once the search term is cleared', () => {
      searchStateService.updateSearchTerm('cover');
      fixture.detectChanges();
      searchStateService.updateSearchTerm('');
      fixture.detectChanges();

      expect(component.filteredDocuments).toEqual([resume, coverLetter, certificate]);
    });

    it('should render one app-document-item per filtered document, not per document', () => {
      searchStateService.updateSearchTerm('resume');
      fixture.detectChanges();

      const items = fixture.nativeElement.querySelectorAll('app-document-item');
      expect(items).toHaveSize(1);
    });

    it('should show a "no documents match your search" message when the term matches nothing', () => {
      searchStateService.updateSearchTerm('nonexistent file name');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('No documents match your search');
    });

    it('should call searchStateService.updateSearchTerm when the desktop search box emits', () => {
      spyOn(searchStateService, 'updateSearchTerm');
      component.onSearchChange('resume');

      expect(searchStateService.updateSearchTerm).toHaveBeenCalledWith('resume');
    });
  });
});
