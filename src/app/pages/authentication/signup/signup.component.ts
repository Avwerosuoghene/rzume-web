import { ChangeDetectionStrategy, Component, ViewChild,inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { PasswordStrengthCheckerComponent } from '../../../components/password-strength-checker/password-strength-checker.component';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../../../components/info-dialog/info-dialog.component';
import { PasswordVisibility } from '../../../core/models/ui-types';
import { PasswordUtility } from '../../../core/helpers/password-utility';
import { RouterModules } from '../../../core/modules/router-modules';
import { CoreModules } from '../../../core/modules/core-modules';



@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, PasswordStrengthCheckerComponent, RouterModules],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent {
  signupFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  readonly dialog: MatDialog = inject(MatDialog);
  passwordStrength!: string;
  passwordVisibility: PasswordVisibility = 'password';

  @ViewChild(PasswordStrengthCheckerComponent) passwordCheckerComp!: PasswordStrengthCheckerComponent;

  ngOnInit(): void {
    this.initializeSignupForm();
  }

  validatePassword(): void {
    this.passwordStrength = this.passwordCheckerComp.checkPasswordStrength(this.signupFormGroup.get('password')?.value);
  }

  togglePasswordVisibility(): void {
    this.passwordVisibility = PasswordUtility.toggleVisibility(this.passwordVisibility);

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

    this.dialog.open(InfoDialogComponent, {
      data: {
        infoMessage: ' Kindly click on the link shared with you to validate your email'
      },
      backdropClass: "blurred"
    });
  }



}
