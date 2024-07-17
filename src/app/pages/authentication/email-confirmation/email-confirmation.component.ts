import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import {  IValidateUser } from '../../../core/models/interface/authentication-interface';
import { IErrorResponse } from '../../../core/models/interface/errors-interface';
import { IAPIResponse } from '../../../core/models/interface/api-response-interface';
import { SessionStorageUtil } from '../../../core/services/session-storage-util.service';
import { SessionStorageData } from '../../../core/models/enums/sessionStorage-enums';
import { ButtonTxt, EmailValMsg, EmailValidHeaderMsg, Generic, QueryParams } from '../../../core/models/enums/ui-enums';

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
      next: (response: IAPIResponse<IValidateUser>) => {
        const responseContent = response.result;
        this.loaderIsActive = false;
        if (responseContent.content.user) {
          this.emailValidationHeader = EmailValidHeaderMsg.validated;
          this.emailValidMsg = responseContent.message;
          this.emailValidationBtnTxt = ButtonTxt.continue;
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
    this.emailValidationBtnTxt === ButtonTxt.resendValidation ? this.sendAccountValidationMail() : this.continueToDashBoard();
  }

  sendAccountValidationMail(): void {

    this.loaderIsActive = true;
    const email =  SessionStorageUtil.getItem(SessionStorageData.userMail);

    this.authService.generateToken(email!).subscribe({
      next: (response: IAPIResponse<string>) => {
        this.loaderIsActive = false;
        if (response.isSuccess) {
          this.emailValidMsg =  response.result.message;


        }

      },
      error: (error: IErrorResponse) => {
        this.loaderIsActive = false;
        this.emailValidMsg =  error.errorMessages[0];
      }
    })
  }

  continueToDashBoard(): void {

  }
}
