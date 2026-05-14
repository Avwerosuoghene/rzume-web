import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileViewComponent } from './profile-view/profile-view.component';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';
import { AnalyticsEvent } from '../../../core/models/analytics-events.enum';


@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [
    CommonModule,
    ProfileViewComponent
  ],
  templateUrl: './profile-management.component.html',
  styleUrl: './profile-management.component.scss'
})
export class ProfileManagementComponent implements OnInit {

  constructor(
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit(): void {
    this.analyticsService.track(AnalyticsEvent.PROFILE_PAGE_LOADED);
  }
}
