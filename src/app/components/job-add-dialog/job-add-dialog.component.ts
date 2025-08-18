import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ApplicationStatus} from '../../core/models/enums/shared.enums';
import { CoreModules } from '../../core/modules/core-modules';
import { AngularMaterialModules } from '../../core/modules/material-modules';
import { CircularLoaderComponent } from '../circular-loader/circular-loader.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddJobDialogData } from '../../core/models/interface/dialog-models-interface';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';

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
  applicationStatusList : Array<string> = Object.values(ApplicationStatus);
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
    this.applicationFormGroup.patchValue({
      company: 'Example Company',
      role: 'Frontend Developer',
      cv_link: 'http://example.com/cv.pdf',
      job_link: 'http://example.com/job',
      application_date: '2024-08-16',
      status: ApplicationStatus.InProgress
    });

  }

  appNewApplication() {
    const submissionData = {
      status: DialogCloseStatus.Submitted,
      data: this.applicationFormGroup.value
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
