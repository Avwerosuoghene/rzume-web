import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-email-confirmation',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './email-confirmation.component.html',
  styleUrl: './email-confirmation.component.scss'
})
export class EmailConfirmationComponent {
  private route = inject(ActivatedRoute);
  emailValidationHeader: string = "Confirm Mail";
  emailValidMsg: string = "Kindly check your email for the validation link";
  emailValidationBtnTxt : string = "Resend Validation"

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const tokenValue : string | null = params.get('token')
      if (tokenValue) this.validateUser(tokenValue);


    });
  }

  validateUser(tokenValue : string): void {
    this.emailValidationHeader = 'Validating Email';

  }

  performValidationBtnAction(): void {

  }
}
