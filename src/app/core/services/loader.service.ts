import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loaderSubject = new BehaviorSubject<boolean>(false);
  public globalLoaderSubject: Observable<boolean> = this.loaderSubject.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  showLoader() {
    this.loaderSubject.next(true);
  }

  hideLoader() {
    this.loaderSubject.next(false);
  }

  constructor() { }
}
