import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { JobCardItemComponent } from './job-card-item.component';
import { JobApplicationItem } from '../../../../core/models/interface/job-application.models';
import { ApplicationStatus, COPY_SUCCESS_MESSAGE, SNACKBAR_CLOSE_LABEL, SNACKBAR_DURATION } from '../../../../core/models';

describe('JobCardItemComponent', () => {
  let component: JobCardItemComponent;
  let fixture: ComponentFixture<JobCardItemComponent>;
  let mockClipboard: jasmine.SpyObj<Clipboard>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockJob: JobApplicationItem = {
    id: '1',
    position: 'Software Developer',
    companyName: 'Test Company',
    status: ApplicationStatus.Applied,
    applicationDate: new Date(),
    jobLink: 'https://example.com/job'
  };

  beforeEach(async () => {
    const clipboardSpy = jasmine.createSpyObj('Clipboard', ['copy']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [JobCardItemComponent],
      providers: [
        { provide: Clipboard, useValue: clipboardSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JobCardItemComponent);
    component = fixture.componentInstance;
    component.job = mockJob;
    
    mockClipboard = TestBed.inject(Clipboard) as jasmine.SpyObj<Clipboard>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject clipboard and snackBar services', () => {
    expect(component.clipboard).toBeDefined();
    expect(component.snackBar).toBeDefined();
  });

  describe('triggerApplicationEdit', () => {
    it('should emit edit event with job item', () => {
      spyOn(component.edit, 'emit');

      component.triggerApplicationEdit(mockJob);

      expect(component.edit.emit).toHaveBeenCalledWith(mockJob);
    });
  });

  describe('triggerDelete', () => {
    it('should emit delete event with job item', () => {
      spyOn(component.delete, 'emit');

      component.triggerDelete(mockJob);

      expect(component.delete.emit).toHaveBeenCalledWith(mockJob);
    });
  });

  describe('triggerStatusChange', () => {
    it('should emit statusChange event with job item', () => {
      spyOn(component.statusChange, 'emit');

      component.triggerStatusChange(mockJob);

      expect(component.statusChange.emit).toHaveBeenCalledWith(mockJob);
    });
  });

  describe('copyLink', () => {
    it('should copy link to clipboard and show success message', () => {
      const testLink = 'https://example.com/job';
      mockClipboard.copy.and.returnValue(true);

      component.copyLink(testLink);

      expect(mockClipboard.copy).toHaveBeenCalledWith(testLink);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        COPY_SUCCESS_MESSAGE,
        SNACKBAR_CLOSE_LABEL,
        { duration: SNACKBAR_DURATION }
      );
    });

    it('should not copy when link is undefined', () => {
      component.copyLink(undefined);

      expect(mockClipboard.copy).not.toHaveBeenCalled();
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    });

    it('should not copy when link is empty string', () => {
      component.copyLink('');

      expect(mockClipboard.copy).not.toHaveBeenCalled();
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    });

    it('should not copy when link is null', () => {
      component.copyLink(null as any);

      expect(mockClipboard.copy).not.toHaveBeenCalled();
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    });
  });

  it('should require job input', () => {
    expect(component.job).toBeDefined();
  });

  it('should have all required output events', () => {
    expect(component.edit).toBeDefined();
    expect(component.delete).toBeDefined();
    expect(component.statusChange).toBeDefined();
  });
});
