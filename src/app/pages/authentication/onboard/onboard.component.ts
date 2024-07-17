import { Component, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { Router } from '@angular/router';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { CoreModules } from '../../../core/modules/core-modules';
import { ProfileManagementService } from '../../../core/services/profile-management.service';
import {  IOnboardUserPayload } from '../../../core/models/interface/profile-management-interface';
import { SessionStorageData } from '../../../core/models/enums/sessionStorage-enums';
import { SessionStorageUtil } from '../../../core/services/session-storage-util.service';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { GenericMsg, IconStat } from '../../../core/models/enums/ui-enums';
import { InfoDialogData } from '../../../core/models/interface/dialog-models-interface';
import { RootRoutes, AuthRoutes } from '../../../core/models/enums/application-routes-enums';
import { IAPIResponse } from '../../../core/models/interface/api-response-interface';
import { IErrorResponse } from '../../../core/models/interface/errors-interface';
import { IOnboardUserFirstStagePayload } from '../../../core/models/interface/api-requests-interface';

@Component({
  selector: 'app-onboard',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, CircularLoaderComponent],
  templateUrl: './onboard.component.html',
  styleUrl: './onboard.component.scss'
})
export class OnboardComponent {
  onboardFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  loaderIsActive: boolean = false;
  router = inject(Router);


  constructor(private profileMgmtService: ProfileManagementService, private dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.initializeOnBoardForm();
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

  submitOnboardForm() {
    if (this.onboardFormGroup.invalid) {
      return;
    }
    const email = SessionStorageUtil.getItem(SessionStorageData.userMail);
    const userName: string = this.onboardFormGroup.get('username')!.value;
    if (!email) return this.openErrorDialog();
    const onBoardUserPayload : IOnboardUserPayload<IOnboardUserFirstStagePayload> = this.generateOnBoardPayload(userName, email!);
    this.loaderIsActive = true;

    this.profileMgmtService.onboard(onBoardUserPayload).subscribe({
      next: (onboardResponse:  IAPIResponse<boolean>) => {
        this.loaderIsActive = false;
        this.onboardFormGroup.reset();
        if (onboardResponse.isSuccess) {
          this.navigateOut(`/${RootRoutes.main}`);
          return
        }

      },
      error: (error: IErrorResponse) => {
        this.loaderIsActive = false;


      }
    });

  }

  openErrorDialog() {
    const dialogData: InfoDialogData = {
      infoMessage: GenericMsg.expiredSession,
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

  generateOnBoardPayload(userName: string, userMail: string): IOnboardUserPayload<IOnboardUserFirstStagePayload> {
    return {
      onBoardingStage: 0,
      onboardUserPayload: {
        userName
      },
      userMail
    }
  }

}
