import { Component } from '@angular/core';
import { RouterModules } from '../../../core/modules/router-modules';
import { MainRoutes, RootRoutes } from '../../../core/models/enums/application-routes-enums';
import { MainComponent } from '../main.component';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [RouterModules],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  sideBarElements!: Array< {name: string, icon: string, route: string}>;

  ngOnInit(): void {
    this.initializeSideBarNavs();
  }

  initializeSideBarNavs(): void {
    this.sideBarElements = [
      {
        name: 'Dashboard',
        icon: 'assets/icons/dashboard-icon.png',
        route:`/${RootRoutes.main}/${MainRoutes.dashboard}`
      },
      {
        name: 'Profile',

        icon: 'assets/icons/user-profile-icon.png',
        route:`/${RootRoutes.main}/${MainRoutes.profileManagement}`
      },
    ]
  }

}
