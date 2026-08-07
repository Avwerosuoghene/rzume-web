import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { Subject, takeUntil } from 'rxjs';
import { AngularMaterialModules } from '../../core/modules/material-modules';
import { CoreModules } from '../../core/modules/core-modules';
import { FormInputComponent } from '../form-input/form-input.component';
import { DocumentHelperService } from '../../core/services/document-helper.service';
import { IndustryService } from '../../core/services/industry.service';
import { DocumentHelper, FormInputConfigHelper } from '../../core/helpers';
import { FORM_PLACEHOLDERS, FormFieldId, FormFieldLabel, FormInputSelectConfig } from '../../core/models';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { CreateRolePayload } from '../../core/models/interface/role.models';
import { Industry } from '../../core/models/interface/industry.models';
import { Resume } from '../../core/models/interface/profile.models';
import { MainRoutes, RootRoutes } from '../../core/models/enums/application.routes.enums';
import { PROFILE_TABS } from '../../core/models/constants/profile.constants';
import { ROLE_DIALOG_CONFIG, ROLE_DOCUMENT_LIMIT, ROLE_VALIDATION } from '../../core/models/constants/role.constants';

@Component({
  selector: 'app-add-role-dialog',
  standalone: true,
  imports: [
    CoreModules,
    AngularMaterialModules,
    FormInputComponent,
    OverlayModule
  ],
  templateUrl: './add-role-dialog.component.html',
  styleUrl: './add-role-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddRoleDialogComponent implements OnInit, OnDestroy {
  private fb = inject(NonNullableFormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private documentHelperService = inject(DocumentHelperService);
  private industryService = inject(IndustryService);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<AddRoleDialogComponent>);

  private destroy$ = new Subject<void>();

  roleForm!: FormGroup;
  industries: Industry[] = [];
  selectedDocuments: Resume[] = [];
  documentSearchQuery = '';
  isDropdownOpen = false;

  readonly dialogTitle = ROLE_DIALOG_CONFIG.TITLE;
  readonly maxDocuments = ROLE_DOCUMENT_LIMIT;

  readonly multiselectOverlayPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 }
  ];

  jobRoleControl = this.fb.control('', {
    validators: [
      Validators.required,
      Validators.minLength(ROLE_VALIDATION.JOB_ROLE_MIN_LENGTH),
      Validators.maxLength(ROLE_VALIDATION.JOB_ROLE_MAX_LENGTH)
    ]
  });

  industryControl = this.fb.control('', {
    validators: [Validators.required]
  });

  jobRoleConfig = FormInputConfigHelper.text({
    id: FormFieldId.JOB_ROLE,
    label: FormFieldLabel.JOB_ROLE,
    required: true,
    minLength: ROLE_VALIDATION.JOB_ROLE_MIN_LENGTH,
    maxLength: ROLE_VALIDATION.JOB_ROLE_MAX_LENGTH
  });

  ngOnInit(): void {
    this.roleForm = this.fb.group({
      jobRole: this.jobRoleControl,
      industry: this.industryControl
    });

    this.industryService.getIndustries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          if (response.success && response.data) {
            this.industries = response.data;
            this.cdr.markForCheck();
          }
        }
      });

    if (!this.documentHelperService.getResumes().length) {
      this.documentHelperService.fetchResumes();
    }

    this.documentHelperService.resumes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get industryConfig(): FormInputSelectConfig {
    return FormInputConfigHelper.select({
      id: FormFieldId.INDUSTRY,
      label: FormFieldLabel.INDUSTRY,
      placeholder: FORM_PLACEHOLDERS.INDUSTRY_SELECT,
      required: true,
      options: this.industries.map(i => ({ value: String(i.id), label: i.name }))
    });
  }

  get allResumes(): Resume[] {
    return this.documentHelperService.getResumes();
  }

  get filteredResumes(): Resume[] {
    const query = this.documentSearchQuery.trim().toLowerCase();
    if (!query) return this.allResumes;
    return this.allResumes.filter(r => r.fileName.toLowerCase().includes(query));
  }

  get canAddMoreDocuments(): boolean {
    return this.selectedDocuments.length < this.maxDocuments;
  }

  get isSubmitDisabled(): boolean {
    return this.roleForm.invalid || this.selectedDocuments.length === 0;
  }

  isDocumentSelected(resumeId: string): boolean {
    return this.selectedDocuments.some(d => d.id === resumeId);
  }

  toggleDocument(resume: Resume): void {
    if (this.isDocumentSelected(resume.id)) {
      this.selectedDocuments = this.selectedDocuments.filter(d => d.id !== resume.id);
    } else if (this.canAddMoreDocuments) {
      this.selectedDocuments = [...this.selectedDocuments, resume];
    }
    this.cdr.markForCheck();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (!this.isDropdownOpen) this.documentSearchQuery = '';
    this.cdr.markForCheck();
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.documentSearchQuery = '';
    this.cdr.markForCheck();
  }

  removeDocument(index: number): void {
    this.selectedDocuments = this.selectedDocuments.filter((_, i) => i !== index);
    this.cdr.markForCheck();
  }

  navigateToDocumentsPage(): void {
    this.router.navigate(
      [`/${RootRoutes.main}/${MainRoutes.profileManagement}`],
      { queryParams: { tab: PROFILE_TABS.DOCUMENTS } }
    );
    this.dialogRef.close({ status: DialogCloseStatus.Cancelled });
  }

  getDocumentIcon(fileType?: string): string {
    return DocumentHelper.getDocumentIcon(fileType);
  }

  formatFileSize(bytes: number): string {
    return DocumentHelper.formatFileSize(bytes);
  }

  onSubmit(): void {
    if (this.roleForm.invalid || this.selectedDocuments.length === 0) return;

    const payload: CreateRolePayload = {
      title: this.roleForm.get('jobRole')?.value,
      industryId: Number(this.roleForm.get('industry')?.value),
      documents: this.selectedDocuments.map(d => ({
        resumeId: d.id
      }))
    };

    this.dialogRef.close({ status: DialogCloseStatus.Submitted, data: payload });
  }

  onCancel(): void {
    this.dialogRef.close({ status: DialogCloseStatus.Cancelled });
  }
}
