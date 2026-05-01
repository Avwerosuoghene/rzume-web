import { Component, inject, OnInit } from '@angular/core';
import {  ActivatedRoute } from '@angular/router';
import { RouterModules } from '../../core/modules/router-modules';
import { fadeInOutAnimation } from '../../core/animations/fade-in-out-animation';
import { FadeInOut } from '../../core/models/types';
import { AuthRoutes } from '../../core/models/enums/application.routes.enums';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [RouterModules, CommonModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss',
  animations: [fadeInOutAnimation]
})
export class AuthenticationComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private configService = inject(ConfigService);

  animationState: FadeInOut = 'close';
  landingPageUrl: string = '';

  async ngOnInit() {
    await this.configService.loadConfig();
    this.landingPageUrl = this.configService.landingPageUrl;
    this.runOnInitAnimations();
  }

  runOnInitAnimations() {
    setTimeout(() => {
      this.animationState = 'open';
    }, 0);
  }

  showAuthHeader(): boolean {
    const currentRoute = this.activatedRoute.snapshot.firstChild?.routeConfig?.path;
    return currentRoute === AuthRoutes.signin || currentRoute === AuthRoutes.signup;
  }
}
