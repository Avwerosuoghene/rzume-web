import { animate, keyframes, state, style, transition, trigger } from "@angular/animations";

export const slideOutAnimation = trigger('slideInOut', [
  state(
    'slide-in',
    style({
      opacity: 1,
      transform: 'translateX(0)'
    })
  ),
  state(
    'slide-out',
    style({
      opacity: 0,
      transform: 'translateX(-100%)'
    })
  ),
  transition('slide-out => slide-in', [animate('1s ease-in', keyframes([
    style({ opacity: 0, transform: 'translateX(-100%)', offset: 0 }),
    style({ opacity: 1, transform: 'translateX(25px)', offset: 0.6 }),
    style({ transform: 'translateX(-20px)', offset: 0.75 }),
    style({ transform: 'translateX(5px)', offset: 0.9 }),
    style({ transform: 'translateX(0)', offset: 1 })
  ]))]),
  transition('slide-in => slide-out', [animate('2s ease-in')]),
]);


