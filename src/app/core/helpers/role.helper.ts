import { DEFAULT_ROLE_LIMIT, SubscriptionFeatureKeys } from '../models';
import { SubscriptionFeatureHelper } from './subscription-feature.helper';

export class RoleHelper {
  static getRoleLimit(): number {
    return SubscriptionFeatureHelper.getNumericLimit(SubscriptionFeatureKeys.MaxRoles, DEFAULT_ROLE_LIMIT);
  }
}
