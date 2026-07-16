import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationStatus } from '../../core/models/enums/shared.enums';
import { CoreModules } from '../../core/modules/core-modules';
import { AngularMaterialModules } from '../../core/modules/material-modules';
import { CircularLoaderComponent } from '../circular-loader/circular-loader.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { ApplicationStatusOption } from '../../core/models/types/dropdown-option.types';
import { APPLICATION_STATUS_OPTIONS } from '../../core/models/constants/application-status-options.constants';
import { FORM_PLACEHOLDERS } from '../../core/models/constants/form-input.constants';
import { AddJobDialogData, FormFieldId, FormFieldLabel, FormInputSelectConfig, Resume } from '../../core/models';
import { DocumentHelperService } from '../../core/services/document-helper.service';
import { DateHelper, FormInputConfigHelper } from '../../core/helpers';
import { FormInputComponent } from '../form-input/form-input.component';

@Component({
  selector: 'app-job-add-dialog',
  standalone: true,
  imports: [CircularLoaderComponent, AngularMaterialModules, CoreModules, FormInputComponent],
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
  selectedResume?: Resume;

  companyConfig = FormInputConfigHelper.text({
    id: FormFieldId.COMPANY_NAME,
    label: FormFieldLabel.COMPANY,
    required: true
  });

  roleConfig = FormInputConfigHelper.text({
    id: FormFieldId.POSITION,
    label: FormFieldLabel.JOB_ROLE,
    required: true
  });

  jobLinkConfig = FormInputConfigHelper.url({
    id: FormFieldId.JOB_LINK,
    label: FormFieldLabel.JOB_URL
  });

  dateConfig = FormInputConfigHelper.date({
    id: FormFieldId.APPLICATION_DATE,
    label: FormFieldLabel.DATE,
    max: this.maxDate
  });

  notesConfig = FormInputConfigHelper.textarea({
    id: FormFieldId.NOTES,
    label: FormFieldLabel.NOTES,
    rows: 4
  });

  constructor(
    private dialogRef: MatDialogRef<JobAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private addJobDialogData: AddJobDialogData,
    private documentHelperService: DocumentHelperService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.editMode = this.addJobDialogData.isEditing;
    if (this.editMode) this.prepopulateFormFields();
  }

  isBtnDisabled(): boolean {
    return this.applicationFormGroup.invalid || this.loaderIsActive;
  }

  initializeForm(): void {
    this.applicationFormGroup = this.fb.group({
      companyName: this.fb.control('', {
        validators: [Validators.required]
      }),
      position: this.fb.control('', {
        validators: [Validators.required]
      }),
      resumeId: this.fb.control(null),
      jobLink: this.fb.control(''),
      notes: this.fb.control(''),
      applicationDate: this.fb.control(''),
      status: this.fb.control(ApplicationStatus.Applied),
    });
  }

  cancelApplication() {
    this.dialogRef.close({ status: DialogCloseStatus.Cancelled });
  }

  prepopulateFormFields() {
    if (this.addJobDialogData.jobApplicationData) {
      const jobData = this.addJobDialogData.jobApplicationData;
      const resumeId = jobData.resumeId || null;
      const resumes = this.documentHelperService.getResumes();
      this.selectedResume = resumeId ? resumes.find(r => r.id === resumeId) : undefined;

      this.applicationFormGroup.patchValue({
        companyName: jobData.companyName || '',
        position: jobData.position || '',
        resumeId: resumeId,
        jobLink: jobData.jobLink || '',
        notes: jobData.notes || '',
        applicationDate: jobData.applicationDate ? new Date(jobData.applicationDate) : null,
        status: jobData.status || ApplicationStatus.Wishlist
      });
    }
  }

  getResumeDisplayName(resumeId: string): string {
    const resumes = this.documentHelperService.getResumes();
    return resumes.find(r => r.id === resumeId)?.fileName || '';
  }

  addApplication() {
    const formData = this.applicationFormGroup.value;

    const submissionData = {
      status: DialogCloseStatus.Submitted,
      data: {
        ...formData,
        resumeId: formData.resumeId || undefined,
        applicationDate: DateHelper.formatDateSafely(formData.applicationDate),
        ...(this.editMode && this.addJobDialogData.jobApplicationData?.id && {
          id: this.addJobDialogData.jobApplicationData.id
        })
      }
    };
    this.dialogRef.close(submissionData);
  }

  get companyName() {
    return this.applicationFormGroup.get('companyName');
  }

  get jobRole() {
    return this.applicationFormGroup.get('position');
  }

  get resumeConfig(): FormInputSelectConfig {
    return FormInputConfigHelper.select({
      id: FormFieldId.RESUME_ID,
      label: FormFieldLabel.CV_USED,
      placeholder: FORM_PLACEHOLDERS.RESUME_SELECT,
      options: this.documentHelperService.getSelectOptions()
    });
  }

  get statusConfig(): FormInputSelectConfig {
    return FormInputConfigHelper.select({
      id: FormFieldId.STATUS,
      label: FormFieldLabel.APPLICATION_STATUS,
      options: this.applicationStatusOptions.map(option => ({
        value: option.value,
        label: option.name
      }))
    });
  }

  onResumeSelectionChange(event: Event): void {
    this.documentHelperService.handleSelection(event, this.router, this.dialogRef);
  }
}
