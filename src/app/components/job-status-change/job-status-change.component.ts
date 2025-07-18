import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JobStatChangeDialogData } from '../../core/models/interface/dialog-models-interface';
import { AngularMaterialModules } from '../../core/modules/material-modules';
import { CoreModules } from '../../core/modules/core-modules';
import { CircularLoaderComponent } from '../circular-loader/circular-loader.component';
import { ApplicationStatus } from '../../core/models/enums/shared.enums';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-job-status-change',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, CircularLoaderComponent],
  templateUrl: './job-status-change.component.html',
  styleUrl: './job-status-change.component.scss'
})
export class JobStatusChangeComponent implements OnInit {
  @ViewChild("jobStatusForm", {static: false}) jobStatusForm!: FormGroup;
  loaderIsActive: boolean = false;
  applicationStatusList : Array<string> = Object.values(ApplicationStatus);


  constructor (private dialogRef:  MatDialogRef<JobStatusChangeComponent>, @Inject(MAT_DIALOG_DATA) private jobStatusData: JobStatChangeDialogData ) {

  }

  ngOnInit(): void {
    this.getCurrentStatus();
  }

  cancelAction(){
    this.dialogRef.close();
  }

  getCurrentStatus() {
    this.jobStatusForm.controls['status'].setValue(this.jobStatusData.status);
  }

  changeJobStatus() {

  }
}
