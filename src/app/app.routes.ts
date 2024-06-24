import { Routes } from '@angular/router';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { authenticationRoutes } from './pages/authentication/authentication-routes';

export const routes: Routes = [{
  path: 'auth', component:AuthenticationComponent, children: authenticationRoutes
}];
