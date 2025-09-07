export interface CarouselItem {
    id: string | number;
    title?: string;
    description?: string;
    imageUrl?: string;
  }
  
  export enum CarouselNavigationMode {
    Loop = 'loop',
    Bounded = 'bounded'
  }
  
  export interface CarouselConfig {
    navigationMode?: CarouselNavigationMode;
    showDots?: boolean;
    showArrows?: boolean;
    itemClass?: string;
    activeItemClass?: string;
  }
  
  export const DEFAULT_CAROUSEL_CONFIG: CarouselConfig = {
    navigationMode: CarouselNavigationMode.Bounded,
    showDots: true,
    showArrows: true,
    itemClass: 'carousel-item',
    activeItemClass: 'active'
  };