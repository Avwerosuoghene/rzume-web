import { Component } from '@angular/core';
import { RouterModules } from './core/modules/router-modules';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModules],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  checkUserSession() {

  }


}
