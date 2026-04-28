import { Routes } from '@angular/router';
import { RootRoutes } from '../enums/application.routes.enums';
import { AuthGuardService } from '../../guards/auth.guard.service';

export const routes: Routes = [
  { path: '', redirectTo: `${RootRoutes.auth}`, pathMatch: "full" },
  {
    path: `${RootRoutes.auth}`,
    loadComponent: () => import('../../../pages/authentication/authentication.component')
      .then(m => m.AuthenticationComponent),
    loadChildren: () => import('./authentication.routes')
      .then(m => m.authenticationRoutes)
  },
  {
    path: `${RootRoutes.main}`,
    loadComponent: () => import('../../../pages/main/main.component')
      .then(m => m.MainComponent),
    loadChildren: () => import('../../../pages/main/main-routes')
      .then(m => m.mainSectionRoutes),
    canActivate: [AuthGuardService],
    data: { preload: true } // Preload main routes after login
  },
  {
    path: '**',
    loadComponent: () => import('../../../pages/empty/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];
