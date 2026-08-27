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

  describe('one-per-type restriction (Resume/CoverLetter capped at one each, per the backend validation rule)', () => {
    const resumeA: Resume = { id: 'ra', fileName: 'resume-a.pdf', uploadedAt: new Date(), url: 'x', documentType: DOCUMENT_TYPES.RESUME };
    const resumeB: Resume = { id: 'rb', fileName: 'resume-b.pdf', uploadedAt: new Date(), url: 'x', documentType: DOCUMENT_TYPES.RESUME };
    const coverA: Resume = { id: 'ca', fileName: 'cover-a.pdf', uploadedAt: new Date(), url: 'x', documentType: DOCUMENT_TYPES.COVER_LETTER };
    const coverB: Resume = { id: 'cb', fileName: 'cover-b.pdf', uploadedAt: new Date(), url: 'x', documentType: DOCUMENT_TYPES.COVER_LETTER };
    const otherA: Resume = { id: 'oa', fileName: 'other-a.pdf', uploadedAt: new Date(), url: 'x', documentType: DOCUMENT_TYPES.OTHER };
    const otherB: Resume = { id: 'ob', fileName: 'other-b.pdf', uploadedAt: new Date(), url: 'x', documentType: DOCUMENT_TYPES.OTHER };

    beforeEach(() => {
      component.availableResumes = [resumeA, resumeB, coverA, coverB, otherA, otherB];
      fixture.detectChanges();
    });

    it('should not select a second Resume-type document once one is already selected', () => {
      component.toggle(resumeA);
      component.toggle(resumeB);

      expect(component.isSelected('ra')).toBe(true);
      expect(component.isSelected('rb')).toBe(false);
    });

    it('should not select a second CoverLetter-type document once one is already selected', () => {
      component.toggle(coverA);
      component.toggle(coverB);

      expect(component.isSelected('ca')).toBe(true);
      expect(component.isSelected('cb')).toBe(false);
    });

    it('should allow selecting any number of Other-type documents without restriction', () => {
      component.toggle(otherA);
      component.toggle(otherB);

      expect(component.isSelected('oa')).toBe(true);
      expect(component.isSelected('ob')).toBe(true);
    });

    it('should allow selecting a Resume-type document again once the previously-selected one is deselected', () => {
      component.toggle(resumeA);
      component.toggle(resumeA);
      component.toggle(resumeB);

      expect(component.isSelected('ra')).toBe(false);
      expect(component.isSelected('rb')).toBe(true);
    });

    it('should mark other same-type resumes as disabled in the option list once one of that type is selected', () => {
      component.toggle(resumeA);

      expect(component.isOptionDisabled(resumeB)).toBe(true);
      expect(component.isOptionDisabled(resumeA)).toBe(false);
      expect(component.isOptionDisabled(otherA)).toBe(false);
    });

    it('should render the disabled checkbox in the template so the user cannot check it directly', () => {
      component.toggle(resumeA);
      fixture.detectChanges();
      component.toggleDropdown();
      fixture.detectChanges();

      const checkboxes = document.querySelectorAll('.cdk-overlay-container .option-checkbox') as NodeListOf<HTMLInputElement>;
      const resumeBIndex = component.filteredResumes.findIndex(r => r.id === 'rb');
      expect(checkboxes[resumeBIndex].disabled).toBe(true);
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

    it('should show the document\'s type as plain styled text, not an editable dropdown (the type is inherent to the uploaded document, not chosen per application)', () => {
      const coverLetterResume: Resume = { ...resume1, documentType: DOCUMENT_TYPES.COVER_LETTER };
      component.availableResumes = [coverLetterResume, resume2];
      component.toggle(coverLetterResume);
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.document-card');
      expect(card.querySelector('mat-select')).toBeNull();
      expect(card.querySelector('.document-type-label').textContent).toContain('Cover Letter');
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
