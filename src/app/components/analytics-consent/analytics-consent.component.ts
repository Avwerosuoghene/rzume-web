import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AnalyticsService } from '../../core/services/analytics/analytics.service';

@Component({
  selector: 'app-analytics-consent',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  templateUrl: './analytics-consent.component.html',
  styleUrl: './analytics-consent.component.scss'
})
export class AnalyticsConsentComponent implements OnInit {
  showBanner = false;
  private readonly CONSENT_KEY = 'analytics_consent';

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.checkConsentStatus();
  }

  private checkConsentStatus(): void {
    const consent = localStorage.getItem(this.CONSENT_KEY);
    
    if (!consent) {
      setTimeout(() => {
        this.showBanner = true;
      }, 2000);
    }
  }

  acceptAnalytics(): void {
    localStorage.setItem(this.CONSENT_KEY, 'accepted');
    this.analyticsService.optIn();
    this.showBanner = false;
  }

  declineAnalytics(): void {
    localStorage.setItem(this.CONSENT_KEY, 'declined');
    this.analyticsService.optOut();
    this.showBanner = false;
  }
}
