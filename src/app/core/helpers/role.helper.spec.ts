import { RoleHelper } from './role.helper';
import { SessionStorageUtil } from './session-storage.util';
import { SessionStorageKeys } from '../models';
import { DEFAULT_ROLE_LIMIT } from '../models/constants/document.constants';

describe('RoleHelper', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  describe('getRoleLimit', () => {
    it('should return the default limit when no subscription features are stored', () => {
      expect(RoleHelper.getRoleLimit()).toBe(DEFAULT_ROLE_LIMIT);
    });

    it('should return the default limit when the max_roles feature is not present', () => {
      SessionStorageUtil.setItem(SessionStorageKeys.subscriptionFeatures, {
        planId: 1,
        planName: 'Basic',
        features: [{ featureKey: 'some_other_feature', featureValue: '5' }]
      });

      expect(RoleHelper.getRoleLimit()).toBe(DEFAULT_ROLE_LIMIT);
    });

    it('should return the parsed limit when max_roles has a valid positive value', () => {
      SessionStorageUtil.setItem(SessionStorageKeys.subscriptionFeatures, {
        planId: 1,
        planName: 'Pro',
        features: [{ featureKey: 'max_roles', featureValue: '10' }]
      });

      expect(RoleHelper.getRoleLimit()).toBe(10);
    });

    it('should return the default limit when max_roles is not a valid number', () => {
      SessionStorageUtil.setItem(SessionStorageKeys.subscriptionFeatures, {
        planId: 1,
        planName: 'Pro',
        features: [{ featureKey: 'max_roles', featureValue: 'not-a-number' }]
      });

      expect(RoleHelper.getRoleLimit()).toBe(DEFAULT_ROLE_LIMIT);
    });

    it('should return the default limit when max_roles parses to zero or a negative number', () => {
      SessionStorageUtil.setItem(SessionStorageKeys.subscriptionFeatures, {
        planId: 1,
        planName: 'Pro',
        features: [{ featureKey: 'max_roles', featureValue: '-5' }]
      });

      expect(RoleHelper.getRoleLimit()).toBe(DEFAULT_ROLE_LIMIT);
    });

    it('should return the default limit when reading session storage throws', () => {
      sessionStorage.setItem(SessionStorageKeys.subscriptionFeatures, '{not valid json');

      expect(RoleHelper.getRoleLimit()).toBe(DEFAULT_ROLE_LIMIT);
    });
  });
});
