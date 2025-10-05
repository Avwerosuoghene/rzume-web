import { Component, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { AngularMaterialModules, CoreModules } from '../../../core/modules';
import { SessionStorageKeys, APIResponse, RootRoutes, ErrorResponse, InfoDialogData, MSG_EXPIRED_SESSION, IconStat, AuthRoutes } from '../../../core/models';
import { ProfileManagementService } from '../../../core/services';
import { slideOutAnimation } from '../../../core/animations';
import { SessionStorageUtil, FormValidationUtil } from '../../../core/helpers';
import { FloatingLabelDirective } from '../../../core/directives';
import { UpdateProfilePayload } from '../../../core/models/interface/profile.models';
import { finalize, pipe } from 'rxjs';

@Component({
  selector: 'app-onboard',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, CircularLoaderComponent, FloatingLabelDirective],
  templateUrl: './onboard.component.html',
  styleUrl: './onboard.component.scss',
  animations: [slideOutAnimation]

})
export class OnboardComponent {
  onboardFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  loaderIsActive: boolean = false;
  router = inject(Router);
  slideInAnimationState = 'slide-out'


  constructor(private profileMgmtService: ProfileManagementService, private dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.initializeOnBoardForm();
    this.runOnInitAnimations();

  }


  runOnInitAnimations() {
    setTimeout(() => {
      this.slideInAnimationState = 'slide-in';
    }, 0);

  }

  initializeOnBoardForm(): void {
    this.onboardFormGroup = this.fb.group({
      username: this.fb.control('', {
        validators: [Validators.required]
      })
    })
  }

  isBtnDisabled(): boolean {
    return (this.onboardFormGroup.invalid ||
      this.loaderIsActive);
  }

  submitOnboardForm(): void {
    if (this.onboardFormGroup.invalid) return;

    const updateProfilePayload = {
      userName: this.onboardFormGroup.get('username')?.value ?? ''
    };

    this.toggleLoader(true);

    this.profileMgmtService.update(updateProfilePayload).pipe(
      finalize(() => this.toggleLoader(false))
    ).subscribe({
      next: ({ success }: APIResponse<boolean>) => {
        this.onboardFormGroup.reset();

        if (success) {
          this.navigateOut(`/${RootRoutes.main}`);
        }
      }
    });
  }

  openErrorDialog() {
    const dialogData: InfoDialogData = {
      infoMessage: MSG_EXPIRED_SESSION,
      statusIcon: IconStat.failed
    }
    const errorDialogRef = this.dialog.open(InfoDialogComponent, {
      data: dialogData,
      backdropClass: "blurred"
    });

    errorDialogRef.afterClosed().subscribe(result => {
      this.navigateOut(`/${RootRoutes.auth}/${AuthRoutes.signup}`);
    });

  }


  navigateOut(navigationRoute: string) {
    this.router.navigate([navigationRoute]);

  }

  toggleLoader(isActive: boolean) {
    this.loaderIsActive = isActive;
  }

  getFieldError(fieldName: string): string {
    return FormValidationUtil.getFieldError(this.onboardFormGroup, fieldName);
  }

}
