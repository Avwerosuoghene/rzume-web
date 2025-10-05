import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { CoreModules } from '../../../core/modules/core-modules';
import { MatDialog } from '@angular/material/dialog';
import { PasswordUtility, FormValidationUtil } from '../../../core/helpers';
import { RouterModules } from '../../../core/modules/router-modules';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { Router } from '@angular/router';
import { AuthRoutes, RootRoutes } from '../../../core/models/enums/application.routes.enums';
import { SessionStorageUtil } from '../../../core/helpers/session-storage.util';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { GoogleSignInComponent } from '../../../components/google-sign-in/google-sign-in.component';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { IconStat, SessionStorageKeys } from '../../../core/models/enums/shared.enums';
import { APIResponse, ErrorResponse, PasswordVisibility, SigninResponse, AuthRequest, GOOGLE_SIGNIN_BUTTON_TEXT, InfoDialogData } from '../../../core/models';
import { OnboardingStages } from '../../../core/models/enums/profile.enum';
import { RoutingUtilService } from '../../../core/services/routing-util.service';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, RouterModules, CircularLoaderComponent, GoogleSignInComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @ViewChild('googleBtn', { static: false }) googleBtn!: ElementRef;
  @ViewChild(GoogleSignInComponent) googleButtonComponent!: GoogleSignInComponent;

  loginFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  readonly dialog: MatDialog = inject(MatDialog);
  passwordVisibility: PasswordVisibility = PasswordVisibility.password;
  loaderIsActive: boolean = false;
  router = inject(Router);
  signUpRoute = `/${RootRoutes.auth}/${AuthRoutes.signup}`
  forgotPassRoute = `/${RootRoutes.auth}/${AuthRoutes.forgotPass}`;
  GOOGLE_SIGNIN_BUTTON_TEXT = GOOGLE_SIGNIN_BUTTON_TEXT;


  constructor(private authService: AuthenticationService, private googleAuthService: GoogleAuthService, private routingUtilService: RoutingUtilService) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  triggerGoogleSignin() {
    this.googleButtonComponent.initiateGoogleSignup();
  }

  getFormElement(controlName: string) {
    return this.loginFormGroup.get(controlName);
  }

  isBtnDisabled(): boolean {
    return (this.loginFormGroup.invalid ||
      this.loaderIsActive);
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


  initializeForm(): void {
    this.loginFormGroup = this.fb.group({
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
      rememberMe: this.fb.control(false),
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisibility = PasswordUtility.toggleVisibility(this.passwordVisibility);
  }


  submitLoginForm() {
    if (this.loginFormGroup.invalid) {
      return;
    }
    this.toggleLoader(true);

    const userMail: string = this.getFormElement('email')?.value;
    const password: string = this.getFormElement('password')?.value;
    const loginPayload: AuthRequest = this.generateLoginPayload(userMail, password);
    this.authService.login(loginPayload).subscribe({
      next: (response: APIResponse<SigninResponse>) => this.handleSignInSuccess(response, userMail),
      error: (error: ErrorResponse) => this.handleSignInError(error)

    });
  }

  handleSignInSuccess(response: APIResponse<SigninResponse>, userMail: string): void {
    this.toggleLoader(false);
    this.loginFormGroup.reset();

    if (response.success && response.data) {
      this.processSigninContent(response.data, userMail);
      return;
    }

    this.showDialog({
      infoMessage: response.message,
      statusIcon: IconStat.failed
    });
  }

  private shouldRedirectToOnboard(stage: number): boolean {
    return stage < OnboardingStages.BasicInfoCompleted;
  }

  processSigninContent(signinData: SigninResponse, userMail: string): void {
    if (!signinData.user) {
      this.handleMissingUser(userMail);
      return;
    }

    this.saveAuthToken(signinData.token!);

    if (this.shouldRedirectToOnboard(signinData.user.onBoardingStage)) {
      this.routingUtilService.navigateToAuth(AuthRoutes.onboard);
      return;
    }

    this.routingUtilService.navigateToMain();
  }

  saveAuthToken(token: string): void {
    SessionStorageUtil.setItem(SessionStorageKeys.authToken, token);
  }


  handleMissingUser(userMail: string): void {
    SessionStorageUtil.setItem(SessionStorageKeys.userMail, userMail);
    this.routingUtilService.navigateToAuth(AuthRoutes.emailConfirmation);
  }

  showDialog(dialogData: InfoDialogData) {
    this.dialog.open(InfoDialogComponent, {
      data: dialogData,
      backdropClass: "blurred"
    });
  }

  handleSignInError(error: ErrorResponse) {
    this.toggleLoader(false);
  }

  generateLoginPayload(userMail: string, password: string): AuthRequest {
    return { email: userMail, password: password };
  }

  navigateOut(navigationRoute: string) {
    this.router.navigate([navigationRoute]);
  }


  toggleLoader(isActive: boolean) {
    this.loaderIsActive = isActive;
  }

  getFieldError(fieldName: string): string {
    return FormValidationUtil.getFieldError(this.loginFormGroup, fieldName);
  }
}
