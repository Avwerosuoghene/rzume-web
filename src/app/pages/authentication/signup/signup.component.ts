import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { GoogleSignInComponent } from '../../../components/google-sign-in/google-sign-in.component';
import { PasswordStrengthCheckerComponent } from '../../../components';
import { AngularMaterialModules, CoreModules, RouterModules } from '../../../core/modules';
import { PasswordUtility, SessionStorageUtil } from '../../../core/helpers';
import { PasswordVisibility, RootRoutes, AuthRoutes, SignupSignInPayload, APIResponse, SignupResponse, ErrorResponse, USER_EMAIL_NOT_CONFIRMED_MSG, InfoDialogData, IconStat, GoogleSignInPayload, SigninResponse, SessionStorageKeys } from '../../../core/models';
import { AuthenticationService } from '../../../core/services';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, PasswordStrengthCheckerComponent, RouterModules, CircularLoaderComponent, GoogleSignInComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  @ViewChild(GoogleSignInComponent) googleButtonComponent!: GoogleSignInComponent;
  @ViewChild(PasswordStrengthCheckerComponent) passwordCheckerComp!: PasswordStrengthCheckerComponent;
  googleSignupText: string = "Signup with Google";

  signupFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  passwordStrength!: string;
  passwordVisibility: PasswordVisibility = 'password';
  loaderIsActive: boolean = false;
  signInRoute = `/${RootRoutes.auth}/${AuthRoutes.signin}`;

  router = inject(Router);

  constructor(private authService: AuthenticationService, private dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.initializeSignupForm();
  }



  triggerGoogleSignup() {
    this.googleButtonComponent.initiateGoogleSignup();
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
    this.loaderIsActive = true;
    const userMail: string = this.signupFormGroup.get('email')!.value;
    const signupPayload: SignupSignInPayload = this.generateSignUpPayload(userMail, this.signupFormGroup.get('password')!.value)
    this.authService.signup(signupPayload).subscribe({
      next: (response: APIResponse<SignupResponse>) => {
        this.loaderIsActive = false;
        this.resetSignupForm();
        if (response.statusCode === 200) {

          this.navigateToEmailValidationScreen(userMail);
        }
      },
      error: (error: ErrorResponse) => {
        let errorMsg = error.errorMessage;

        this.loaderIsActive = false;
        if (errorMsg === USER_EMAIL_NOT_CONFIRMED_MSG) return this.navigateToEmailValidationScreen(userMail);

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

  googleSignup(token: any) {
    this.googleButtonComponent.turnOffLoader();
    console.log(token);
  }

  handleCredentialResponse(response: any) {
    const googleSigninPayload: GoogleSignInPayload = { userToken: response.credential };
    this.authService.googleLogin(googleSigninPayload).subscribe({
      next: (response: APIResponse<SigninResponse>) => {

        this.loaderIsActive = false;
        this.googleButtonComponent.turnOffLoader();
        SessionStorageUtil.setItem(SessionStorageKeys.authToken, response.result.content.token!);
        if (response.isSuccess === true) this.navigateOut(`/${RootRoutes.main}`);

      },
      error: (error: ErrorResponse) => {
        this.loaderIsActive = false;
        this.googleButtonComponent.turnOffLoader();
        console.log(error);
      }
    })
  }

  navigateOut(navigationRoute: string) {
    this.router.navigate([navigationRoute]);
  }

  generateSignUpPayload(userMail: string, password: string): SignupSignInPayload {
    return {
      email: userMail,
      password: password
    }
  }

  navigateToEmailValidationScreen(userMail: string) {
    SessionStorageUtil.setItem(SessionStorageKeys.userMail, userMail);
    this.navigateOut(`/${RootRoutes.auth}/${AuthRoutes.emailConfirmation}`);
  }

  resetSignupForm() {
    this.signupFormGroup.reset();
  }


}
