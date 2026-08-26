import { TokenStorageUtil } from './token-storage.util';

describe('TokenStorageUtil', () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('setToken / getToken', () => {
    it('should store and retrieve a persistent (remember-me) token from localStorage', () => {
      TokenStorageUtil.setToken('abc123', true);

      expect(localStorage.getItem('authToken')).toBe('abc123');
      expect(sessionStorage.getItem('authToken')).toBeNull();
      expect(TokenStorageUtil.getToken()).toBe('abc123');
    });

    it('should store and retrieve a session-only token from sessionStorage', () => {
      TokenStorageUtil.setToken('abc123', false);

      expect(sessionStorage.getItem('authToken')).toBe('abc123');
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(TokenStorageUtil.getToken()).toBe('abc123');
    });

    it('should record the storage type used', () => {
      TokenStorageUtil.setToken('abc123', true);
      expect(localStorage.getItem('authStorageType')).toBe('local');

      TokenStorageUtil.setToken('xyz789', false);
      expect(localStorage.getItem('authStorageType')).toBe('session');
    });

    it('should return null when no token has ever been set', () => {
      expect(TokenStorageUtil.getToken()).toBeNull();
    });

    it('should fall back to checking both storages when the storage-type flag is missing', () => {
      sessionStorage.setItem('authToken', 'legacy-token');
      expect(TokenStorageUtil.getToken()).toBe('legacy-token');
    });
  });

  describe('removeToken', () => {
    it('should clear the token from both storages and the storage-type flag', () => {
      TokenStorageUtil.setToken('abc123', true);
      TokenStorageUtil.removeToken();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(sessionStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('authStorageType')).toBeNull();
      expect(TokenStorageUtil.getToken()).toBeNull();
    });
  });

  describe('hasToken', () => {
    it('should return true when a token is present', () => {
      TokenStorageUtil.setToken('abc123', true);
      expect(TokenStorageUtil.hasToken()).toBe(true);
    });

    it('should return false when no token is present', () => {
      expect(TokenStorageUtil.hasToken()).toBe(false);
    });
  });
});
