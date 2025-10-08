import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AngularMaterialModules, CoreModules, RouterModules } from '../../../core/modules';
import { PasswordUtility, SessionStorageUtil, PasswordStrengthResult, FormInputConfigHelper } from '../../../core/helpers';
import { APIResponse, AuthRoutes, ErrorResponse, FormFieldId, FormFieldLabel, IconStat, PASSWORD_RESET_FAILED, PASSWORD_RESET_SUCCESS, PassWordResetScreens, PasswordVisibility, ResetPassword, RootRoutes, ToggledPassword } from '../../../core/models';
import { AuthenticationService } from '../../../core/services';
import { PasswordStrength } from '../../../core/models/enums/password-strength.enum';
import { RoutingUtilService } from '../../../core/services/routing-util.service';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { PasswordStrengthCheckerComponent } from '../../../components/password-strength-checker/password-strength-checker.component';
import { FormInputComponent } from '../../../components/form-input/form-input.component';
import { FormInputType, FormInputConfig } from '../../../core/models';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [AngularMaterialModules, RouterModules, CircularLoaderComponent, CoreModules, PasswordStrengthCheckerComponent, FormInputComponent],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {
  PassWordResetScreens = PassWordResetScreens;
  IconStat = IconStat;
  PasswordVisibility = PasswordVisibility; 
  ToggledPassword = ToggledPassword; 

  activePasswordResetScreen: PassWordResetScreens = PassWordResetScreens.formScreen;
  resetPassFormGroup!: FormGroup;
  loaderIsActive = false;

  passwordStrength!: PasswordStrengthResult;
  passwordVisibility: PasswordVisibility = PasswordVisibility.password;
  confirmPasswordVisibility: PasswordVisibility = PasswordVisibility.password;

  tokenValue: string | null = null;
  userMail: string | null = null;

  passwordResetCompleteIcon: IconStat = IconStat.success;
  resetCompleteMessage = '';

  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(NonNullableFormBuilder);
  @ViewChild(PasswordStrengthCheckerComponent) passwordCheckerComp!: PasswordStrengthCheckerComponent;

  destroy$ = new Subject<void>();

  passwordConfig = FormInputConfigHelper.password({
    id: FormFieldId.PASSWORD,
    label: FormFieldLabel.PASSWORD
  });
  
  confirmPasswordConfig = FormInputConfigHelper.password({
    id: FormFieldId.CONFIRM_PASSWORD,
    label: FormFieldLabel.CONFIRM_PASSWORD
  });

  constructor(private authenticationService: AuthenticationService, private routerService: RoutingUtilService) { }



  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToQueryParams();
  }

  subscribeToQueryParams(): void {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.tokenValue = params.get('token');
        this.userMail = params.get('email');
      });
  }

  initializeForm(): void {
    this.resetPassFormGroup = this.fb.group({
      password: this.fb.control('', [Validators.required]),
      confirmPassword: this.fb.control('', [Validators.required, PasswordUtility.passwordMatchValidator('password')])
    });

    this.password?.valueChanges.subscribe(() => this.confirmPassword?.updateValueAndValidity());
  }


  get password() {
    return this.resetPassFormGroup.get('password');
  }

  get confirmPassword() {
    return this.resetPassFormGroup.get('confirmPassword');
  }


  get isFormValid(): boolean {
    if (!this.tokenValue || !this.userMail) return false;

    const passwordsMatch = this.password?.value === this.confirmPassword?.value;
    const isPasswordStrong = this.passwordStrength?.strength === PasswordStrength.STRONG;

    return this.resetPassFormGroup.valid && passwordsMatch && isPasswordStrong;
  }

  validatePassword(): void {
    const passwordValue = this.password?.value;
    if (passwordValue) {
      this.passwordStrength = this.passwordCheckerComp.checkPasswordStrength(passwordValue);
    }
  }

  togglePasswordVisibility(toggledPass: ToggledPassword): void {
    this[toggledPass] = PasswordUtility.toggleVisibility(this[toggledPass]);
  }

  submitPasswordResetForm() {
    if (this.resetPassFormGroup.invalid) {
      return
    }

    const passwordResetPayload: ResetPassword = this.getPasswordResetPayload();
    this.toggleLoader(true);

    this.authenticationService.resetPassword(passwordResetPayload).pipe(finalize(() => this.toggleLoader(false))).subscribe({
      next: (response: APIResponse<boolean>) => this.handleResetSuccess(response),
      error: (error: ErrorResponse) => this.handleResetError(error)
    });

  }

  getPasswordResetPayload(): ResetPassword {
    return {
      email: this.userMail!,
      password: this.password!.value,
      resetToken: this.tokenValue!
    };
  }

  handleResetSuccess(response: APIResponse<boolean>): void {
    this.resetPassFormGroup.reset();
    this.activePasswordResetScreen = PassWordResetScreens.successScreen;

    this.passwordResetCompleteIcon = response.success ? IconStat.success : IconStat.failed;
    this.resetCompleteMessage = response.success ? PASSWORD_RESET_SUCCESS : PASSWORD_RESET_FAILED;
  }

  handleResetError(error: ErrorResponse): void {
    this.activePasswordResetScreen = PassWordResetScreens.successScreen;
    this.passwordResetCompleteIcon = IconStat.failed;
    this.resetCompleteMessage = error.errorMessage;
  }

  goBackToForm() {
    this.activePasswordResetScreen = PassWordResetScreens.formScreen;
    console.log(this.activePasswordResetScreen);
  }

  goToLogin() {
    this.routerService.navigateToAuth(AuthRoutes.signin);
  }



  isBtnDisabled(): boolean {
    return (this.resetPassFormGroup.invalid ||
      this.passwordStrength.strength != PasswordStrength.STRONG ||
      this.loaderIsActive);
  }

  toggleLoader(state: boolean): void {
    this.loaderIsActive = state;
  }

}
