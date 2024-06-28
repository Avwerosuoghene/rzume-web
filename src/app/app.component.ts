import { Component } from '@angular/core';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { routerModules } from './core/modules/router-modules';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [routerModules, AuthenticationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'rzume_web';


}
