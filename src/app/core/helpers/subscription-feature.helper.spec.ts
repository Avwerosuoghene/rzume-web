import { SubscriptionFeatureHelper } from './subscription-feature.helper';
import { SessionStorageUtil } from './session-storage.util';
import { SessionStorageKeys } from '../models';
import { SubscriptionFeatureKeys } from '../models/enums/shared.enums';

describe('SubscriptionFeatureHelper', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  describe('getNumericLimit', () => {
    it('should return the fallback when no subscription features are stored', () => {
      expect(SubscriptionFeatureHelper.getNumericLimit(SubscriptionFeatureKeys.MaxRoles, 7)).toBe(7);
    });

    it('should return the fallback when the requested feature key is not present', () => {
      SessionStorageUtil.setItem(SessionStorageKeys.subscriptionFeatures, {
        planId: 1,
        planName: 'Basic',
        features: [{ featureKey: 'some_other_feature', featureValue: '5' }]
      });

      expect(SubscriptionFeatureHelper.getNumericLimit(SubscriptionFeatureKeys.MaxRoles, 7)).toBe(7);
    });

    it('should return the parsed value when the feature has a valid positive value', () => {
      SessionStorageUtil.setItem(SessionStorageKeys.subscriptionFeatures, {
        planId: 1,
        planName: 'Pro',
        features: [{ featureKey: SubscriptionFeatureKeys.MaxRoles, featureValue: '10' }]
      });

      expect(SubscriptionFeatureHelper.getNumericLimit(SubscriptionFeatureKeys.MaxRoles, 7)).toBe(10);
    });

    it('should return the fallback when the stored value is not a number', () => {
      SessionStorageUtil.setItem(SessionStorageKeys.subscriptionFeatures, {
        planId: 1,
        planName: 'Pro',
        features: [{ featureKey: SubscriptionFeatureKeys.MaxRoles, featureValue: 'not-a-number' }]
      });

      expect(SubscriptionFeatureHelper.getNumericLimit(SubscriptionFeatureKeys.MaxRoles, 7)).toBe(7);
    });

    it('should return the fallback when the stored value parses to zero or a negative number', () => {
      SessionStorageUtil.setItem(SessionStorageKeys.subscriptionFeatures, {
        planId: 1,
        planName: 'Pro',
        features: [{ featureKey: SubscriptionFeatureKeys.MaxRoles, featureValue: '-5' }]
      });

      expect(SubscriptionFeatureHelper.getNumericLimit(SubscriptionFeatureKeys.MaxRoles, 7)).toBe(7);
    });

    it('should return the fallback when reading session storage throws', () => {
      sessionStorage.setItem(SessionStorageKeys.subscriptionFeatures, '{not valid json');

      expect(SubscriptionFeatureHelper.getNumericLimit(SubscriptionFeatureKeys.MaxRoles, 7)).toBe(7);
    });

    it('should look up different feature keys independently', () => {
      SessionStorageUtil.setItem(SessionStorageKeys.subscriptionFeatures, {
        planId: 1,
        planName: 'Pro',
        features: [
          { featureKey: SubscriptionFeatureKeys.MaxRoles, featureValue: '10' },
          { featureKey: SubscriptionFeatureKeys.CvUploadLimit, featureValue: '3' }
        ]
      });

      expect(SubscriptionFeatureHelper.getNumericLimit(SubscriptionFeatureKeys.MaxRoles, 2)).toBe(10);
      expect(SubscriptionFeatureHelper.getNumericLimit(SubscriptionFeatureKeys.CvUploadLimit, 2)).toBe(3);
    });
  });
});
