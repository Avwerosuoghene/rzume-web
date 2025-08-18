import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  globalLoaderSubject = new Subject<boolean>();

  showLoader() {
    this.globalLoaderSubject.next(true);
  }

  hideLoader() {
    this.globalLoaderSubject.next(false);
  }

  constructor() { }
}
