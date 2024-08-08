import { Component, ViewChild, inject } from '@angular/core';
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
import { AuthenticationService } from '../../../core/services/authentication.service';
import { ErrorMsges, IconStat } from '../../../core/models/enums/ui-enums';
import { UserExistingStatMsg } from '../../../core/models/enums/api-response-enums';
import { InfoDialogData } from '../../../core/models/interface/dialog-models-interface';
import { IErrorResponse } from '../../../core/models/interface/errors-interface';
import { SessionStorageUtil } from '../../../core/services/session-storage-util.service';
import { SessionStorageData } from '../../../core/models/enums/sessionStorage-enums';
import { IAPIResponse, ISigninResponse, ISignupResponse } from '../../../core/models/interface/api-response-interface';
import { AuthRoutes, RootRoutes } from '../../../core/models/enums/application-routes-enums';
import { ISignupSiginPayload } from '../../../core/models/interface/api-requests-interface';
import { slideOutAnimation } from '../../../core/animations/slide-in-out-animations';
import { fadeInOutAnimation } from '../../../core/animations/fade-in-out-animation';



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
  signInRoute = `/${RootRoutes.auth}/${AuthRoutes.signin}`;


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

  isBtnDisabled(): boolean {
    return (this.signupFormGroup.invalid ||
      this.passwordStrength != 'Strong' ||
      this.loaderIsActive);
  }

  isGoogleBtnDisabled (): boolean {
    return this.loaderIsActive;
  }

  get email() {
    return this.signupFormGroup.get('email');
  }

  get password() {
    return this.signupFormGroup.get('password');
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
    const signupPayload: ISignupSiginPayload = this.generateSignUpPayload(userMail, this.signupFormGroup.get('password')!.value)
    this.authService.signup(signupPayload).subscribe({
      next: (response: IAPIResponse<ISignupResponse>) => {
        this.loaderIsActive = false;
        this.resetSignupForm();
        if (response.statusCode === 200) {

          this.navigateToEmailValidationScreen(userMail);
        }
      },
      error: (error: IErrorResponse) => {
        let errorMsg = error.errorMessage;

        this.loaderIsActive = false;
        if (errorMsg === UserExistingStatMsg.EmailNotConfirmedMsg) return this.navigateToEmailValidationScreen(userMail);

          const dialogData: InfoDialogData = {
            infoMessage: errorMsg,
            statusIcon: IconStat.failed
          }
          this.dialog.open(InfoDialogComponent, {
            data: dialogData,
            backdropClass: "blurred"
          });



      }
    })

  }

  googleSignup(){

  }

  generateSignUpPayload(userMail: string, password: string): ISignupSiginPayload {
    return {
      email: userMail,
      password: password
    }
  }

  navigateToEmailValidationScreen(userMail: string) {
    SessionStorageUtil.setItem(SessionStorageData.userMail, userMail);
    this.router.navigate([`/${RootRoutes.auth}/${AuthRoutes.emailConfirmation}`]);
  }

  resetSignupForm() {
    this.signupFormGroup.reset();
  }


}
