import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { JobStatChangeDialogData } from '../../core/models/interface/dialog-models';
import { AngularMaterialModules } from '../../core/modules/material-modules';
import { CoreModules } from '../../core/modules/core-modules';
import { CircularLoaderComponent } from '../circular-loader/circular-loader.component';
import { ApplicationStatusOption } from '../../core/models/types/dropdown-option.types';
import { APPLICATION_STATUS_OPTIONS } from '../../core/models/constants/application-status-options.constants';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { FormInputComponent } from '../form-input/form-input.component';
import { FormInputType, FormInputSelectConfig, FormFieldId, FormFieldLabel } from '../../core/models';
import { FormInputConfigHelper } from '../../core/helpers';

@Component({
  selector: 'app-job-status-change',
  standalone: true,
  imports: [
    AngularMaterialModules,
    CoreModules,
    CircularLoaderComponent,
    ReactiveFormsModule,
    FormInputComponent
  ],
  templateUrl: './job-status-change.component.html',
  styleUrls: ['./job-status-change.component.scss']
})
export class JobStatusChangeComponent implements OnInit {
  jobStatusForm: FormGroup;
  loaderIsActive: boolean = false;
  applicationStatusOptions: ApplicationStatusOption[] = APPLICATION_STATUS_OPTIONS;

  statusConfig = FormInputConfigHelper.select({
    id: FormFieldId.STATUS,
    label: FormFieldLabel.APPLICATION_STATUS,
    options: APPLICATION_STATUS_OPTIONS.map(option => ({
      value: option.value,
      label: option.name
    })),
    required: true
  });

  constructor(
    private dialogRef: MatDialogRef<JobStatusChangeComponent>,
    @Inject(MAT_DIALOG_DATA) private jobStatusData: JobStatChangeDialogData
  ) {
    this.jobStatusForm = new FormGroup({
      status: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.getCurrentStatus();
  }

  cancelAction() {
    this.dialogRef.close({
      status: DialogCloseStatus.Cancelled
    });
  }

  getCurrentStatus() {
    this.jobStatusForm.get('status')?.setValue(this.jobStatusData.jobItem.status);
  }

  changeJobStatus() {
    if (this.jobStatusForm.valid) {
      const newStatus = this.jobStatusForm.get('status')?.value;
      this.dialogRef.close({
        status: DialogCloseStatus.Submitted,
        data: {
          status: newStatus
        }
      });
    }
  }

}
