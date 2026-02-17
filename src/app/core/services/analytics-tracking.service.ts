import { Injectable, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AnalyticsService } from './analytics/analytics.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsTrackingService implements OnInit {
  constructor(
    private router: Router,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.setupRouteTracking();
  }

  private setupRouteTracking(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const pageName = this.getPageNameFromUrl(event.urlAfterRedirects);
        this.analyticsService.trackPageView(pageName, {
          url: event.urlAfterRedirects
        });
      });
  }

  private getPageNameFromUrl(url: string): string {
    const segments = url.split('/').filter(s => s);
    
    if (segments.length === 0) return 'home';
    if (segments[0] === 'auth') {
      return segments[1] || 'auth';
    }
    if (segments[0] === 'main') {
      return segments[1] || 'dashboard';
    }
    
    return segments.join('_');
  }
}
