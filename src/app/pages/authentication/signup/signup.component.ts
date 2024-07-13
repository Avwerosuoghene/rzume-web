import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { PasswordStrengthCheckerComponent } from '../../../components/password-strength-checker/password-strength-checker.component';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { PasswordVisibility } from '../../../core/models/types/ui-types';
import { PasswordUtility } from '../../../core/helpers/password-utility';
import { RouterModules } from '../../../core/modules/router-modules';
import { CoreModules } from '../../../core/modules/core-modules';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { Router } from '@angular/router';
import { ISignupPayload, ISignupResponse } from '../../../core/models/interface/authentication-interface';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { IAPIResponse, IErrorResponse } from '../../../core/models/interface/utilities-interface';
import { IconStat } from '../../../core/models/enums/ui-enums';
import { UserExistingStatMsg } from '../../../core/models/enums/api-response-enums';
import { InfoDialogData } from '../../../core/models/interface/dialog-models-interface';



@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, PasswordStrengthCheckerComponent, RouterModules, CircularLoaderComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  signupFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  passwordStrength!: string;
  passwordVisibility: PasswordVisibility = 'password';
  loaderIsActive: boolean = false;

  @ViewChild(PasswordStrengthCheckerComponent) passwordCheckerComp!: PasswordStrengthCheckerComponent;


  router = inject(Router);

  constructor(private authService: AuthenticationService, private dialog: MatDialog) {

  }


  ngOnInit(): void {
    this.initializeSignupForm();
  }

  validatePassword(): void {
    this.passwordStrength = this.passwordCheckerComp.checkPasswordStrength(this.signupFormGroup.get('password')?.value);

  }

  togglePasswordVisibility(): void {
    this.passwordVisibility = PasswordUtility.toggleVisibility(this.passwordVisibility);

  }

  isDisabled(): boolean {
    return (this.signupFormGroup.invalid ||
      this.passwordStrength != 'Strong' ||
      this.loaderIsActive);
  }

  initializeSignupForm(): void {
    this.signupFormGroup = this.fb.group({
      email: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.email
        ]
      }),
      password: this.fb.control('', {
        validators: [
          Validators.required
        ]
      }),
      termsChecked: this.fb.control(false, {
        validators: [
          Validators.requiredTrue
        ]
      }),
    })
  }

  openTermsAndConditionsDialog(): void {

  }

  openPrivacyDialog(): void {
  }

  submitSignupForm() {

    if (this.signupFormGroup.invalid) {
      return
    }
    const userMail: string = this.signupFormGroup.get('email')!.value;
    this.loaderIsActive = true;
    const signupPayload: ISignupPayload = {
      email: userMail,
      password: this.signupFormGroup.get('password')!.value
    }
    this.authService.signup(signupPayload).subscribe({
      next: (response: IAPIResponse<ISignupResponse>) => {
        this.loaderIsActive = false;
        this.resetSignupForm();
        if (response.statusCode === 200) {

          this.navigateToEmailValidationScreen(userMail);
        }
      },
      error: (error: IErrorResponse) => {
        const errorMsg = error.errorMessages[0];
        this.loaderIsActive = false;
        if (errorMsg === UserExistingStatMsg.EmailConfirmedMsg) {
          const dialogData : InfoDialogData = {
            infoMessage: error.errorMessages[0]!,
            statusIcon: IconStat.failed
          }
          this.dialog.open(InfoDialogComponent, {
            data:dialogData,
            backdropClass: "blurred"
          });
          return
        }

        sessionStorage.setItem('userMail', userMail);
        this.navigateToEmailValidationScreen(userMail);
      }
    })

  }

  navigateToEmailValidationScreen(userMail: string) {
    sessionStorage.setItem('userMail', userMail);
    this.router.navigate(['/auth/email-confirmation']);
  }

  resetSignupForm() {
    this.signupFormGroup.reset();
  }


}
