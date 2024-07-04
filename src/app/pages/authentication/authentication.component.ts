import { Component, inject } from '@angular/core';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { RouterModules } from '../../core/modules/router-modules';


@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [RouterModules,SignupComponent, LoginComponent, PasswordResetComponent, ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent {





}
