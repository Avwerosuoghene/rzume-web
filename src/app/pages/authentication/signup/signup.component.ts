import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { PasswordStrengthCheckerComponent } from '../../../components/password-strength-checker/password-strength-checker.component';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { PasswordVisibility } from '../../../core/models/types/ui-types';
import { PasswordUtility } from '../../../core/helpers/password-utility';
import { RouterModules } from '../../../core/modules/router-modules';
import { CoreModules } from '../../../core/modules/core-modules';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { Router } from '@angular/router';
import { ISignupPayload } from '../../../core/models/interface/authentication-interface';
import { AuthenticationService } from '../../../core/services/authentication.service';



@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, PasswordStrengthCheckerComponent, RouterModules, CircularLoaderComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  signupFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  readonly dialog: MatDialog = inject(MatDialog);
  passwordStrength!: string;
  passwordVisibility: PasswordVisibility = 'password';
  loaderIsActive: boolean = false;

  @ViewChild(PasswordStrengthCheckerComponent) passwordCheckerComp!: PasswordStrengthCheckerComponent;


  router = inject(Router);

  constructor(private authService: AuthenticationService){

  }


  ngOnInit(): void {
    this.initializeSignupForm();
  }

  validatePassword(): void {
    this.passwordStrength = this.passwordCheckerComp.checkPasswordStrength(this.signupFormGroup.get('password')?.value);

  }

  togglePasswordVisibility(): void {
    this.passwordVisibility = PasswordUtility.toggleVisibility(this.passwordVisibility);

  }

  isDisabled(): boolean {
    return (this.signupFormGroup.invalid ||
      this.passwordStrength === 'Weak' ||
      this.passwordStrength === 'nan' || this.loaderIsActive);
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
      const signupPayload : ISignupPayload = {
        email: this.signupFormGroup.get('email')!.value,
        password: this.signupFormGroup.get('email')!.value
      }
      this.authService.signup(signupPayload).subscribe({
        next: (response) => {
          this.loaderIsActive = false;
          console.log(response)
        },
        error: (error) => {
          this.loaderIsActive = false;
          console.log(error);
        }
      })

  }


}
