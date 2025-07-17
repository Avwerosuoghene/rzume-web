import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timeValuesSubject = new Subject<{ minutes: number; seconds: number; timer: number }>();
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  get timeValues$(): Observable<{ minutes: number; seconds: number; timer: number }> {
    return this.timeValuesSubject.asObservable();
  }

  setTimer(startMinutes: number = 4): void {
    let timer = startMinutes * 60;

    this.timerInterval = setInterval(() => {
      if (timer === 0) {
        this.clearTimer();
        return;
      }

      timer--;
      const minutes = Math.floor(timer / 60);
      const seconds = timer % 60;
      this.timeValuesSubject.next({ minutes, seconds, timer });
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
