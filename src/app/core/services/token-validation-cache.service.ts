import { Injectable } from '@angular/core';
import { TokenStorageUtil } from '../helpers/token-storage.util';

interface CacheEntry {
  isValid: boolean;
  timestamp: number;
  tokenHash: string;
}

@Injectable({
  providedIn: 'root'
})
export class TokenValidationCacheService {
  private readonly CACHE_KEY = 'auth_validation_cache';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor() { }

  /**
   * Check if cached validation result exists and is still valid
   * @returns boolean if cache is valid, null if cache miss or expired
   */
  isCachedValid(): boolean | null {
    const currentToken = TokenStorageUtil.getToken();
    
    if (!currentToken) {
      return null;
    }

    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      
      if (!cached) {
        return null;
      }

      const entry: CacheEntry = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is expired
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.clearCache();
        return null;
      }

      // Check if token has changed
      const currentTokenHash = this.hashToken(currentToken);
      if (entry.tokenHash !== currentTokenHash) {
        this.clearCache();
        return null;
      }

      return entry.isValid;
    } catch (error) {
      this.clearCache();
      return null;
    }
  }

  /**
   * Store validation result in cache
   * @param isValid - Whether the token is valid
   */
  setCacheResult(isValid: boolean): void {
    const currentToken = TokenStorageUtil.getToken();
    
    if (!currentToken) {
      return;
    }

    const entry: CacheEntry = {
      isValid,
      timestamp: Date.now(),
      tokenHash: this.hashToken(currentToken)
    };

    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(entry));
    } catch (error) {
      // If localStorage is full or unavailable, fail silently
    }
  }

  /**
   * Clear the validation cache
   */
  clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      // Fail silently if localStorage is unavailable
    }
  }

  /**
   * Simple hash function for token comparison
   * Not cryptographically secure, just for cache key comparison
   */
  private hashToken(token: string): string {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}
