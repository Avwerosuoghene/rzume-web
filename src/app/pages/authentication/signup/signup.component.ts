import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { AngularMaterialModules, CoreModules, RouterModules } from '../../../core/modules';
import { PasswordStrengthResult, PasswordUtility, SessionStorageUtil, FormInputConfigHelper } from '../../../core/helpers';
import { PasswordVisibility, RootRoutes, AuthRoutes, AuthRequest, APIResponse, SignupResponse, ErrorResponse, USER_EMAIL_NOT_CONFIRMED_MSG, InfoDialogData, IconStat, GoogleSignInPayload, SigninResponse, SessionStorageKeys, GOOGLE_SIGNIN_BUTTON_TEXT } from '../../../core/models';
import { AuthenticationService, GoogleAuthService } from '../../../core/services';
import { PasswordStrength } from '../../../core/models/enums/password-strength.enum';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { GoogleSignInComponent } from '../../../components/google-sign-in/google-sign-in.component';
import { PasswordStrengthCheckerComponent } from '../../../components';
import { FormInputComponent } from '../../../components/form-input/form-input.component';
import { FormFieldId, FormFieldLabel } from '../../../core/models/enums/form-input.enums';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, PasswordStrengthCheckerComponent, RouterModules, CircularLoaderComponent, GoogleSignInComponent, FormInputComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit, OnDestroy {
  @ViewChild(GoogleSignInComponent) googleButtonComponent!: GoogleSignInComponent;
  @ViewChild(PasswordStrengthCheckerComponent) passwordCheckerComp!: PasswordStrengthCheckerComponent;

  private destroy$ = new Subject<void>();
  private passwordInput$ = new Subject<void>();

  signupFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  passwordStrength: PasswordStrengthResult = { score: 0, strength: PasswordStrength.NONE };
  passwordVisibility: PasswordVisibility = PasswordVisibility.password;
  loaderIsActive: boolean = false;
  signInRoute = `/${RootRoutes.auth}/${AuthRoutes.signin}`;
  GOOGLE_SIGNIN_BUTTON_TEXT = GOOGLE_SIGNIN_BUTTON_TEXT;

  router = inject(Router);

  emailConfig = FormInputConfigHelper.email({
    id: FormFieldId.EMAIL,
    label: FormFieldLabel.EMAIL
  });

  passwordConfig = FormInputConfigHelper.password({
    id: FormFieldId.PASSWORD,
    label: FormFieldLabel.PASSWORD
  });

  constructor(private authService: AuthenticationService, private googleAuthService: GoogleAuthService, private dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.initializeSignupForm();
    this.setupPasswordValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupPasswordValidation(): void {
    const debounceDelay = 300;
  
    this.passwordInput$.pipe(
      debounceTime(debounceDelay),   
      takeUntil(this.destroy$)
    ).subscribe(() => {
      const password = this.signupFormGroup.get(PasswordVisibility.password)?.value ?? '';
      this.passwordStrength = this.passwordCheckerComp.checkPasswordStrength(password);
    });
  }


  triggerGoogleSignup() {
    this.googleButtonComponent.initiateGoogleSignup();
  }

  validatePassword(): void {
    this.passwordInput$.next();
  }

  togglePasswordVisibility(): void {
    this.passwordVisibility = PasswordUtility.toggleVisibility(this.passwordVisibility);
  }


  get isBtnDisabled(): boolean {
    const password = this.signupFormGroup.get(PasswordVisibility.password)?.value || '';
  
    return (
      this.signupFormGroup.invalid ||
      this.loaderIsActive ||
      this.passwordStrength.strength !== PasswordStrength.STRONG ||
      !password
    );
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

  submitSignupForm(): void {
    if (this.signupFormGroup.invalid) return;

    this.toggleLoader(true);

    const userMail = this.getFormElement('email')?.value ?? '';
    const password = this.getFormElement('password')?.value ?? '';
    const signupPayload = this.generateSignUpPayload(userMail, password);

    this.authService.signup(signupPayload).subscribe({
      next: (response) => this.handleSignupSuccess(response, userMail),
      error: (error) => this.handleSignupError(error, userMail),
    });
  }

  getFormElement(controlName: string) {
    return this.signupFormGroup.get(controlName);
  }


  handleSignupSuccess(response: APIResponse, userMail: string): void {
    this.toggleLoader(false);
    this.resetSignupForm();

    if (response.success) {
      this.navigateToEmailValidationScreen(userMail);
    }
  }

  handleSignupError(error: ErrorResponse, userMail: string): void {
    this.toggleLoader(false);

    if (error.errorMessage === USER_EMAIL_NOT_CONFIRMED_MSG) {
      this.navigateToEmailValidationScreen(userMail);
      return;
    }

    this.showErrorDialog(error.errorMessage);
  }

  showErrorDialog(message: string): void {
    const dialogData: InfoDialogData = {
      infoMessage: message,
      statusIcon: IconStat.failed,
    };

    this.dialog.open(InfoDialogComponent, {
      data: dialogData,
      backdropClass: "blurred",
    });
  }

  handleCredentialResponse(response: any) {
    this.googleAuthService.handleCredentialResponse(response, (success, token) => this.handleGoogleLoginSuccess(success, token), (error) => this.handleGoogleLoginError(error))
  }

  handleGoogleLoginSuccess(success: boolean, token?: string): void {
    this.toggleLoader(false);
    this.googleButtonComponent.toggleLoader(false);
    this.googleAuthService.handleGoogleAuthResponse(success, token);
  }

  handleGoogleLoginError(error: ErrorResponse): void {
    this.toggleLoader(false);
    this.googleButtonComponent.toggleLoader(false);
  }

  navigateOut(navigationRoute: string) {
    this.router.navigate([navigationRoute]);
  }

  generateSignUpPayload(userMail: string, password: string): AuthRequest {
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

  toggleLoader(isActive: boolean) {
    this.loaderIsActive = isActive;
  }

  

}
