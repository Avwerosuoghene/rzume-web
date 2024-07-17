import { Route } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { PasswordResetComponent } from "./password-reset/password-reset.component";
import { SignupComponent } from "./signup/signup.component";
import { EmailConfirmationComponent } from "./email-confirmation/email-confirmation.component";
import { OnboardComponent } from "./onboard/onboard.component";
import { AuthRoutes } from "../../core/models/enums/application-routes-enums";

export const authenticationRoutes: Array<Route> = [
  {path:'', redirectTo:AuthRoutes.signup,  pathMatch: "full" },
  {path: AuthRoutes.signup, component: SignupComponent},
  {path: AuthRoutes.signin, component: LoginComponent},
  {path: AuthRoutes.onboard, component: OnboardComponent},
  {path: AuthRoutes.passwordReset, component: PasswordResetComponent},
  {path: AuthRoutes.emailConfirmation, component: EmailConfirmationComponent},
]
