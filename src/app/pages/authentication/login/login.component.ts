import { Component, inject } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { CoreModules } from '../../../core/modules/core-modules';
import { MatDialog } from '@angular/material/dialog';
import { PasswordUtility } from '../../../core/helpers/password-utility';
import { PasswordVisibility } from '../../../core/models/ui-types';
import { RouterModules } from '../../../core/modules/router-modules';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, RouterModules],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  readonly dialog: MatDialog = inject(MatDialog);
  passwordVisibility: PasswordVisibility = 'password';




  ngOnInit(): void {
    this.initializeLoginForm();
  }


  initializeLoginForm(): void {
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
      })
    })
  }


  togglePasswordVisibility(): void {
    this.passwordVisibility = PasswordUtility.toggleVisibility(this.passwordVisibility);

  }

  submitLoginForm() {


  }

}







