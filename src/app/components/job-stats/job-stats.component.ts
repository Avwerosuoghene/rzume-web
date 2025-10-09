import { Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
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
  @Input() statHighLights: Array<StatHighlight & { displayValue?: number }> = [];
  
  carouselItems: CarouselItem[] = [];
  isMobile = false;
  
  private subscriptions = new Subscription();

  constructor(private uiState: UiStateService) { }

  ngOnInit(): void {
    this.initiateSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['statHighLights'];
    if (change?.currentValue) {
      this.handleStatHighlightsChange(change.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initiateSubscriptions() {
    this.subscriptions.add(
      this.uiState.isMobile$.subscribe(isMobile => {
        this.isMobile = isMobile;
      })
    );
  }

  handleStatHighlightsChange(
    currentStats: Array<StatHighlight & { displayValue?: number }>
  ): void {
    this.buildCarouselItems();

    currentStats.forEach(currentStat => {
      currentStat.displayValue = currentStat.value;
      if (this.isMobile) {
        this.updateCarouselItem(currentStat);
      }
    });
  }

  buildCarouselItems(): void {
    if (this.carouselItems.length !== this.statHighLights.length) {
      this.carouselItems = this.statHighLights.map((stat, index) => ({
        id: index,
        title: '0',
        description: stat.description
      }));
    }
  }

  updateCarouselItem(stat: StatHighlight & { displayValue?: number }): void {
    const item = this.carouselItems.find(i => i.description === stat.description);
    if (item) {
      item.title = stat.displayValue?.toString() ?? stat.value.toString();
    }
  }
}

