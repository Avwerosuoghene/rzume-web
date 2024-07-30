import { Component, inject, OnInit } from '@angular/core';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { CoreModules } from '../../../core/modules/core-modules';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  router = inject(Router);
  activeComponent: string = '';

  ngOnInit(): void {
    this.getCurrentRoute();
    this.subsrcibeToRoute();
  }

  getCurrentRoute(): void {
    const currentUrl = this.router.url;
    if (!currentUrl) return;

    const urlSplit = currentUrl.split('/');
    const activeElement = urlSplit[2].split('-');

    this.activeComponent = activeElement.join(' ');
  }

  subsrcibeToRoute(): void {


    this.router.events
      .subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.getCurrentRoute();

        }
      });
  }


}
