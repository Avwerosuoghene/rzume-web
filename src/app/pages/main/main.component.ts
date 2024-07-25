import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { RouterModules } from '../../core/modules/router-modules';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HeaderComponent, SideBarComponent, RouterModules],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
