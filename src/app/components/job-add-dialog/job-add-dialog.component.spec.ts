import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobAddDialogComponent } from './job-add-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';

describe('JobAddDialogComponent', () => {
  let component: JobAddDialogComponent;
  let fixture: ComponentFixture<JobAddDialogComponent>;

  beforeEach(async () => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    const mockDialogData = {
      isEditing: false,
      jobApplicationData: null
    };

    await TestBed.configureTestingModule({
      imports: [JobAddDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef }, 
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        provideNativeDateAdapter()
      ],
      schemas: [NO_ERRORS_SCHEMA] 
    }).compileComponents();

    fixture = TestBed.createComponent(JobAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});