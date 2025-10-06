import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private userInfo = new BehaviorSubject<User | null>(null);
  public user$ = this.userInfo.asObservable().pipe(shareReplay({ bufferSize: 1, refCount: true }));

  constructor() { }

  setUser(user: User | null): void {
    this.userInfo.next(user);
  }

  clearUser(): void {
    this.userInfo.next(null);
  }
}
