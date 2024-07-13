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
      const tokenValue: string | null = params.get('token')
      if (tokenValue) this.validateUser(tokenValue);
    });
  }

  validateUser(tokenValue: string): void {
    this.loaderIsActive = true;
    this.emailValidationHeader = 'Validating';
    this.emailValidMsg = 'Please wait while your email is being validated';
    setTimeout(() => {
      this.loaderIsActive = false;
      this.emailValidationHeader = 'Email Confirmed';
      this.emailValidationBtnTxt = 'Continue';
      this.emailValidMsg = 'Your email has been validated. Kindly click continue to proceed to dashboard';

    }, 2000)

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
          const dialogData: InfoDialogData = {
            infoMessage: response.result.message,
            statusIcon: IconStat.success
          }
          this.dialog.open(InfoDialogComponent, {
            data: dialogData,
            backdropClass: "blurred"
          });
        }

      },
      error: (error: IErrorResponse) => {
        const errorMsg = error.errorMessages[0];
        this.loaderIsActive = false;
      }
    })
  }

  continueToDashBoard(): void {

  }
}
