import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { IAPIResponse, IErrorResponse } from '../../../core/models/interface/utilities-interface';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogData } from '../../../core/models/interface/dialog-models-interface';
import { IconStat } from '../../../core/models/enums/ui-enums';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { IAccountValidationResponse, IValidateUser } from '../../../core/models/interface/authentication-interface';

@Component({
  selector: 'app-email-confirmation',
  standalone: true,
  imports: [MatButtonModule, CircularLoaderComponent],
  templateUrl: './email-confirmation.component.html',
  styleUrl: './email-confirmation.component.scss'
})
export class EmailConfirmationComponent {
  private route = inject(ActivatedRoute);
  emailValidationHeader: string = "Confirm Mail";
  emailValidMsg: string = "Kindly check your email for the validation link";
  emailValidationBtnTxt: "Resend Validation" | "Continue" = "Resend Validation";
  loaderIsActive: boolean = false;

  constructor(private authService: AuthenticationService, private dialog: MatDialog) {

  }

  ngOnInit() {

    this.route.queryParamMap.subscribe((params) => {
      const tokenValue: string | null = params.get('token');

      if (tokenValue) this.validateUser(tokenValue);
    });
  }

  validateUser(tokenValue: string): void {
    this.loaderIsActive = true;
    this.emailValidationHeader = 'Validating';
    this.emailValidMsg = 'Please wait while your email is being validated';



    this.authService.validateToken(tokenValue).subscribe({
      next: (response: IAPIResponse<IValidateUser>) => {
        const responseContent = response.result;
        this.loaderIsActive = false;
        if (responseContent.content.user) {
          this.emailValidationHeader = 'Email Confirmed';
          this.emailValidMsg = responseContent.message;
          this.emailValidationBtnTxt = 'Continue';
          return
        }

        this.emailValidMsg = responseContent.message;
        this.emailValidationHeader = "Error";
      },
      error: (error: any) => {
        const errorMsg = error.errorMessages[0];
        this.loaderIsActive = false;
        this.emailValidationHeader = 'Error';
        this.emailValidMsg = errorMsg;
      }
    })

  }

  performValidationBtnAction(): void {
    this.emailValidationBtnTxt === "Resend Validation" ? this.sendAccountValidationMail() : this.continueToDashBoard();
  }

  sendAccountValidationMail(): void {

    this.loaderIsActive = true;
    const email = sessionStorage.getItem('userMail');
    this.authService.generateToken(email!).subscribe({
      next: (response: IAPIResponse<string>) => {
        this.loaderIsActive = false;
        if (response.isSuccess) {
          this.emailValidMsg =  response.result.message;

          // const dialogData: InfoDialogData = {
          //   infoMessage: response.result.message,
          //   statusIcon: IconStat.success
          // }
          // this.dialog.open(InfoDialogComponent, {
          //   data: dialogData,
          //   backdropClass: "blurred"
          // });
        }

      },
      error: (error: IErrorResponse) => {
        this.loaderIsActive = false;
        this.emailValidMsg =  error.errorMessages[0];

        // const errorMsg = error.errorMessages[0];

      }
    })
  }

  continueToDashBoard(): void {

  }
}
