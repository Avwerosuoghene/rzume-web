import { Component, Input, OnChanges } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BorderRadius } from '../../core/models';
import {
  CarouselConfig,
  CarouselItem,
  CarouselNavigationMode,
  DEFAULT_CAROUSEL_CONFIG
} from '../../core/models/interface/carousel.models';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnChanges {
  borderRadius = BorderRadius.medium;
  @Input() config: Partial<CarouselConfig> = {};
  @Input() items: CarouselItem[] = [];

  currentIndex = 0;
  mergedConfig: CarouselConfig = { ...DEFAULT_CAROUSEL_CONFIG };

  ngOnChanges(): void {
    this.mergedConfig = { ...DEFAULT_CAROUSEL_CONFIG, ...this.config };
  }

  get showArrows() {
    return this.mergedConfig?.showArrows && this.items.length > 1;
  }

  get showDots() {
    return this.mergedConfig?.showDots && this.items.length > 1;
  }

  get navigationMode() {
    return this.mergedConfig.navigationMode || CarouselNavigationMode.Bounded;
  }

  get translateX() {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  navigate(direction: 1 | -1): void {
    const maxIndex = this.items.length - 1;
    const nextIndex = this.currentIndex + direction;

    if (this.navigationMode === CarouselNavigationMode.Loop) {
      this.currentIndex = (nextIndex + this.items.length) % this.items.length;
    } else if (nextIndex >= 0 && nextIndex <= maxIndex) {
      this.currentIndex = nextIndex;
    }
  }

  canNavigate(direction: 1 | -1): boolean {
    if (this.navigationMode === CarouselNavigationMode.Loop) return true;
    return direction === -1 ? this.currentIndex > 0 : this.currentIndex < this.items.length - 1;
  }

  goTo(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
    }
  }

  trackByFn(index: number, item: CarouselItem): string | number {
    return item.id || index;
  }
}