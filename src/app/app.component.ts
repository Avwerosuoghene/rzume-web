import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterModules } from './core/modules/router-modules';
import { LoaderService } from './core/services/loader.service';
import { GlobalCircularLoaderComponent } from './components/global-circular-loader/global-circular-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModules, AsyncPipe, GlobalCircularLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(public loaderService: LoaderService) {}

}
