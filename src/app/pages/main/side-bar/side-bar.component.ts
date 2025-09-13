import { Component, Output, EventEmitter } from '@angular/core';
import { RouterModules } from '../../../core/modules/router-modules';
import { MainRoutes, RootRoutes } from '../../../core/models/enums/application.routes.enums';
import { MainComponent } from '../main.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModules, MatIconModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  @Output() closeSidebar = new EventEmitter<void>();
  sideBarElements!: Array< {name: string, icon: string, route: string}>;

  ngOnInit(): void {
    this.initializeSideBarNavs();
  }

  onClose(): void {
    this.closeSidebar.emit();
  }

  initializeSideBarNavs(): void {
    this.sideBarElements = [
      {
        name: 'Dashboard',
        icon: 'assets/icons/dashboard-icon.png',
        route:`/${RootRoutes.main}/${MainRoutes.dashboard}`
      },
      // {
      //   name: 'Profile',

      //   icon: 'assets/icons/user-profile-icon.png',
      //   route:`/${RootRoutes.main}/${MainRoutes.profileManagement}`
      // },
    ]
  }

}
