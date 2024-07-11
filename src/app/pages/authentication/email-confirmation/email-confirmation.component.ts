import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';

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
  emailValidationBtnTxt : "Resend Validation" | "Continue" = "Resend Validation";
  loaderIsActive: boolean = false;

  constructor( private router: Router){

  }

  ngOnInit() {

    this.route.queryParamMap.subscribe((params) => {
      const tokenValue : string | null = params.get('token')
      if (tokenValue) this.validateUser(tokenValue);
    });
  }

  validateUser(tokenValue : string): void {
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
    this.emailValidationBtnTxt === "Resend Validation" ? this.sendAccountValidationMail():this.continueToDashBoard();
  }

  sendAccountValidationMail() : void {

  }

  continueToDashBoard(): void {

  }
}
