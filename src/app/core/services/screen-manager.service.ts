import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { MOBILE_BREAKPOINT } from '../models/constants/shared.constants';

@Injectable({
  providedIn: 'root'
})
export class ScreenManagerService {
  private isMobile = new BehaviorSubject<boolean>(this.getIsMobile(window.innerWidth));
  public isMobile$: Observable<boolean> = this.isMobile.asObservable();

  constructor() {
    fromEvent(window, 'resize').subscribe(() => {
      this.mobileViewSetter(window.innerWidth);
    });
  }

  private mobileViewSetter(width: number): void {
    this.isMobile.next(this.getIsMobile(width));
  }

  private getIsMobile(width: number): boolean {
    return width <= MOBILE_BREAKPOINT;
  }

  public getIsMobileView(): boolean {
    return this.isMobile.getValue();
  }
}
