import { Component, inject, OnDestroy } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { finalize, Observable, startWith } from 'rxjs';
import { AuthRoutes, RootRoutes } from '../../../core/models/enums/application.routes.enums';
import { IconStat } from '../../../core/models/enums/shared.enums';
import { RequestPassResetPayload, APIResponse, InfoDialogData, FormFieldId, FormFieldLabel } from '../../../core/models';
import { AuthenticationService, TimerService } from '../../../core/services';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { CoreModules } from '../../../core/modules/core-modules';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { RouterModules } from '../../../core/modules/router-modules';
import { FormInputComponent } from '../../../components/form-input/form-input.component';
import { FormInputType, FormInputConfig } from '../../../core/models';
import { FormInputConfigHelper } from '../../../core/helpers';

@Component({
  selector: 'app-request-password-reset',
  standalone: true,
  imports: [AngularMaterialModules, RouterModules, CircularLoaderComponent, CoreModules, FormInputComponent],
  templateUrl: './request-password-reset.component.html',
  styleUrl: './request-password-reset.component.scss'
})
export class RequestPasswordResetComponent implements OnDestroy {
  signUpRoute = `/${RootRoutes.auth}/${AuthRoutes.signup}`;

  passResetReqFormGroup!: FormGroup;
  loaderIsActive = false;

  timerValues$!: Observable<{ minutes: number; seconds: number; timer: number }>;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  emailConfig = FormInputConfigHelper.email({
    id: FormFieldId.EMAIL,
    label: FormFieldLabel.EMAIL
  });

  constructor(
    private authenticationService: AuthenticationService,
    private timerService: TimerService
  ) { }


  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToTimer();
  }



  initializeForm(): void {
    this.passResetReqFormGroup = this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.email])
    });
  }

  subscribeToTimer(): void {
    this.timerValues$ = this.timerService.timeValues$.pipe(
      startWith({ minutes: 0, seconds: 0, timer: 0 })
    );
  }

  computeDisplayedSeconds(seconds: number): string {
    return seconds.toString().padStart(2, '0');
  }

  submitForm(): void {
    if (this.passResetReqFormGroup.invalid) return;

    const email = this.passResetReqFormGroup.get('email')!.value;
    const payload: RequestPassResetPayload = { email };

    this.toggleLoader(true);

    this.authenticationService.requestPassReset(payload).pipe(finalize(() => this.toggleLoader(false))).subscribe({
      next: ({ success, message }: APIResponse<boolean>) => {
        this.passResetReqFormGroup.reset();
        if (success) {
          this.timerService.setTimer();
          this.showDialog(message, IconStat.success);
        }
      }
    });
  }

  toggleLoader(isActive: boolean): void {
    this.loaderIsActive = isActive;
  }

  showDialog(message: string, icon: IconStat): void {
    const dialogData: InfoDialogData = { infoMessage: message, statusIcon: icon };
    this.dialog.open(InfoDialogComponent, { data: dialogData, backdropClass: 'blurred' });
  }

  ngOnDestroy(): void {
    this.timerService.clearTimer();
  }

  get emailControl() {
    return this.passResetReqFormGroup.get('email');
  }

}
