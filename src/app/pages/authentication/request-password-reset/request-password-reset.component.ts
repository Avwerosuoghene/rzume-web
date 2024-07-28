import { Component, inject, OnDestroy } from '@angular/core';
import { AuthRoutes, RootRoutes } from '../../../core/models/enums/application-routes-enums';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { CoreModules } from '../../../core/modules/core-modules';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { RouterModules } from '../../../core/modules/router-modules';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IRequestPassResetPayload } from '../../../core/models/interface/api-requests-interface';
import { ProfileManagementService } from '../../../core/services/profile-management.service';
import { IAPIResponse } from '../../../core/models/interface/api-response-interface';
import { IErrorResponse } from '../../../core/models/interface/errors-interface';
import { InfoDialogData } from '../../../core/models/interface/dialog-models-interface';
import { IconStat } from '../../../core/models/enums/ui-enums';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { Subscription } from 'rxjs';
import { TimerUtilityService } from '../../../core/helpers/timer-utility.service';

@Component({
  selector: 'app-request-password-reset',
  standalone: true,
  imports: [AngularMaterialModules, RouterModules, CircularLoaderComponent, CoreModules],
  templateUrl: './request-password-reset.component.html',
  styleUrl: './request-password-reset.component.scss'
})
export class RequestPasswordResetComponent implements OnDestroy {
  signUpRoute = `/${RootRoutes.auth}/${AuthRoutes.signup}`
  passResetReqFormGroup!: FormGroup;
  readonly dialog: MatDialog = inject(MatDialog);
  loaderIsActive: boolean = false;
  router = inject(Router);
  fb = inject(NonNullableFormBuilder);
  timerSubscription: Subscription | null = null;
  timerValues: { minutes: number, seconds: number, timer: number } = {
    minutes: 0, seconds: 0, timer: 0
  }


  constructor(private profileMgmtService: ProfileManagementService) {

  }


  ngOnInit(): void {
    this.initializeForm();
  }



  initializeForm(): void {
    this.passResetReqFormGroup = this.fb.group({
      email: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.email
        ]
      })
    })
  }

  setTimer() {
    TimerUtilityService.clearTimer();
    TimerUtilityService.setTimer();
    this.timerSubscription = TimerUtilityService.timeValues.subscribe(
      timeData => {
        this.timerValues.minutes = timeData.minutes;
        this.timerValues.seconds = timeData.seconds;
        this.timerValues.timer = timeData.timer
      }
    )
  }

  computeDisplayedSeconds(): string {
    return this.timerValues.seconds < 10 ? `0${this.timerValues.seconds.toString()}` : this.timerValues.seconds.toString();
  }

  submitForm() {
    if (this.passResetReqFormGroup.invalid) {
      return;
    }



    const email: string = this.passResetReqFormGroup.get('email')!.value;
    this.loaderIsActive = true;
    const requestPassResetPayload: IRequestPassResetPayload = {
      email
    }
    this.profileMgmtService.requestPassReset(requestPassResetPayload).subscribe({
      next: (requestPassResetResponse: IAPIResponse<boolean>) => {
        this.loaderIsActive = false;
        this.passResetReqFormGroup.reset();
        this.setTimer();
        if (requestPassResetResponse.isSuccess) {
          const dialogData: InfoDialogData = {
            infoMessage: requestPassResetResponse.result.message,
            statusIcon: IconStat.success
          }

          this.dialog.open(InfoDialogComponent, {
            data: dialogData,
            backdropClass: "blurred"
          });
        }


      },
      error: (error: IErrorResponse) => {
        this.loaderIsActive = false;


      }
    });

  }

  ngOnDestroy(): void {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
  }


}
