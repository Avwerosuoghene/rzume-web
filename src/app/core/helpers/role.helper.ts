import { DEFAULT_ROLE_LIMIT, SessionStorageKeys, SubscriptionFeatureKeys } from '../models';
import { SessionStorageUtil } from './session-storage.util';

export class RoleHelper {
  static getRoleLimit(): number {
    try {
      const subscriptionFeatures = SessionStorageUtil.getItem(SessionStorageKeys.subscriptionFeatures);
      const feature = subscriptionFeatures?.features?.find(
        f => f.featureKey === SubscriptionFeatureKeys.MaxRoles
      );

      if (!feature?.featureValue) {
        return DEFAULT_ROLE_LIMIT;
      }

      const limit = Number.parseInt(feature.featureValue, 10);
      return Number.isNaN(limit) || limit <= 0 ? DEFAULT_ROLE_LIMIT : limit;
    } catch {
      return DEFAULT_ROLE_LIMIT;
    }
  }
}
