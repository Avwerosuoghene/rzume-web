import { Component, Input } from '@angular/core';
import { StatHighlight } from '../../core/models/interface/dashboard.models';

@Component({
  selector: 'app-job-stats',
  standalone: true,
  imports: [],
  templateUrl: './job-stats.component.html',
  styleUrl: './job-stats.component.scss'
})
export class JobStatsComponent {
  @Input() statHighLights: Array<StatHighlight> = [];
}
