import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ApplicationStatus} from '../../core/models/enums/shared.enums';
import { CoreModules } from '../../core/modules/core-modules';
import { AngularMaterialModules } from '../../core/modules/material-modules';
import { CircularLoaderComponent } from '../circular-loader/circular-loader.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { ApplicationStatusOption } from '../../core/models/types/dropdown-option.types';
import { APPLICATION_STATUS_OPTIONS } from '../../core/models/constants/application-status-options.constants';
import { AddJobDialogData, NO_RESUMES_AVAILABLE_MSG, Resume } from '../../core/models';
import { DocumentHelperService } from '../../core/services/document-helper.service';
import { DocumentHelper } from '../../core/helpers';

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
  resumes: Resume[] = [];
  selectedResume?: Resume;
  noResumesMessage = NO_RESUMES_AVAILABLE_MSG;

  constructor(
    private dialogRef: MatDialogRef<JobAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private addJobDialogData: AddJobDialogData,
    private documentHelperService: DocumentHelperService
  ) {}

  ngOnInit(): void {
    this.loadResumes();
    this.initializeForm();
    console.log(this.addJobDialogData)
    this.editMode = this.addJobDialogData.isEditing;
    if (this.editMode) this.prepopulateFormFields();
  }

  loadResumes(): void {
    this.resumes = this.documentHelperService.getResumes();
  }



  isBtnDisabled(): boolean {
    return (this.applicationFormGroup.invalid ||
      this.loaderIsActive);
  }

  initializeForm(): void {
    this.applicationFormGroup = this.fb.group({
      companyName: this.fb.control('', {
        validators: [
          Validators.required,
        ]
      }),
      position: this.fb.control('', {
        validators: [
          Validators.required
        ]
      }),
      resumeId: this.fb.control(''),
      jobLink: this.fb.control(''),
      notes: this.fb.control(''),
      applicationDate:this.fb.control(''),
      status:this.fb.control(ApplicationStatus.Applied),
    });
  }


cancelApplication() {
   const cancellationData = {
      status: DialogCloseStatus.Cancelled,
    };
  this.dialogRef.close(cancellationData);
}

  prepopulateFormFields() {
    if (this.addJobDialogData.jobApplicationData) {
      const jobData = this.addJobDialogData.jobApplicationData;
      
      const resumeId = jobData.resumeId;
      this.selectedResume = this.findResumeById(resumeId);

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

  private findResumeById(resumeId?: string): Resume | undefined {
    if (!resumeId) return undefined;
    return DocumentHelper.findResumeById(this.resumes, resumeId);
  }


  get hasResumes(): boolean {
    return this.resumes.length > 0;
  }

  getResumeDisplayName(resumeId: string): string {
    return DocumentHelper.getResumeFileName(this.resumes, resumeId);
  }



  addApplication() {
    const formData = this.applicationFormGroup.value;
    
    const submissionData = {
      status: DialogCloseStatus.Submitted,
      data: {
        ...formData,
        applicationDate: formData.applicationDate || undefined,
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

}
