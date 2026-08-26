import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
import { JobApplicationDocumentRequestItem, JobApplicationFormValue, JobApplicationItem } from '../../core/models/interface/job-application.models';
import { Role } from '../../core/models/interface/role.models';
import { DOCUMENT_TYPES } from '../../core/models/constants/profile.constants';
import { RoleStateService } from '../../core/services/role-state.service';
import { RoleService } from '../../core/services/role.service';
import { DateHelper, FormInputConfigHelper } from '../../core/helpers';
import { FormInputComponent } from '../form-input/form-input.component';
import { JobApplicationDocumentPickerComponent } from '../job-application-document-picker/job-application-document-picker.component';
import { MainRoutes, RootRoutes } from '../../core/models/enums/application.routes.enums';
import { PROFILE_TABS } from '../../core/models/constants/profile.constants';

const CREATE_ROLE_OPTION_VALUE = 'create-role';

@Component({
  selector: 'app-job-add-dialog',
  standalone: true,
  imports: [CircularLoaderComponent, AngularMaterialModules, CoreModules, FormInputComponent, JobApplicationDocumentPickerComponent],
  templateUrl: './job-add-dialog.component.html',
  styleUrl: './job-add-dialog.component.scss'
})
export class JobAddDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  applicationFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  maxDate: Date = new Date();
  applicationStatusOptions: ApplicationStatusOption[] = APPLICATION_STATUS_OPTIONS;
  loaderIsActive: boolean = false;
  editMode: boolean = false;

  roles: Role[] = [];
  preSuggestedDocuments: JobApplicationDocumentRequestItem[] = [];
  documents: JobApplicationDocumentRequestItem[] = [];

  companyConfig = FormInputConfigHelper.text({
    id: FormFieldId.COMPANY_NAME,
    label: FormFieldLabel.COMPANY,
    required: true
  });

  jobTitleConfig = FormInputConfigHelper.text({
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
    private roleStateService: RoleStateService,
    private roleService: RoleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.editMode = this.addJobDialogData.isEditing;
    if (this.editMode) this.prepopulateFormFields();

    this.applicationFormGroup.get('roleId')?.valueChanges.subscribe(roleId => this.onRoleSelectionChange(roleId));

    if (!this.roleStateService.getRoles().length) {
      this.roleService.getRoles().pipe(takeUntil(this.destroy$)).subscribe({ error: () => {} });
    }

    this.roleStateService.roles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(roles => {
        this.roles = roles;
        this.onRoleSelectionChange(this.applicationFormGroup.get('roleId')?.value ?? null);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      roleId: this.fb.control<string | null>(null, {
        validators: [Validators.required]
      }),
      jobLink: this.fb.control(''),
      notes: this.fb.control(''),
      applicationDate: this.fb.control(''),
      status: this.fb.control(ApplicationStatus.Applied),
    });
  }

  onRoleSelectionChange(roleId: string | null): void {
    if (roleId === CREATE_ROLE_OPTION_VALUE) {
      this.dialogRef.close({ status: DialogCloseStatus.Cancelled });
      this.router.navigate([`/${RootRoutes.main}/${MainRoutes.roles}`]);
      return;
    }

    const role = this.roles.find(r => r.id === roleId);
    if (!role) return;

    const positionControl = this.applicationFormGroup.get('position');
    if (!positionControl?.value) {
      positionControl?.patchValue(role.title);
    }
  }

  onDocumentsChange(documents: JobApplicationDocumentRequestItem[]): void {
    this.documents = documents;
  }

  onUploadRequested(): void {
    this.dialogRef.close({ status: DialogCloseStatus.Cancelled });
    this.router.navigate(
      [`/${RootRoutes.main}/${MainRoutes.profileManagement}`],
      { queryParams: { tab: PROFILE_TABS.DOCUMENTS } }
    );
  }

  cancelApplication() {
    this.dialogRef.close({ status: DialogCloseStatus.Cancelled });
  }

  prepopulateFormFields() {
    const jobData = this.addJobDialogData.jobApplicationData;
    if (!jobData) return;

    this.applicationFormGroup.patchValue({
      companyName: jobData.companyName || '',
      position: jobData.position || '',
      roleId: jobData.roleId || null,
      jobLink: jobData.jobLink || '',
      notes: jobData.notes || '',
      applicationDate: jobData.applicationDate ? new Date(jobData.applicationDate) : null,
      status: jobData.status || ApplicationStatus.Wishlist
    });

    this.documents = this.buildDocumentsFromJobData(jobData);
    this.preSuggestedDocuments = this.documents;
  }

  private buildDocumentsFromJobData(jobData: JobApplicationItem): JobApplicationDocumentRequestItem[] {
    const documents: JobApplicationDocumentRequestItem[] = [];

    if (jobData.resumeId) {
      documents.push({ resumeId: jobData.resumeId, documentType: DOCUMENT_TYPES.RESUME });
    }
    if (jobData.coverLetter) {
      documents.push({ resumeId: jobData.coverLetter.resumeId, documentType: jobData.coverLetter.documentType });
    }
    for (const document of jobData.otherDocuments ?? []) {
      documents.push({ resumeId: document.resumeId, documentType: document.documentType });
    }

    return documents;
  }

  addApplication() {
    const formData = this.applicationFormGroup.value;

    const data: JobApplicationFormValue = {
      position: formData.position,
      companyName: formData.companyName,
      jobLink: formData.jobLink,
      roleId: formData.roleId || undefined,
      documents: this.documents,
      notes: formData.notes,
      status: formData.status,
      applicationDate: DateHelper.formatDateSafely(formData.applicationDate),
      ...(this.editMode && this.addJobDialogData.jobApplicationData?.id && {
        id: this.addJobDialogData.jobApplicationData.id
      })
    };

    this.dialogRef.close({ status: DialogCloseStatus.Submitted, data });
  }

  get companyName() {
    return this.applicationFormGroup.get('companyName');
  }

  get jobTitle() {
    return this.applicationFormGroup.get('position');
  }

  get roleSelectConfig(): FormInputSelectConfig {
    const options = this.roles.map(role => ({ value: role.id, label: role.title }));

    if (!options.length) {
      options.push({ value: CREATE_ROLE_OPTION_VALUE, label: '+ Create a Role' });
    }

    return FormInputConfigHelper.select({
      id: FormFieldId.ROLE,
      label: FormFieldLabel.ROLE,
      placeholder: FORM_PLACEHOLDERS.ROLE_SELECT,
      required: true,
      options
    });
  }

  get roleSelected(): boolean {
    const roleId = this.applicationFormGroup?.get('roleId')?.value;
    return !!roleId && roleId !== CREATE_ROLE_OPTION_VALUE;
  }

  get roleDocumentResumes(): Resume[] {
    const roleId = this.applicationFormGroup?.get('roleId')?.value;
    const role = this.roles.find(r => r.id === roleId);
    if (!role) return [];
    return role.documents.map(document => ({
      id: document.resumeId,
      fileName: document.fileName,
      uploadedAt: document.uploadedAt,
      url: document.documentUrl,
      fileSize: document.fileSize,
      fileType: document.fileType,
      documentType: document.documentType
    }));
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
}
