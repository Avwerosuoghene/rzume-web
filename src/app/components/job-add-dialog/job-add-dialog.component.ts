import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ApplicationStatus, DialogCloseStat } from '../../core/models/enums/ui-enums';
import { CoreModules } from '../../core/modules/core-modules';
import { AngularMaterialModules } from '../../core/modules/material-modules';
import { CircularLoaderComponent } from '../circular-loader/circular-loader.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

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



  constructor(private dialogRef:  MatDialogRef<JobAddDialogComponent>){

  }

  ngOnInit(): void {
    this.initializeForm();
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
      status:this.fb.control(ApplicationStatus.wishList),
    });
  }

  appNewApplication() {
    console.log(this.applicationFormGroup);
    this.dialogRef.close(DialogCloseStat.success);
  }

  get companyName() {
    return this.applicationFormGroup.get('company');
  }
  get jobRole() {
    return this.applicationFormGroup.get('role');
  }

}
