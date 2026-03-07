import { TestBed } from '@angular/core/testing';
import { TokenValidationCacheService } from './token-validation-cache.service';
import { TokenStorageUtil } from '../helpers/token-storage.util';

describe('TokenValidationCacheService - Phase 3', () => {
  let service: TokenValidationCacheService;
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TokenValidationCacheService]
    });
    service = TestBed.inject(TokenValidationCacheService);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('AC3.1 & AC3.2: Cache validation result', () => {
    it('should return null for non-existent cache', () => {
      spyOn(TokenStorageUtil, 'getToken').and.returnValue(mockToken);
      
      expect(service.isCachedValid()).toBeNull();
    });

    it('should cache validation result successfully', () => {
      spyOn(TokenStorageUtil, 'getToken').and.returnValue(mockToken);
      
      service.setCacheResult(true);
      
      expect(service.isCachedValid()).toBe(true);
    });

    it('should cache false validation result', () => {
      spyOn(TokenStorageUtil, 'getToken').and.returnValue(mockToken);
      
      service.setCacheResult(false);
      
      expect(service.isCachedValid()).toBe(false);
    });
  });

  describe('AC3.3 & AC3.4: Cache expiration after 5 minutes', () => {
    it('should expire cache after 5 minutes', () => {
      jasmine.clock().install();
      spyOn(TokenStorageUtil, 'getToken').and.returnValue(mockToken);
      
      service.setCacheResult(true);
      expect(service.isCachedValid()).toBe(true);
      
      // Advance time by 5 minutes + 1 second
      jasmine.clock().tick(5 * 60 * 1000 + 1000);
      
      expect(service.isCachedValid()).toBeNull();
      
      jasmine.clock().uninstall();
    });

    it('should not expire cache before 5 minutes', () => {
      jasmine.clock().install();
      spyOn(TokenStorageUtil, 'getToken').and.returnValue(mockToken);
      
      service.setCacheResult(true);
      
      // Advance time by 4 minutes 59 seconds
      jasmine.clock().tick(4 * 60 * 1000 + 59 * 1000);
      
      expect(service.isCachedValid()).toBe(true);
      
      jasmine.clock().uninstall();
    });
  });

  describe('AC3.5: Cache cleared on logout', () => {
    it('should clear cache', () => {
      spyOn(TokenStorageUtil, 'getToken').and.returnValue(mockToken);
      
      service.setCacheResult(true);
      expect(service.isCachedValid()).toBe(true);
      
      service.clearCache();
      
      expect(service.isCachedValid()).toBeNull();
    });
  });

  describe('AC3.6 & AC3.7: Different tokens have separate cache entries', () => {
    it('should invalidate cache when token changes', () => {
      const token1 = 'token1.test.abc';
      const token2 = 'token2.test.xyz';
      
      const getTokenSpy = spyOn(TokenStorageUtil, 'getToken');
      
      // Set cache with token1
      getTokenSpy.and.returnValue(token1);
      service.setCacheResult(true);
      expect(service.isCachedValid()).toBe(true);
      
      // Check cache with token2 (different token)
      getTokenSpy.and.returnValue(token2);
      expect(service.isCachedValid()).toBeNull();
    });

    it('should maintain cache for same token', () => {
      spyOn(TokenStorageUtil, 'getToken').and.returnValue(mockToken);
      
      service.setCacheResult(true);
      
      // Check multiple times with same token
      expect(service.isCachedValid()).toBe(true);
      expect(service.isCachedValid()).toBe(true);
      expect(service.isCachedValid()).toBe(true);
    });
  });

  describe('AC3.8: Cache miss triggers server validation', () => {
    it('should return null when no token exists', () => {
      spyOn(TokenStorageUtil, 'getToken').and.returnValue(null);
      
      expect(service.isCachedValid()).toBeNull();
    });

    it('should return null and not cache when no token exists', () => {
      spyOn(TokenStorageUtil, 'getToken').and.returnValue(null);
      
      service.setCacheResult(true);
      
      expect(service.isCachedValid()).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle corrupted cache data gracefully', () => {
      spyOn(TokenStorageUtil, 'getToken').and.returnValue(mockToken);
      
      // Manually corrupt the cache
      localStorage.setItem('auth_validation_cache', 'invalid-json-data');
      
      expect(service.isCachedValid()).toBeNull();
      
      // Cache should be cleared after corruption
      expect(localStorage.getItem('auth_validation_cache')).toBeNull();
    });

    it('should handle localStorage quota exceeded', () => {
      spyOn(TokenStorageUtil, 'getToken').and.returnValue(mockToken);
      spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
      spyOn(console, 'warn');
      
      // Should not throw error
      expect(() => service.setCacheResult(true)).not.toThrow();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete cache lifecycle', () => {
      jasmine.clock().install();
      spyOn(TokenStorageUtil, 'getToken').and.returnValue(mockToken);
      
      // Initial state - no cache
      expect(service.isCachedValid()).toBeNull();
      
      // Set cache
      service.setCacheResult(true);
      expect(service.isCachedValid()).toBe(true);
      
      // Wait 2 minutes - still valid
      jasmine.clock().tick(2 * 60 * 1000);
      expect(service.isCachedValid()).toBe(true);
      
      // Wait another 4 minutes - expired
      jasmine.clock().tick(4 * 60 * 1000);
      expect(service.isCachedValid()).toBeNull();
      
      jasmine.clock().uninstall();
    });

    it('should handle token rotation scenario', () => {
      const oldToken = 'old.token.abc';
      const newToken = 'new.token.xyz';
      
      const getTokenSpy = spyOn(TokenStorageUtil, 'getToken');
      
      // Cache with old token
      getTokenSpy.and.returnValue(oldToken);
      service.setCacheResult(true);
      expect(service.isCachedValid()).toBe(true);
      
      // User logs out and logs in with new token
      service.clearCache();
      getTokenSpy.and.returnValue(newToken);
      
      // Cache should be empty
      expect(service.isCachedValid()).toBeNull();
      
      // Set new cache
      service.setCacheResult(true);
      expect(service.isCachedValid()).toBe(true);
    });
  });
});
