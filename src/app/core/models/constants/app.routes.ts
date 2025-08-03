import { Routes } from '@angular/router';
import { AuthenticationComponent } from '../../../pages/authentication/authentication.component';
import { authenticationRoutes } from './authentication.routes';
import { MainComponent } from '../../../pages/main/main.component';
import { RootRoutes } from '../enums/application.routes.enums';
import { mainSectionRoutes } from '../../../pages/main/main-routes';
import { AuthGuardService } from '../../guards/auth.guard.service';
import { NotFoundComponent } from '../../../pages/empty/not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: `${RootRoutes.auth}`, pathMatch: "full" },
  {
    path: `${RootRoutes.auth}`, component: AuthenticationComponent, children: authenticationRoutes,
  },
  { path: `${RootRoutes.main}`, component: MainComponent, children: mainSectionRoutes, canActivate: [AuthGuardService] },
  { path: '**', component: NotFoundComponent }
];
