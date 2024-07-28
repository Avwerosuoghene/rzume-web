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

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [AngularMaterialModules, RouterModules, CircularLoaderComponent, CoreModules, PasswordStrengthCheckerComponent],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {
  activePasswordResetScreen: PassWordResetScreens = PassWordResetScreens.successScreen;
  resetPassFormGroup!: FormGroup;
  loaderIsActive: boolean = false;
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(NonNullableFormBuilder);
  passwordStrength!: string;
  passwordVisibility: PasswordVisibility = 'password';
  confirmPasswordVisibility: PasswordVisibility = 'password';
  tokenValue: string | null = null;
  @ViewChild(PasswordStrengthCheckerComponent) passwordCheckerComp!: PasswordStrengthCheckerComponent;
  passwordResetCompleteicon: StatusIcon = 'done';
  resetCompleteMessage: string = 'Request Completed'



  constructor(private profileMgmtService: ProfileManagementService) {

  }


  ngOnInit(): void {
    this.tokenValue = this.route.snapshot.paramMap.get('token');
    this.initializeForm();

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

  submitSignupForm() {

    if (this.resetPassFormGroup.invalid) {
      return
    }


  }


  isBtnDisabled(): boolean {
    return (this.resetPassFormGroup.invalid ||
      this.passwordStrength != 'Strong' ||
      this.loaderIsActive);
  }


}
