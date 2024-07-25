import { Component } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules/material-modules';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AngularMaterialModules],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
