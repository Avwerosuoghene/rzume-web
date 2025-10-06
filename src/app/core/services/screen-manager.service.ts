import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import { debounceTime, shareReplay, takeUntil } from 'rxjs/operators';
import { MOBILE_BREAKPOINT } from '../models/constants/shared.constants';

@Injectable({
  providedIn: 'root'
})
export class ScreenManagerService implements OnDestroy {
  private isMobile = new BehaviorSubject<boolean>(this.getIsMobile(window.innerWidth));
  public isMobile$: Observable<boolean> = this.isMobile.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  private destroy$ = new Subject<void>();

  constructor() {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(200),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
