import { Component, inject } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { CoreModules } from '../../../core/modules/core-modules';
import { MatDialog } from '@angular/material/dialog';
import { PasswordUtility } from '../../../core/helpers/password-utility';
import { PasswordVisibility } from '../../../core/models/types/ui-types';
import { RouterModules } from '../../../core/modules/router-modules';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { ISigninResponse, ISignupSiginPayload } from '../../../core/models/interface/authentication-interface';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { IAPIResponse, IErrorResponse } from '../../../core/models/interface/utilities-interface';

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


  constructor(private authService: AuthenticationService,) {

  }


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
    if (this.loginFormGroup.invalid) {
      return
    }
    const userMail: string = this.loginFormGroup.get('email')!.value;
    const password: string = this.loginFormGroup.get('password')!.value;
    this.loaderIsActive = true;
    const loginPayload: ISignupSiginPayload = {
      email: userMail,
      password: password
    };
    this.authService.login(loginPayload).subscribe({
      next: (response: IAPIResponse<ISigninResponse>) => {
        this.loaderIsActive = false;
        this.loginFormGroup.reset();
        console.log(response)
        // if (response.statusCode === 200) {

        //   this.navigateToDashboard();
        // }
      },
      error: (error: IErrorResponse) => {
        const errorMsg = error.errorMessages[0];
        this.loaderIsActive = false;
        console.log(errorMsg)

      }
    })

  }

  navigateToDashboard() {
    console.log('dasboard')
  }

}







