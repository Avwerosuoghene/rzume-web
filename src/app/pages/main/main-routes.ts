import { Route } from "@angular/router";
import {  MainRoutes } from "../../core/models/enums/application.routes.enums";

export const mainSectionRoutes: Array<Route> = [
  { path: '', redirectTo: MainRoutes.dashboard, pathMatch: "full" },
  {
    path: MainRoutes.dashboard,
    loadComponent: () => import("./dashboard/dashboard.component")
      .then(m => m.DashboardComponent)
  },
  {
    path: MainRoutes.profileManagement,
    loadComponent: () => import("./profile-management/profile-management.component")
      .then(m => m.ProfileManagementComponent)
  },
]
