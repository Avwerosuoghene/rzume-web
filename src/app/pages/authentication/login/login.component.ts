import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { CoreModules } from '../../../core/modules/core-modules';
import { MatDialog } from '@angular/material/dialog';
import { PasswordUtility } from '../../../core/helpers/password.util';
import { RouterModules } from '../../../core/modules/router-modules';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { Router } from '@angular/router';
import { AuthRoutes, RootRoutes } from '../../../core/models/enums/application.routes.enums';
import { SessionStorageUtil } from '../../../core/helpers/session-storage.util';
import { environment } from '../../../../environments/environment.development';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { GoogleSignInComponent } from '../../../components/google-sign-in/google-sign-in.component';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { InfoDialogData } from '../../../core/models/interface/dialog-models-interface';
import { IconStat, onBoardStages, SessionStorageKeys } from '../../../core/models/enums/shared.enums';
import { APIResponse, ErrorResponse, GoogleSignInPayload, PasswordVisibility, SigninResponse, SignupSignInPayload } from '../../../core/models';



declare let google: any;

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
  passwordVisibility: PasswordVisibility = 'password';
  loaderIsActive: boolean = false;
  router = inject(Router);
  signUpRoute = `/${RootRoutes.auth}/${AuthRoutes.signup}`
  forgotPassRoute = `/${RootRoutes.auth}/${AuthRoutes.forgotPass}`;
  googleSigninText: string = "Signin with Google";


  constructor(private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.initializeForm();

    GoogleAuthService.loadGoogleScript().then(() => {
      this.initializeGoogleSignIn();
    }).catch(err => {
      console.error('Google API script loading error:', err);
    });
  }

  get email() {
    return this.loginFormGroup.get('email');
  }


  triggerGoogleSignin() {
    this.googleButtonComponent.initiateGoogleSignup();
  }


  initializeGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      ux_mode: 'popup',
      callback: (response: any) => {
        this.handleCredentialResponse(response);
      },
    });
    this.setGoogleButtonDisplay();


    google.accounts.id.prompt();
  }

  setGoogleButtonDisplay() {
    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'filled_blue', size: 'large', shape: 'rectangle', height: '100%', width: document.getElementById("google_btn_container")?.offsetWidth, }
    );
  }

  testGoogleBtnClick() {
    if (this.googleBtn) {
      this.googleBtn.nativeElement.click();
    }
  }

  isBtnDisabled(): boolean {
    return (this.loginFormGroup.invalid ||
      this.loaderIsActive);
  }

  handleCredentialResponse(response: any) {
    const googleSigninPayload: GoogleSignInPayload = { userToken: response.credential };
    this.authService.googleLogin(googleSigninPayload).subscribe({
      next: (response: APIResponse<SigninResponse>) => {
        console.log(response)

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




  get password() {
    return this.loginFormGroup.get('password');
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
    const userMail: string = this.loginFormGroup.get('email')!.value;
    const password: string = this.loginFormGroup.get('password')!.value;
    this.loaderIsActive = true;
    const loginPayload: SignupSignInPayload = this.generateLoginPayload(userMail, password);
    this.authService.login(loginPayload).subscribe({
      next: (response: APIResponse<SigninResponse>) => {
        this.loaderIsActive = false;
        this.loginFormGroup.reset();
        if(response.isSuccess != true) {
          const dialogData : InfoDialogData = {
            infoMessage: response.errorMessages[0]?response.errorMessages[0]: 'An error occured',
            statusIcon: IconStat.failed
          }
          this.dialog.open(InfoDialogComponent, {
            data:dialogData,
            backdropClass: "blurred"
          });
          return;
        }
        const signinResponseContent: SigninResponse | undefined = response.result.content;
        if (signinResponseContent.user == null) {
          SessionStorageUtil.setItem(SessionStorageKeys.userMail, userMail);
          this.navigateOut(`/${RootRoutes.auth}/${AuthRoutes.emailConfirmation}`);
          return;
        }
        SessionStorageUtil.setItem(SessionStorageKeys.authToken, signinResponseContent.token!);
        if (signinResponseContent.user.onBoardingStage === onBoardStages.first) {
          return this.navigateOut(`/${RootRoutes.auth}/${AuthRoutes.onboard}`
          )};
        this.navigateOut(`/${RootRoutes.main}`);
      },
      error: (error: ErrorResponse) => {
        this.loaderIsActive = false;
      }
    });
  }

  generateLoginPayload(userMail: string, password: string): SignupSignInPayload {
    return { email: userMail, password: password };
  }

  navigateOut(navigationRoute: string) {
    this.router.navigate([navigationRoute]);
  }

  navigateToDashboard() {
    console.log('dashboard');
  }
}
