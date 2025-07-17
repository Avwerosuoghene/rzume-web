import { Component, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { AngularMaterialModules, CoreModules } from '../../../core/modules';
import { SessionStorageKeys, OnboardUserPayload, OnboardUserFirstStagePayload, APIResponse, RootRoutes, ErrorResponse, InfoDialogData, MSG_EXPIRED_SESSION, IconStat, AuthRoutes } from '../../../core/models';
import { ProfileManagementService } from '../../../core/services';
import { slideOutAnimation } from '../../../core/animations';
import { SessionStorageUtil } from '../../../core/helpers';

@Component({
  selector: 'app-onboard',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, CircularLoaderComponent],
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

  submitOnboardForm() {
    if (this.onboardFormGroup.invalid) {
      return;
    }
    const userToken = SessionStorageUtil.getItem(SessionStorageKeys.authToken);
    const userName: string = this.onboardFormGroup.get('username')!.value;
    if (!userToken) return this.openErrorDialog();
    const onBoardUserPayload: OnboardUserPayload<OnboardUserFirstStagePayload> = this.generateOnBoardPayload(userName, userToken!);
    this.loaderIsActive = true;

    this.profileMgmtService.onboard(onBoardUserPayload).subscribe({
      next: (onboardResponse: APIResponse<boolean>) => {
        this.loaderIsActive = false;
        this.onboardFormGroup.reset();
        if (onboardResponse.isSuccess) {

          this.navigateOut(`/${RootRoutes.main}`);
          return
        }

      },
      error: (error: ErrorResponse) => {
        this.loaderIsActive = false;


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

  generateOnBoardPayload(userName: string, token: string): OnboardUserPayload<OnboardUserFirstStagePayload> {
    return {
      onBoardingStage: 0,
      onboardUserPayload: {
        userName
      },
      userMail: '',
      token
    }
  }

}
