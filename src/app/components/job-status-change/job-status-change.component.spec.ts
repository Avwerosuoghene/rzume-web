import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { JobStatusChangeComponent } from './job-status-change.component';
import { ApplicationStatus } from '../../core/models';

describe('JobStatusChangeComponent', () => {
  let component: JobStatusChangeComponent;
  let fixture: ComponentFixture<JobStatusChangeComponent>;

  beforeEach(async () => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    const mockDialogData = {
      jobItem: {
        id: '1',
        position: 'Software Engineer',
        companyName: 'Test Company',
        status: ApplicationStatus.Applied,
        applicationDate: new Date()
      }
    };

    await TestBed.configureTestingModule({
      imports: [JobStatusChangeComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobStatusChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
