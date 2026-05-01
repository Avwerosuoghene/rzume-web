import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-auth-mobile-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-mobile-content.component.html',
  styleUrl: './auth-mobile-content.component.scss'
})
export class AuthMobileContentComponent implements OnInit {
  private configService = inject(ConfigService);
  landingPageUrl: string = '';

  async ngOnInit() {
    await this.configService.loadConfig();
    this.landingPageUrl = this.configService.landingPageUrl;
  }
}
