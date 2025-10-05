import { Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { StatHighlight } from '../../core/models/interface/dashboard.models';
import { CarouselComponent } from '../carousel/carousel.component';
import { CarouselItem } from '../../core/models';
import { UiStateService } from '../../core/services/ui-state.service';
import { Subscription } from 'rxjs';
import { animateCountUp } from '../../core/helpers/animation.helper';

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
  private cancelAnimation: (() => void) | null = null;

  constructor(private uiState: UiStateService) { }

  ngOnInit(): void {
    this.initiateSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['statHighLights'];
    if (change?.currentValue) {
      this.handleStatHighlightsChange(change.previousValue, change.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.cancelAnimation) {
      this.cancelAnimation();
    }
  }

  initiateSubscriptions() {
    this.subscriptions.add(
      this.uiState.isMobile$.subscribe(isMobile => {
        this.isMobile = isMobile;
      })
    );
  }

  handleStatHighlightsChange(
    previousStats: Array<StatHighlight & { displayValue?: number }> | undefined,
    currentStats: Array<StatHighlight & { displayValue?: number }>
  ): void {
    if (this.cancelAnimation) {
      this.cancelAnimation();
    }
    this.buildCarouselItems();

    currentStats.forEach(currentStat => {
      const previousStat = previousStats?.find(p => p.description === currentStat.description);
      const startValue = previousStat?.displayValue ?? 0;
      this.startAnimationForStat(currentStat, startValue);
    });
  }

  startAnimationForStat(stat: StatHighlight & { displayValue?: number }, startValue: number): void {
    this.cancelAnimation = animateCountUp(stat, startValue, 1000, () => {
      if (this.isMobile) {
        this.updateCarouselItem(stat);
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

