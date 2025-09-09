import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { StatHighlight } from '../../core/models/interface/dashboard.models';
import { CarouselComponent } from '../carousel/carousel.component';
import { CarouselItem } from '../../core/models';
import { UiStateService } from '../../core/services/ui-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-job-stats',
  standalone: true,
  imports: [CarouselComponent],
  templateUrl: './job-stats.component.html',
  styleUrl: './job-stats.component.scss'
})
export class JobStatsComponent implements OnInit, OnDestroy {
  @Input() statHighLights: Array<StatHighlight> = [];

  carouselItems: CarouselItem[] = [];
  isMobile = false;
  private subscriptions = new Subscription();

  constructor(private uiState: UiStateService) { }

  ngOnInit(): void {
    this.initiateSubscriptions();
  }

  initiateSubscriptions() {
    this.subscriptions.add(
      this.uiState.isMobile$.subscribe(isMobile => {
        this.isMobile = isMobile;
      })
    );
  }

  ngOnChanges(): void {
    this.carouselItems = this.statHighLights.map((stat, index) => ({
      id: index,
      title: stat.value.toString(),
      description: stat.description
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
