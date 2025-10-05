import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { StatHighlight } from '../../core/models/interface/dashboard.models';
import { CarouselComponent } from '../carousel/carousel.component';
import { CarouselItem } from '../../core/models';
import { UiStateService } from '../../core/services/ui-state.service';
import { animateCountUp } from '../../core/helpers/animation.helper';
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
  private cancelAnimation: (() => void) | null = null;

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['statHighLights']?.currentValue) {
      this.handleStatHighlightsChange();
    }
  }

  handleStatHighlightsChange(): void {
    if (this.cancelAnimation) {
      this.cancelAnimation();
    }
    this.buildCarouselItems();
    this.statHighLights.forEach(stat => this.startAnimationForStat(stat));
  }

  startAnimationForStat(stat: StatHighlight & { displayValue?: number }): void {
    const startValue = stat.displayValue ?? 0;
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.cancelAnimation) {
      this.cancelAnimation();
    }
  }
}
