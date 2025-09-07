import { StatHighlight } from "./dashboard.models";

export interface CarouselConfig {
    items: StatHighlight[];
    itemsPerView: number;
    showDots?: boolean;
    showArrows?: boolean;
    autoPlay?: boolean;
    autoPlayInterval?: number;
  }
  
  export enum CarouselBreakpoints {
    Mobile = 0,
    Tablet = 768,
    Desktop = 1024,
  }
  
  export const DEFAULT_CAROUSEL_CONFIG: Omit<CarouselConfig, 'items'> = {
    itemsPerView: 1,
    showDots: true,
    showArrows: true,
    autoPlay: false,
    autoPlayInterval: 5000,
  };
  