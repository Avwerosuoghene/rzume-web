import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerUtilityService {

  static timeValues = new Subject<any>();
  static timerInterval: ReturnType<typeof setInterval> | null = null;


  static setTimer() {
    const startTime: number = 4;
    let timer = startTime * 60;
    this.timerInterval = setInterval(() => {
      if (timer == 0) {
        this.clearTimer();
        return;
      }
      timer--;
      const minutes = Math.floor(timer / 60);
      const seconds = timer % 60;
      this.timeValues.next({
        minutes: minutes,
        seconds: seconds,
        timer: timer,
      });
    }, 1000);
  }

  static clearTimer() {
    if (this.timerInterval != null) clearInterval(this.timerInterval);
  }
}
