import { Component, Input } from '@angular/core';
import { StatHighlight } from '../../core/models/interface/dashboard.models';
import { CarouselComponent } from '../carousel/carousel.component';
import { CarouselItem } from '../../core/models';

@Component({
  selector: 'app-job-stats',
  standalone: true,
  imports: [CarouselComponent],
  templateUrl: './job-stats.component.html',
  styleUrl: './job-stats.component.scss'
})
export class JobStatsComponent {
  @Input() statHighLights: Array<StatHighlight> = [];

  carouselItems: CarouselItem[] = [];

  ngOnChanges(): void {
    this.carouselItems = this.statHighLights.map((stat, index) => ({
      id: index,
      title: stat.value.toString(),
      description: stat.description
    }));
  }
}
