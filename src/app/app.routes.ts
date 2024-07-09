import { Routes } from '@angular/router';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { authenticationRoutes } from './pages/authentication/authentication-routes';
import { MainComponent } from './pages/main/main.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: "full" },
  {

    path: 'auth', component: AuthenticationComponent, children: authenticationRoutes,


  },
  { path: 'main', component: MainComponent }
];
