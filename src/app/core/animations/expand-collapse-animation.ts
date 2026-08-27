import { animate, style, transition, trigger, AUTO_STYLE } from '@angular/animations';

// height: AUTO_STYLE ('*') lets Angular measure the element's real rendered height and animate
// to/from it — plain CSS can't transition to/from `height: auto` directly, which is what makes a
// content-driven collapse (a variable number of wrapped document cards, not a fixed height) hard
// to do without this.
export const expandCollapseAnimation = trigger('expandCollapse', [
  transition(':enter', [
    style({ height: 0, opacity: 0, overflow: 'hidden' }),
    animate('200ms ease-out', style({ height: AUTO_STYLE, opacity: 1 }))
  ]),
  transition(':leave', [
    style({ height: AUTO_STYLE, opacity: 1, overflow: 'hidden' }),
    animate('200ms ease-in', style({ height: 0, opacity: 0 }))
  ])
]);
