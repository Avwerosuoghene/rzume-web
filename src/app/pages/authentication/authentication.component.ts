import { Component, inject } from '@angular/core';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { RouterModules } from '../../core/modules/router-modules';
import { fadeInOutAnimation } from '../../core/animations/fade-in-out-animation';
import { FadeInOut } from '../../core/models/types';


@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [RouterModules, SignupComponent, LoginComponent, PasswordResetComponent],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss',
  animations: [fadeInOutAnimation]
})
export class AuthenticationComponent {

  animationState: FadeInOut = 'close';

  ngOnInit() {
    this.runOnInitAnimations();
  }

  runOnInitAnimations() {
    setTimeout(() => {
      this.animationState = 'open';
    }, 0);
  }

}
