import { Component, inject } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { CoreModules } from '../../../core/modules/core-modules';
import { MatDialog } from '@angular/material/dialog';
import { PasswordUtility } from '../../../core/helpers/password-utility';
import { PasswordVisibility } from '../../../core/models/types/ui-types';
import { RouterModules } from '../../../core/modules/router-modules';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { Router } from '@angular/router';
import { IErrorResponse } from '../../../core/models/interface/errors-interface';
import { IAPIResponse, ISigninResponse } from '../../../core/models/interface/api-response-interface';
import { AuthRoutes, RootRoutes } from '../../../core/models/enums/application-routes-enums';
import { SessionStorageUtil } from '../../../core/services/session-storage-util.service';
import { SessionStorageData } from '../../../core/models/enums/sessionStorage-enums';
import { onBoardStages } from '../../../core/models/enums/utility-enums';
import { ISignupSiginPayload } from '../../../core/models/interface/api-requests-interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, RouterModules, CircularLoaderComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  readonly dialog: MatDialog = inject(MatDialog);
  passwordVisibility: PasswordVisibility = 'password';
  loaderIsActive: boolean = false;
  router = inject(Router);
  signUpRoute = `/${RootRoutes.auth}/${AuthRoutes.signup}`
  forgotPassRoute = `/${RootRoutes.auth}/${AuthRoutes.forgotPass}`




  constructor(private authService: AuthenticationService,) {

  }


  ngOnInit(): void {
    this.initializeForm();
  }

  get email() {
    return this.loginFormGroup.get('email');
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
    })
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
    const loginPayload: ISignupSiginPayload = this.generateLoginPayload(userMail, password)
    this.authService.login(loginPayload).subscribe({
      next: (response: IAPIResponse<ISigninResponse>) => {
        this.loaderIsActive = false;
        this.loginFormGroup.reset();
        const signinResponseContent: ISigninResponse | undefined = response.result.content;
        if (signinResponseContent.user == null) {
          SessionStorageUtil.setItem(SessionStorageData.userMail, userMail);
          this.navigateOut(`/${RootRoutes.auth}/${AuthRoutes.emailConfirmation}`);
          return
        }
        SessionStorageUtil.setItem(SessionStorageData.userData, signinResponseContent.user);
        SessionStorageUtil.setItem(SessionStorageData.authToken, signinResponseContent.token!);
        if (signinResponseContent.user.onBoardingStage === onBoardStages.first) return this.navigateOut(`/${RootRoutes.auth}/${AuthRoutes.onboard}`);



        this.navigateOut(`/${RootRoutes.main}`);
      },
      error: (error: IErrorResponse) => {

        this.loaderIsActive = false;

      }
    });

  }

  generateLoginPayload(userMail: string, password: string): ISignupSiginPayload {
    return {
      email: userMail,
      password: password
    };
  }

  navigateOut(navigationRoute: string) {
    this.router.navigate([navigationRoute]);

  }





  navigateToDashboard() {
    console.log('dasboard')
  }

}







