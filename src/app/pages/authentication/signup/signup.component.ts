import { ChangeDetectionStrategy, Component, Signal, ViewChild, WritableSignal, computed, inject, signal } from '@angular/core';
import { FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { angularMaterialModules } from '../../../core/modules/material-modules';
import { CommonModule } from '@angular/common';
import { PasswordCriteria } from '../../../core/helpers/constants';
import { PasswordStrengthCheckerComponent } from '../../../components/password-strength-checker/password-strength-checker.component';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [angularMaterialModules, ReactiveFormsModule, FormsModule, CommonModule, PasswordStrengthCheckerComponent, RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent {
  signupFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  termsChecked: boolean = false

  @ViewChild(PasswordStrengthCheckerComponent) passwordCheckerComp!: PasswordStrengthCheckerComponent;

  ngOnInit(): void {
    this.initializeSignupForm();
  }

  validatePassword(): void {
    this.passwordCheckerComp.checkPasswordStrength(this.signupFormGroup.get('password')?.value);
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
          Validators.required
        ]
      }),
    })
  }

  openTermsAndConditionsDialog(): void{

  }

  openPrivacyDialog(): void{
    console.log('yes')
  }



}
