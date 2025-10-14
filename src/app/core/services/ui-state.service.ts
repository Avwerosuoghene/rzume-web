import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MOBILE_BREAKPOINT } from '../models/constants/shared.constants';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  private isMobileSubject = new BehaviorSubject<boolean>(window.innerWidth < MOBILE_BREAKPOINT);
  isMobile$: Observable<boolean> = this.isMobileSubject.asObservable();

  constructor() {
    this.setViewportHeight();
    this.setupResizeListener();
  }

  private setupResizeListener(): void {
    window.addEventListener('resize', () => {
      this.setViewportHeight();
      this.checkIfMobile();
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.setViewportHeight();
      }, 100);
    });
  }

  private checkIfMobile(): void {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    this.isMobileSubject.next(isMobile);
  }

  private setViewportHeight(): void {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }
}
