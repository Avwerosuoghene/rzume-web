import { SessionStorageUtil } from './session-storage.util';
import { SessionStorageKeys } from '../models';

describe('SessionStorageUtil', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  describe('setItem / getItem', () => {
    it('should round-trip a stored value', () => {
      SessionStorageUtil.setItem(SessionStorageKeys.userMail, 'user@example.com');
      expect(SessionStorageUtil.getItem(SessionStorageKeys.userMail)).toBe('user@example.com');
    });

    it('should return null when the key was never set', () => {
      expect(SessionStorageUtil.getItem(SessionStorageKeys.userMail)).toBeNull();
    });

    it('should return null instead of throwing when the stored value is malformed JSON', () => {
      sessionStorage.setItem(SessionStorageKeys.userMail, '{not valid json');
      expect(SessionStorageUtil.getItem(SessionStorageKeys.userMail)).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove a previously stored value', () => {
      SessionStorageUtil.setItem(SessionStorageKeys.userMail, 'user@example.com');
      SessionStorageUtil.removeItem(SessionStorageKeys.userMail);
      expect(SessionStorageUtil.getItem(SessionStorageKeys.userMail)).toBeNull();
    });
  });
});
