import { Routes } from '@angular/router';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { authenticationRoutes } from './pages/authentication/authentication-routes';
import { MainComponent } from './pages/main/main.component';
import {  RootRoutes } from './core/models/enums/application-routes-enums';

export const routes: Routes = [
  { path: '', redirectTo: `${RootRoutes.auth}`, pathMatch: "full" },
  {

    path: `${RootRoutes.auth}`, component: AuthenticationComponent, children: authenticationRoutes,


  },
  { path: `${RootRoutes.main}`, component: MainComponent }
];
