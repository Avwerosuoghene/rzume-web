import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private userInfo = new BehaviorSubject<User | null>(null);
  public user$ = this.userInfo.asObservable();

  constructor() { }

  setUser(user: User | null): void {
    this.userInfo.next(user);
  }

  clearUser(): void {
    this.userInfo.next(null);
  }
}
