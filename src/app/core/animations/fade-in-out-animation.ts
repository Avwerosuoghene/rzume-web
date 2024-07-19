import { animate, state, style, transition, trigger } from "@angular/animations";

export const fadeInOutAnimation = trigger('fadeInOut', [
  state(
    'open',
    style({
      opacity: 1
    })
  ),
  state(
    'close',
    style({
      opacity: 0
    })
  ),
  transition('close => open', [animate('1s ease-in')]),
  transition('open => close', [animate('1s ease-in')]),
]);


