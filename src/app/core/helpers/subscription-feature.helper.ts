import { SessionStorageKeys } from '../models';
import { SubscriptionFeatureKeys } from '../models/enums/shared.enums';
import { SessionStorageUtil } from './session-storage.util';

export class SubscriptionFeatureHelper {
  // Shared shape behind RoleHelper.getRoleLimit() and DocumentHelper.getCvUploadLimit() — find a
  // subscription feature by key, parse it as a positive integer, fall back to the given default
  // otherwise (missing feature, unparseable value, zero/negative value, or a storage read error).
  static getNumericLimit(featureKey: SubscriptionFeatureKeys, fallback: number): number {
    try {
      const subscriptionFeatures = SessionStorageUtil.getItem(SessionStorageKeys.subscriptionFeatures);
      const feature = subscriptionFeatures?.features?.find(f => f.featureKey === featureKey);

      if (!feature?.featureValue) {
        return fallback;
      }

      const limit = Number.parseInt(feature.featureValue, 10);
      return Number.isNaN(limit) || limit <= 0 ? fallback : limit;
    } catch {
      return fallback;
    }
  }
}
