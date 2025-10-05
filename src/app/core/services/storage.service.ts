import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User, SubscriptionFeatures } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private userInfo = new BehaviorSubject<User | null>(null);
  public user$ = this.userInfo.asObservable();

  public subscriptionFeatures: BehaviorSubject<SubscriptionFeatures | null> =  new BehaviorSubject<SubscriptionFeatures | null>(null);

  constructor() { }

  setUser(user: User | null): void {
    this.userInfo.next(user);
  }

  clearUser(): void {
    this.userInfo.next(null);
  }

  setSubscriptionFeatures(features: SubscriptionFeatures | null): void {
    this.subscriptionFeatures.next(features);
  }

  clearSubscriptionFeatures(): void {
    this.subscriptionFeatures.next(null);
  }
}
