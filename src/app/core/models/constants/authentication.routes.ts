import { Route } from "@angular/router";
import { AuthRoutes } from "../enums/application.routes.enums";
import { LoginRedirectGuard } from "../../guards/login-redirect.guard";

export const authenticationRoutes: Array<Route> = [
  {path:'', redirectTo:AuthRoutes.signin,  pathMatch: "full" },
  {
    path: AuthRoutes.signup,
    canActivate: [LoginRedirectGuard],
    loadComponent: () => import("../../../pages/authentication/signup/signup.component")
      .then(m => m.SignupComponent)
  },
  {
    path: AuthRoutes.signin,
    canActivate: [LoginRedirectGuard],
    loadComponent: () => import("../../../pages/authentication/login/login.component")
      .then(m => m.LoginComponent)
  },
  {
    path: AuthRoutes.onboard,
    loadComponent: () => import("../../../pages/authentication/onboard/onboard.component")
      .then(m => m.OnboardComponent)
  },
  {
    path: AuthRoutes.passwordReset,
    loadComponent: () => import("../../../pages/authentication/password-reset/password-reset.component")
      .then(m => m.PasswordResetComponent)
  },
  {
    path: AuthRoutes.forgotPass,
    loadComponent: () => import("../../../pages/authentication/request-password-reset/request-password-reset.component")
      .then(m => m.RequestPasswordResetComponent)
  },
  {
    path: AuthRoutes.emailConfirmation,
    loadComponent: () => import("../../../pages/authentication/email-confirmation/email-confirmation.component")
      .then(m => m.EmailConfirmationComponent)
  },
]
