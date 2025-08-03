import { Route } from "@angular/router";
import { LoginComponent } from "../../../pages/authentication/login/login.component";
import { PasswordResetComponent } from "../../../pages/authentication/password-reset/password-reset.component";
import { SignupComponent } from "../../../pages/authentication/signup/signup.component";
import { EmailConfirmationComponent } from "../../../pages/authentication/email-confirmation/email-confirmation.component";
import { OnboardComponent } from "../../../pages/authentication/onboard/onboard.component";
import { AuthRoutes } from "../enums/application.routes.enums";
import { RequestPasswordResetComponent } from "../../../pages/authentication/request-password-reset/request-password-reset.component";

export const authenticationRoutes: Array<Route> = [
  {path:'', redirectTo:AuthRoutes.signup,  pathMatch: "full" },
  {path: AuthRoutes.signup, component: SignupComponent},
  {path: AuthRoutes.signin, component: LoginComponent},
  {path: AuthRoutes.onboard, component: OnboardComponent},
  {path: AuthRoutes.passwordReset, component: PasswordResetComponent},
  {path: AuthRoutes.forgotPass, component: RequestPasswordResetComponent},
  {path: AuthRoutes.emailConfirmation, component: EmailConfirmationComponent},
]
