import { Component, inject, ViewChild } from '@angular/core';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { CoreModules } from '../../../core/modules/core-modules';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { RouterModules } from '../../../core/modules/router-modules';
import { PassWordResetScreens } from '../../../core/models/enums/ui-enums';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileManagementService } from '../../../core/services/profile-management.service';
import { PasswordVisibility, StatusIcon, ToggledPassword } from '../../../core/models/types/ui-types';
import { PasswordStrengthCheckerComponent } from '../../../components/password-strength-checker/password-strength-checker.component';
import { PasswordUtility } from '../../../core/helpers/password-utility';
import { IResetPassword } from '../../../core/models/interface/api-requests-interface';
import { IAPIResponse } from '../../../core/models/interface/api-response-interface';
import { IErrorResponse } from '../../../core/models/interface/errors-interface';
import { AuthRoutes, RootRoutes } from '../../../core/models/enums/application-routes-enums';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [AngularMaterialModules, RouterModules, CircularLoaderComponent, CoreModules, PasswordStrengthCheckerComponent],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {
  activePasswordResetScreen: PassWordResetScreens = PassWordResetScreens.formScreen;
  resetPassFormGroup!: FormGroup;
  loaderIsActive: boolean = false;
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(NonNullableFormBuilder);
  passwordStrength!: string;
  passwordVisibility: PasswordVisibility = 'password';
  confirmPasswordVisibility: PasswordVisibility = 'password';
  tokenValue: string | null = null;
  userMail: string | null = null;
  @ViewChild(PasswordStrengthCheckerComponent) passwordCheckerComp!: PasswordStrengthCheckerComponent;
  passwordResetCompleteicon: StatusIcon = 'done';
  resetCompleteMessage: string = '';



  constructor(private profileMgmtService: ProfileManagementService) {

  }


  ngOnInit(): void {

    this.getTokenAndEmail()
    this.initializeForm();

  }

  getTokenAndEmail(): void {
    this.route.params.subscribe(params => {
      this.tokenValue = decodeURIComponent(params['token']);
      this.userMail = decodeURIComponent(params['email']);
    });
  }

  initializeForm(): void {
    this.resetPassFormGroup = this.fb.group({
      password: this.fb.control('', {
        validators: [
          Validators.required
        ]
      }),
      confirmPassword: this.fb.control('', {
        validators: [
          Validators.required, PasswordUtility.passwordMatchValidator('password')
        ]
      }),
    })
    this.password!.valueChanges.subscribe(() => {
      this.confirmPassword!.updateValueAndValidity();
    });
  }

  get confirmPassword() {
    return this.resetPassFormGroup.get('confirmPassword');
  }

  get password() {
    return this.resetPassFormGroup.get('password');
  }


  validatePassword(): void {
    this.passwordStrength = this.passwordCheckerComp.checkPasswordStrength(this.resetPassFormGroup.get('password')?.value);
  }

  togglePasswordVisibility(toggledPass: ToggledPassword): void {
    this[toggledPass] = PasswordUtility.toggleVisibility(this[toggledPass]);
  }

  submitPasswordResetForm() {

    if (this.resetPassFormGroup.invalid) {
      return
    }

    this.loaderIsActive = true;
    const passwordResetPayload: IResetPassword = {
      email: this.userMail!,
      password: this.password!.value,
      resetToken: this.tokenValue!
    }
    this.profileMgmtService.resetPassword(passwordResetPayload).subscribe({
      next: (passwordResetResponse: IAPIResponse<boolean>) => {
        this.loaderIsActive = false;
        this.resetPassFormGroup.reset();
        this.activePasswordResetScreen = PassWordResetScreens.successScreen;
        console.log(passwordResetResponse);
        if (passwordResetResponse.isSuccess == true) {
          this.passwordResetCompleteicon = 'done';
          this.resetCompleteMessage = 'Password reset succesfully';
          return;

        }

        this.passwordResetCompleteicon = 'close';
        this.resetCompleteMessage = 'Password reset failed';



      },
      error: (error: IErrorResponse) => {
        this.loaderIsActive = false;
        console.log(error.errorMessage);
        this.activePasswordResetScreen = PassWordResetScreens.successScreen;
        this.passwordResetCompleteicon = 'close';
        this.resetCompleteMessage = error.errorMessage;

      }
    });


  }

  goBackToForm() {
    this.activePasswordResetScreen = PassWordResetScreens.formScreen;
    console.log(this.activePasswordResetScreen);
  }

  goToLogin() {
    this.router.navigate([`/${RootRoutes.auth}/${AuthRoutes.signin}`]);

  }



  isBtnDisabled(): boolean {
    return (this.resetPassFormGroup.invalid ||
      this.passwordStrength != 'Strong' ||
      this.loaderIsActive);
  }


}
