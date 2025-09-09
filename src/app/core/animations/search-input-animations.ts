import { trigger, style, animate, transition } from '@angular/animations';

export const searchInputAnimations = {
  iconAnimation: trigger('iconAnimation', [
    transition(':leave', [
      style({ opacity: 1, width: '24px', marginRight: '8px' }),
      animate('100ms ease-in', style({ opacity: 0, width: '0px', marginRight: '0px' }))
    ])
  ])
};