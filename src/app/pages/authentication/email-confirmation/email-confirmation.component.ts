import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { SessionStorageUtil } from '../../../core/helpers/session-storage.util';
import { AuthRoutes, RootRoutes } from '../../../core/models/enums/application.routes.enums';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { InfoDialogData } from '../../../core/models/interface/dialog-models-interface';
import { APIResponse, BTN_CONTINUE, BTN_RESEND_VALIDATION, EMAIL_CONFIRM_HEADER, EMAIL_CONFIRM_MSG, EMAIL_VALIDATED_HEADER, EMAIL_VALIDATING_HEADER, EMAIL_VALIDATING_MSG, EMAIL_VALIDATION_ERROR_HEADER, ErrorResponse, IconStat, MSG_EXPIRED_SESSION, QUERY_TOKEN, SessionStorageKeys, ValidateUserResponse } from '../../../core/models';

@Component({
  selector: 'app-email-confirmation',
  standalone: true,
  imports: [MatButtonModule, CircularLoaderComponent],
  templateUrl: './email-confirmation.component.html',
  styleUrl: './email-confirmation.component.scss'
})
export class EmailConfirmationComponent {
  private route = inject(ActivatedRoute);
  emailValidationHeader = EMAIL_CONFIRM_HEADER;
  emailValidMsg: string = EMAIL_CONFIRM_MSG;
  emailValidationBtnTxt = BTN_RESEND_VALIDATION;
  loaderIsActive: boolean = false;
  router = inject(Router);


  constructor(private authService: AuthenticationService, private dialog: MatDialog) {

  }

  ngOnInit() {

    this.route.queryParamMap.subscribe((params) => {
      const tokenValue: string | null = params.get(QUERY_TOKEN);

      if (tokenValue) this.validateUser(tokenValue);
    });
  }

  validateUser(tokenValue: string): void {
    this.loaderIsActive = true;
    this.emailValidationHeader = EMAIL_VALIDATING_HEADER;
    this.emailValidMsg = EMAIL_VALIDATING_MSG;



    this.authService.validateToken(tokenValue).subscribe({
      next: ({success, message,data}: APIResponse<ValidateUserResponse>) => {
        this.loaderIsActive = false;
        if (success) {
          this.emailValidationHeader = EMAIL_VALIDATED_HEADER;
          this.emailValidMsg = message;
          this.emailValidationBtnTxt = BTN_CONTINUE;
          SessionStorageUtil.setItem(SessionStorageKeys.authToken,data?.token!);
          return;
        }

        this.emailValidMsg = message;
        this.emailValidationHeader = EMAIL_VALIDATION_ERROR_HEADER;
      },
      error: (error: any) => {

        const errorMsg = error.errorMessage? error.errorMessage: error.errorMessages[0]?error.errorMessages[0]: 'Something went wrong';
        this.loaderIsActive = false;
        this.emailValidationHeader = EMAIL_VALIDATION_ERROR_HEADER;
        this.emailValidMsg = errorMsg;
      }
    })

  }

  performValidationBtnAction(): void {
    this.emailValidationBtnTxt === BTN_RESEND_VALIDATION ? this.sendAccountValidationMail() : this.navigateOut(`/${RootRoutes.auth}/${AuthRoutes.onboard}`);
  }

  sendAccountValidationMail(): void {

    this.loaderIsActive = true;
    const email =  SessionStorageUtil.getItem(SessionStorageKeys.userMail);
    if (!email) this.openErrorDialog();
    this.authService.generateToken(email!).subscribe({
      next: ({success, message }: APIResponse<string>) => {
        this.loaderIsActive = false;
        if (success) {
          this.emailValidMsg =  message;


        }

      },
      error: (error: ErrorResponse) => {
        this.loaderIsActive = false;
        this.emailValidMsg =  error.errorMessage;
      }
    })
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
    return
  }





  navigateOut(navigationRoute: string) {
    this.router.navigate([navigationRoute]);

  }
}
