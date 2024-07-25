import { Route } from "@angular/router";
import {  MainRoutes } from "../../core/models/enums/application-routes-enums";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ProfileManagementComponent } from "./profile-management/profile-management.component";

export const mainSectionRoutes: Array<Route> = [
  { path: '', redirectTo: MainRoutes.dashboard, pathMatch: "full" },
  { path: MainRoutes.dashboard, component: DashboardComponent },
  { path: MainRoutes.profileManagement, component: ProfileManagementComponent },
]
