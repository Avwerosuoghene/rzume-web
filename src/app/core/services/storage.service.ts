import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUser } from '../models/interface/user-model-interface';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private userInfo = new BehaviorSubject<IUser | null>(null);
  public user$ = this.userInfo.asObservable();

  constructor() { }

  setUser(user: IUser | null): void {
    this.userInfo.next(user);
  }

  clearUser(): void {
    this.userInfo.next(null);
  }
}
