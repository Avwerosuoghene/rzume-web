import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JobApplicationDocumentPickerComponent } from './job-application-document-picker.component';
import { Resume } from '../../core/models/interface/profile.models';
import { JobApplicationDocumentRequestItem } from '../../core/models/interface/job-application.models';
import { DOCUMENT_TYPES } from '../../core/models/constants/profile.constants';

describe('JobApplicationDocumentPickerComponent', () => {
  let component: JobApplicationDocumentPickerComponent;
  let fixture: ComponentFixture<JobApplicationDocumentPickerComponent>;

  const resume1: Resume = { id: 'r1', fileName: 'resume.pdf', uploadedAt: new Date(), url: 'http://example.com/r1.pdf' };
  const resume2: Resume = { id: 'r2', fileName: 'cover-letter.pdf', uploadedAt: new Date(), url: 'http://example.com/r2.pdf' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobApplicationDocumentPickerComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(JobApplicationDocumentPickerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('trigger', () => {
    it('should show "Select documents" when nothing is selected', () => {
      fixture.detectChanges();

      const trigger: HTMLElement = fixture.nativeElement.querySelector('.multiselect-trigger');
      expect(trigger.textContent).toContain('Select documents');
    });

    it('should show the selected count once documents are selected', () => {
      component.availableResumes = [resume1, resume2];
      fixture.detectChanges();
      component.toggle(resume1);
      component.toggle(resume2);
      fixture.detectChanges();

      const trigger: HTMLElement = fixture.nativeElement.querySelector('.multiselect-trigger');
      expect(trigger.textContent).toContain('2 documents selected');
    });
  });

  describe('dropdown', () => {
    it('should toggle open and closed', () => {
      fixture.detectChanges();

      component.toggleDropdown();
      expect(component.isDropdownOpen).toBe(true);

      component.toggleDropdown();
      expect(component.isDropdownOpen).toBe(false);
    });

    it('should clear the search query when it closes', () => {
      fixture.detectChanges();
      component.toggleDropdown();
      component.documentSearchQuery = 'resume';

      component.toggleDropdown();

      expect(component.documentSearchQuery).toBe('');
    });

    it('should render the options panel via CDK Overlay, not nested inside this component, so a scrollable parent cannot clip it', () => {
      component.availableResumes = [resume1];
      fixture.detectChanges();

      component.toggleDropdown();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.multiselect-panel')).toBeNull();
      expect(document.querySelector('.cdk-overlay-container .multiselect-panel')).not.toBeNull();
    });
  });

  describe('search filtering', () => {
    it('should return all resumes when there is no search query', () => {
      component.availableResumes = [resume1, resume2];
      fixture.detectChanges();

      expect(component.filteredResumes).toEqual([resume1, resume2]);
    });

    it('should filter resumes by file name, case-insensitively', () => {
      component.availableResumes = [resume1, resume2];
      fixture.detectChanges();

      component.documentSearchQuery = 'COVER';

      expect(component.filteredResumes).toEqual([resume2]);
    });
  });

  describe('selection', () => {
    beforeEach(() => {
      component.availableResumes = [resume1, resume2];
      fixture.detectChanges();
    });

    it('should select a resume that is not yet selected, defaulting its type to DOCUMENT_TYPES.RESUME when the resume has no documentType of its own', () => {
      component.toggle(resume1);

      expect(component.isSelected('r1')).toBe(true);
      expect(component.entries).toEqual([{ resumeId: 'r1', documentType: DOCUMENT_TYPES.RESUME }]);
    });

    it('should default a manually-selected resume\'s type to its own documentType when it has one (e.g. a role-scoped document)', () => {
      const coverLetterResume: Resume = { ...resume2, documentType: DOCUMENT_TYPES.COVER_LETTER };
      component.availableResumes = [resume1, coverLetterResume];

      component.toggle(coverLetterResume);

      expect(component.entries).toEqual([{ resumeId: 'r2', documentType: DOCUMENT_TYPES.COVER_LETTER }]);
    });

    it('should deselect an already-selected resume', () => {
      component.toggle(resume1);
      component.toggle(resume1);

      expect(component.isSelected('r1')).toBe(false);
    });

    it('should emit documentsChange with the current entries whenever selection changes', () => {
      const emitted: JobApplicationDocumentRequestItem[][] = [];
      component.documentsChange.subscribe(v => emitted.push(v));

      component.toggle(resume1);

      expect(emitted).toEqual([[{ resumeId: 'r1', documentType: DOCUMENT_TYPES.RESUME }]]);
    });

    it('should pre-check resumes matching preSuggestedDocuments, with the pre-suggested documentType', () => {
      component.preSuggestedDocuments = [{ resumeId: 'r1', documentType: DOCUMENT_TYPES.COVER_LETTER }];

      expect(component.isSelected('r1')).toBe(true);
      expect(component.entries.find(e => e.resumeId === 'r1')?.documentType).toBe(DOCUMENT_TYPES.COVER_LETTER);
    });
  });

  describe('selected document preview', () => {
    beforeEach(() => {
      component.availableResumes = [resume1, resume2];
      fixture.detectChanges();
    });

    it('should render one preview card per selected document, showing the resume\'s file name', () => {
      component.toggle(resume1);
      fixture.detectChanges();

      const cards = fixture.nativeElement.querySelectorAll('.document-card');
      expect(cards.length).toBe(1);
      expect(cards[0].textContent).toContain('resume.pdf');
    });

    it('should render no preview cards when nothing is selected', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.document-card').length).toBe(0);
    });

    it('should update an entry\'s documentType and re-emit when changed from the preview card', () => {
      component.toggle(resume1);
      const emitted: JobApplicationDocumentRequestItem[][] = [];
      component.documentsChange.subscribe(v => emitted.push(v));

      component.updateDocumentType('r1', DOCUMENT_TYPES.COVER_LETTER);

      expect(component.entries).toEqual([{ resumeId: 'r1', documentType: DOCUMENT_TYPES.COVER_LETTER }]);
      expect(emitted).toEqual([[{ resumeId: 'r1', documentType: DOCUMENT_TYPES.COVER_LETTER }]]);
    });

    it('should remove a document and re-emit when removeDocument is called', () => {
      component.toggle(resume1);
      component.toggle(resume2);
      const emitted: JobApplicationDocumentRequestItem[][] = [];
      component.documentsChange.subscribe(v => emitted.push(v));

      component.removeDocument('r1');

      expect(component.isSelected('r1')).toBe(false);
      expect(component.isSelected('r2')).toBe(true);
      expect(emitted).toEqual([[{ resumeId: 'r2', documentType: DOCUMENT_TYPES.RESUME }]]);
    });
  });

  describe('empty state', () => {
    it('should show an upload prompt inside the dropdown panel when there are no available resumes', () => {
      component.availableResumes = [];
      fixture.detectChanges();
      component.toggleDropdown();
      fixture.detectChanges();

      const panel = document.querySelector('.cdk-overlay-container .multiselect-panel') as HTMLElement;
      expect(panel.querySelector('.upload-link')).toBeTruthy();
    });

    it('should emit uploadRequested when the upload link is clicked', () => {
      component.availableResumes = [];
      fixture.detectChanges();
      component.toggleDropdown();
      fixture.detectChanges();

      const spy = jasmine.createSpy('uploadRequested');
      component.uploadRequested.subscribe(spy);

      const uploadLink = document.querySelector('.cdk-overlay-container .upload-link') as HTMLButtonElement;
      uploadLink.click();

      expect(spy).toHaveBeenCalled();
    });
  });
});
