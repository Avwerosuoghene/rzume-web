import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { IErrorResponse } from '../../../core/models/interface/errors-interface';
import { IAPIResponse, IValidateUserResponse } from '../../../core/models/interface/api-response-interface';
import { SessionStorageUtil } from '../../../core/services/session-storage-util.service';
import { SessionStorageData } from '../../../core/models/enums/sessionStorage-enums';
import { ButtonTxt, EmailValMsg, EmailValidHeaderMsg, GenericMsg, IconStat, QueryParams } from '../../../core/models/enums/ui-enums';
import { AuthRoutes, RootRoutes } from '../../../core/models/enums/application-routes-enums';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { InfoDialogData } from '../../../core/models/interface/dialog-models-interface';

@Component({
  selector: 'app-email-confirmation',
  standalone: true,
  imports: [MatButtonModule, CircularLoaderComponent],
  templateUrl: './email-confirmation.component.html',
  styleUrl: './email-confirmation.component.scss'
})
export class EmailConfirmationComponent {
  private route = inject(ActivatedRoute);
  emailValidationHeader: EmailValidHeaderMsg = EmailValidHeaderMsg.confirm;
  emailValidMsg: string = EmailValMsg.confirm;
  emailValidationBtnTxt: ButtonTxt = ButtonTxt.resendValidation;
  loaderIsActive: boolean = false;
  router = inject(Router);


  constructor(private authService: AuthenticationService, private dialog: MatDialog) {

  }

  ngOnInit() {

    this.route.queryParamMap.subscribe((params) => {
      const tokenValue: string | null = params.get(QueryParams.token);

      if (tokenValue) this.validateUser(tokenValue);
    });
  }

  validateUser(tokenValue: string): void {
    this.loaderIsActive = true;
    this.emailValidationHeader = EmailValidHeaderMsg.validating;
    this.emailValidMsg = EmailValMsg.validating;



    this.authService.validateToken(tokenValue).subscribe({
      next: (response: IAPIResponse<IValidateUserResponse>) => {
        const responseContent = response.result;
        this.loaderIsActive = false;
        if (responseContent.content.user) {
          this.emailValidationHeader = EmailValidHeaderMsg.validated;
          this.emailValidMsg = responseContent.message;
          this.emailValidationBtnTxt = ButtonTxt.continue;
          SessionStorageUtil.setItem(SessionStorageData.authToken,response.result.content.token!);
          SessionStorageUtil.setItem(SessionStorageData.userData,response.result.content.user!);
          return
        }

        this.emailValidMsg = responseContent.message;
        this.emailValidationHeader = EmailValidHeaderMsg.error;
      },
      error: (error: any) => {
        const errorMsg = error.errorMessages[0];
        this.loaderIsActive = false;
        this.emailValidationHeader = EmailValidHeaderMsg.error;
        this.emailValidMsg = errorMsg;
      }
    })

  }

  performValidationBtnAction(): void {
    this.emailValidationBtnTxt === ButtonTxt.resendValidation ? this.sendAccountValidationMail() : this.navigateOut(`/${RootRoutes.auth}/${AuthRoutes.onboard}`);
  }

  sendAccountValidationMail(): void {

    this.loaderIsActive = true;
    const email =  SessionStorageUtil.getItem(SessionStorageData.userMail);
    if (!email) this.openErrorDialog();
    this.authService.generateToken(email!).subscribe({
      next: (response: IAPIResponse<string>) => {
        this.loaderIsActive = false;
        if (response.isSuccess) {
          this.emailValidMsg =  response.result.message;


        }

      },
      error: (error: IErrorResponse) => {
        this.loaderIsActive = false;
        this.emailValidMsg =  error.errorMessage;
      }
    })
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
    return
  }





  navigateOut(navigationRoute: string) {
    this.router.navigate([navigationRoute]);

  }
}
