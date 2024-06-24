import { Component } from '@angular/core';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { routerModules } from './shared/shared-imports';

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
