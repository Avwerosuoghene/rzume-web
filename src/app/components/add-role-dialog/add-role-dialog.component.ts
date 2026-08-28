import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { Subject, takeUntil } from 'rxjs';
import { AngularMaterialModules } from '../../core/modules/material-modules';
import { CoreModules } from '../../core/modules/core-modules';
import { FormInputComponent } from '../form-input/form-input.component';
import { DocumentHelperService } from '../../core/services/document-helper.service';
import { IndustryService } from '../../core/services/industry.service';
import { DocumentHelper, FormInputConfigHelper } from '../../core/helpers';
import { FORM_PLACEHOLDERS, FormFieldId, FormFieldLabel } from '../../core/models';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';
import { CreateRolePayload } from '../../core/models/interface/role.models';
import { Industry } from '../../core/models/interface/industry.models';
import { Resume } from '../../core/models/interface/profile.models';
import { AddRoleDialogData } from '../../core/models/interface/dialog-models';
import { MainRoutes, RootRoutes } from '../../core/models/enums/application.routes.enums';
import { PROFILE_TABS } from '../../core/models/constants/profile.constants';
import { ROLE_DIALOG_CONFIG, ROLE_VALIDATION } from '../../core/models/constants/role.constants';

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
  private dialogData = inject<AddRoleDialogData>(MAT_DIALOG_DATA);

  private destroy$ = new Subject<void>();
  private documentsPrepopulated = false;

  roleForm!: FormGroup;
  industries: Industry[] = [];
  selectedDocuments: Resume[] = [];
  documentSearchQuery = '';
  isDropdownOpen = false;
  editMode = false;

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

  // Purely a UI-level display/search control — holds whatever text is currently typed or, once an
  // option is chosen, the selected industry's name. industryControl (above) stays the real form
  // value (the industry's id, unchanged from before this became an autocomplete). Carries its own
  // `required` (matching industryControl's) only so mat-form-field's own error-display machinery
  // — which reads the *bound* control's error state, not industryControl's — has something to key
  // off; the real "was a real industry actually selected" check still lives on industryControl via
  // onSubmit()/isSubmitDisabled, so free-typed text that matches nothing still can't be submitted.
  industrySearchControl = this.fb.control('', {
    validators: [Validators.required]
  });

  readonly industryFieldId = FormFieldId.INDUSTRY;
  readonly industryFieldLabel = FormFieldLabel.INDUSTRY;
  readonly industryPlaceholder = FORM_PLACEHOLDERS.INDUSTRY_SELECT;

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

    this.editMode = this.dialogData?.isEditing ?? false;
    const existingRole = this.dialogData?.roleData;
    if (existingRole) {
      this.jobRoleControl.setValue(existingRole.title);
    }

    this.industryService.getIndustries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          if (response.success && response.data) {
            this.industries = response.data;
            if (existingRole) {
              const matchingIndustry = this.industries.find(i => i.name === existingRole.industryName);
              if (matchingIndustry) {
                this.industryControl.setValue(String(matchingIndustry.id));
                this.industrySearchControl.setValue(matchingIndustry.name);
              }
            }
            this.cdr.markForCheck();
          }
        }
      });

    if (!this.documentHelperService.getResumes().length) {
      this.documentHelperService.fetchResumes();
    }

    this.documentHelperService.resumes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(resumes => {
        if (existingRole && !this.documentsPrepopulated) {
          const roleResumeIds = new Set(existingRole.documents.map(d => d.resumeId));
          this.selectedDocuments = resumes.filter(r => roleResumeIds.has(r.id));
          this.documentsPrepopulated = true;
        }
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get dialogTitle(): string {
    return this.editMode ? ROLE_DIALOG_CONFIG.EDIT_TITLE : ROLE_DIALOG_CONFIG.TITLE;
  }

  get submitButtonText(): string {
    return this.editMode ? ROLE_DIALOG_CONFIG.SAVE_BUTTON_TEXT : ROLE_DIALOG_CONFIG.SUBMIT_BUTTON_TEXT;
  }

  get filteredIndustries(): Industry[] {
    const query = (this.industrySearchControl.value || '').trim().toLowerCase();
    if (!query) return this.industries;
    return this.industries.filter(i => i.name.toLowerCase().includes(query));
  }

  onIndustrySelected(event: MatAutocompleteSelectedEvent): void {
    const industry = event.option.value as Industry;
    this.industryControl.setValue(String(industry.id));
    this.industryControl.markAsDirty();
    this.industryControl.markAsTouched();
    this.industrySearchControl.setValue(industry.name, { emitEvent: false });
  }

  get allResumes(): Resume[] {
    return this.documentHelperService.getResumes();
  }

  get filteredResumes(): Resume[] {
    const query = this.documentSearchQuery.trim().toLowerCase();
    if (!query) return this.allResumes;
    return this.allResumes.filter(r => r.fileName.toLowerCase().includes(query));
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
    } else {
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
