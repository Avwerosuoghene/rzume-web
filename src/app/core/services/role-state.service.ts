import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Role, RoleStats } from '../models/interface/role.models';
import { ROLE_LIMIT } from '../models/constants/role.constants';

interface RoleState {
  roles: Role[];
  stats: RoleStats;
  isLoading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  stats: {
    createdCount: 0,
    maxAllowed: ROLE_LIMIT
  },
  isLoading: false,
  error: null
};

@Injectable({
  providedIn: 'root'
})
export class RoleStateService {
  private stateSubject = new BehaviorSubject<RoleState>(initialState);
  state$ = this.stateSubject.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  roles$ = this.stateSubject.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  getCurrentState(): RoleState {
    return this.stateSubject.value;
  }

  getRoles(): Role[] {
    return this.stateSubject.value.roles;
  }

  getStats(): RoleStats {
    return this.stateSubject.value.stats;
  }

  setRoles(roles: Role[]): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      roles,
      stats: {
        ...this.stateSubject.value.stats,
        createdCount: roles.length
      }
    });
  }

  addRole(role: Role): void {
    const currentRoles = this.stateSubject.value.roles;
    this.stateSubject.next({
      ...this.stateSubject.value,
      roles: [...currentRoles, role],
      stats: {
        ...this.stateSubject.value.stats,
        createdCount: currentRoles.length + 1
      }
    });
  }

  removeRole(roleId: string): void {
    const currentRoles = this.stateSubject.value.roles;
    const updatedRoles = currentRoles.filter(role => role.id !== roleId);
    this.stateSubject.next({
      ...this.stateSubject.value,
      roles: updatedRoles,
      stats: {
        ...this.stateSubject.value.stats,
        createdCount: updatedRoles.length
      }
    });
  }

  setStats(stats: RoleStats): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      stats
    });
  }

  setLoading(isLoading: boolean): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      isLoading
    });
  }

  setError(error: string | null): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      error
    });
  }

  resetState(): void {
    this.stateSubject.next(initialState);
  }
}
