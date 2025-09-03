import { Component, inject, ViewChild } from '@angular/core';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordStrengthCheckerComponent } from '../../../components/password-strength-checker/password-strength-checker.component';
import { AngularMaterialModules, CoreModules, RouterModules } from '../../../core/modules';
import { APIResponse, AuthRoutes, ErrorResponse, PassWordResetScreens, PasswordVisibility, ResetPassword, RootRoutes, StatusIcon, ToggledPassword } from '../../../core/models';
import { PasswordStrengthResult, PasswordUtility } from '../../../core/helpers';
import { ProfileManagementService } from '../../../core/services';
import { PasswordStrength } from '../../../core/models/enums/password-strength.enum';

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
  passwordStrength!: PasswordStrengthResult;
  passwordVisibility: PasswordVisibility = PasswordVisibility.password;
  confirmPasswordVisibility: PasswordVisibility = PasswordVisibility.password;
  tokenValue: string | null = null;
  userMail: string | null = null;
  @ViewChild(PasswordStrengthCheckerComponent) passwordCheckerComp!: PasswordStrengthCheckerComponent;
  passwordResetCompleteIcon: StatusIcon = 'done';
  resetCompleteMessage: string = '';



  constructor(private profileManagementService: ProfileManagementService) {

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
    const passwordResetPayload: ResetPassword = {
      email: this.userMail!,
      password: this.password!.value,
      resetToken: this.tokenValue!
    }
    this.profileManagementService.resetPassword(passwordResetPayload).subscribe({
      next: ({success}: APIResponse<boolean>) => {
        this.loaderIsActive = false;
        this.resetPassFormGroup.reset();
        this.activePasswordResetScreen = PassWordResetScreens.successScreen;
        if (success) {
          this.passwordResetCompleteIcon = 'done';
          this.resetCompleteMessage = 'Password reset succesfully';
          return;

        }

        this.passwordResetCompleteIcon = 'close';
        this.resetCompleteMessage = 'Password reset failed';



      },
      error: (error: ErrorResponse) => {
        this.loaderIsActive = false;
        console.log(error.errorMessage);
        this.activePasswordResetScreen = PassWordResetScreens.successScreen;
        this.passwordResetCompleteIcon = 'close';
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
      this.passwordStrength.strength != PasswordStrength.STRONG ||
      this.loaderIsActive);
  }


}
