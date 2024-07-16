import { Route } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { PasswordResetComponent } from "./password-reset/password-reset.component";
import { SignupComponent } from "./signup/signup.component";
import { EmailConfirmationComponent } from "./email-confirmation/email-confirmation.component";
import { OnboardComponent } from "./onboard/onboard.component";

export const authenticationRoutes: Array<Route> = [
  {path:'', redirectTo:'signup',  pathMatch: "full" },
  {path: 'signup', component: SignupComponent},
  {path: 'login', component: LoginComponent},
  {path: 'onboard', component: OnboardComponent},
  {path: 'password-reset', component: PasswordResetComponent},
  {path: 'email-confirmation', component: EmailConfirmationComponent},
]
