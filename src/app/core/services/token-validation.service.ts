import { Injectable } from '@angular/core';
import { SessionStorageUtil } from '../helpers/session-storage.util';
import { SessionStorageKeys } from '../models/enums/shared.enums';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class TokenValidationService {
  
  constructor(private userService: UserService) {}

  getStoredToken(): string | null {
    return SessionStorageUtil.getItem(SessionStorageKeys.authToken);
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      return await this.userService.getActiveUser(token);
    } catch (error) {
      return false;
    }
  }

  async getAndValidateToken(): Promise<{ token: string | null; isValid: boolean }> {
    const token = this.getStoredToken();
    
    if (!token) {
      return { token: null, isValid: false };
    }

    const isValid = await this.validateToken(token);
    return { token, isValid };
  }
}
