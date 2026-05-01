import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JobViewDialogComponent } from './job-view-dialog.component';
import { ViewJobDialogData } from '../../core/models/interface/dialog-models';
import { JobApplicationItem } from '../../core/models/interface/job-application.models';
import { ApplicationStatus } from '../../core/models/enums/shared.enums';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('JobViewDialogComponent', () => {
  let component: JobViewDialogComponent;
  let fixture: ComponentFixture<JobViewDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<JobViewDialogComponent>>;

  const mockJobApplication: JobApplicationItem = {
    id: '1',
    companyName: 'Test Company',
    position: 'Software Engineer',
    status: ApplicationStatus.Applied,
    applicationDate: new Date('2024-01-15'),
    jobLink: 'https://example.com/job',
    notes: 'Test notes',
    resumeId: 'resume-1'
  };

  const mockDialogData: ViewJobDialogData = {
    jobApplication: mockJobApplication
  };

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [JobViewDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<JobViewDialogComponent>>;
    fixture = TestBed.createComponent(JobViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with job application data', () => {
    expect(component.jobApplication).toEqual(mockJobApplication);
  });

  it('should close dialog when closeDialog is called', () => {
    component.closeDialog();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should display job application details', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Test Company');
    expect(compiled.textContent).toContain('Software Engineer');
  });
});
