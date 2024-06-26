import { Component, inject } from '@angular/core';
import { SignupComponent } from './signup/signup.component';
import {  routerModules } from '../../shared/shared-imports';
import { LoginComponent } from './login/login.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';


@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [routerModules,SignupComponent, LoginComponent, PasswordResetComponent, ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent {





}
