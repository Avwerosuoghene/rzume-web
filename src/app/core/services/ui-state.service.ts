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
    this.setupResizeListener();
  }

  private setupResizeListener(): void {
    window.addEventListener('resize', () => {
      this.checkIfMobile();
    });
  }

  private checkIfMobile(): void {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    this.isMobileSubject.next(isMobile);
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }
}
