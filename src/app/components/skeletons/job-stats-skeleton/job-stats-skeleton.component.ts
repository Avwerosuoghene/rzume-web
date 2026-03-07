import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-stats-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-stats-skeleton.component.html',
  styleUrl: './job-stats-skeleton.component.scss'
})
export class JobStatsSkeletonComponent {
  @Input() isMobile = false;
}
