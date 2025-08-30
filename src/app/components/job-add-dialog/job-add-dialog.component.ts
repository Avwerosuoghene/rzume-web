import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ApplicationStatus} from '../../core/models/enums/shared.enums';
import { CoreModules } from '../../core/modules/core-modules';
import { AngularMaterialModules } from '../../core/modules/material-modules';
import { CircularLoaderComponent } from '../circular-loader/circular-loader.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddJobDialogData } from '../../core/models/interface/dialog-models-interface';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { ApplicationStatusOption } from '../../core/models/types/dropdown-option.types';
import { APPLICATION_STATUS_OPTIONS } from '../../core/models/constants/application-status-options.constants';

@Component({
  selector: 'app-job-add-dialog',
  standalone: true,
  imports: [CircularLoaderComponent,AngularMaterialModules, CoreModules ],
  templateUrl: './job-add-dialog.component.html',
  styleUrl: './job-add-dialog.component.scss'
})
export class JobAddDialogComponent implements OnInit {
  applicationFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  maxDate: Date = new Date();
  applicationStatusOptions: ApplicationStatusOption[] = APPLICATION_STATUS_OPTIONS;
  loaderIsActive: boolean = false;
  editMode: boolean = false;

  constructor(private dialogRef:  MatDialogRef<JobAddDialogComponent>,  @Inject(MAT_DIALOG_DATA) private addJobDialogData: AddJobDialogData){

  }

  ngOnInit(): void {
    this.initializeForm();
    this.editMode = this.addJobDialogData.isEditing;
    if (this.editMode) this.prepopulateFormFields();
  }



  isBtnDisabled(): boolean {
    return (this.applicationFormGroup.invalid ||
      this.loaderIsActive);
  }

  initializeForm(): void {
    this.applicationFormGroup = this.fb.group({
      company: this.fb.control('', {
        validators: [
          Validators.required,
        ]
      }),
      role: this.fb.control('', {
        validators: [
          Validators.required
        ]
      }),
      cv_link: this.fb.control(''),
      job_link: this.fb.control(''),
      application_date:this.fb.control(''),
      status:this.fb.control(ApplicationStatus.Wishlist),
    });
  }

cancelApplication() {
   const cancellationData = {
      status: DialogCloseStatus.Cancelled,
    };
  this.dialogRef.close(cancellationData);
}

  prepopulateFormFields() {
    console.log('job data')
    console.log(this.addJobDialogData.jobApplicationData);
    if (this.addJobDialogData.jobApplicationData) {
      const jobData = this.addJobDialogData.jobApplicationData;
      console.log(jobData)
      this.applicationFormGroup.patchValue({
        company: jobData.companyName || '',
        role: jobData.position || '',
        cv_link: jobData.resumeLink || '',
        job_link: jobData.jobLink || '',
        application_date: jobData.applicationDate || '',
        status: jobData.status || ApplicationStatus.Wishlist
      });
    }
  }



  appNewApplication() {
    const formData = this.applicationFormGroup.value;
    const submissionData = {
      status: DialogCloseStatus.Submitted,
      data: {
        ...formData,
        ...(this.editMode && this.addJobDialogData.jobApplicationData?.id && {
          id: this.addJobDialogData.jobApplicationData.id
        })
      }
    };
    this.dialogRef.close(submissionData);
  }

  get companyName() {
    return this.applicationFormGroup.get('company');
  }
  get jobRole() {
    return this.applicationFormGroup.get('role');
  }

}
