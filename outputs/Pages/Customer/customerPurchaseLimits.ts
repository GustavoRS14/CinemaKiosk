import { useFeaturePreferences } from '../featurePreferences';
import { useCustomerIdentity } from './customerIdentitySession';

export const STANDARD_PURCHASE_LIMIT = 10;
export const SCHOOL_PROJECT_PURCHASE_LIMIT = 50;

export function useCustomerPurchaseLimits() {
  const { groupSalesSchoolProject } = useFeaturePreferences();
  const identity = useCustomerIdentity();
  const hasSchoolProjectLimits = Boolean(
    groupSalesSchoolProject
    && identity.documentType === 'CNPJ'
    && identity.schoolProjectRegistered,
  );
  const purchaseLimit = hasSchoolProjectLimits
    ? SCHOOL_PROJECT_PURCHASE_LIMIT
    : STANDARD_PURCHASE_LIMIT;

  return {
    hasSchoolProjectLimits,
    maxSeatSelections: purchaseLimit,
    maxConcessionItems: purchaseLimit,
  };
}
