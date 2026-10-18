import { useEffect, useState } from 'react';

export type CustomerAuthState = 'Guest' | 'Member' | 'Unidentified';

export type CustomerIdentity = {
  authState: CustomerAuthState;
  cpf: string;
  memberName?: string;
  memberFirstName?: string;
  memberLastName?: string;
  documentType?: 'CPF' | 'CNPJ';
  schoolProjectRegistered?: boolean;
  organizationName?: string;
  organizationNameParts?: string[];
};

export type LoyaltyMemberResult = boolean | {
  isMember: boolean;
  memberName?: string;
  firstName?: string;
  lastName?: string;
};
export type CustomerLoyaltyApi = {
  getClubName?: () => string | Promise<string>;
  validateMemberCpf?: (cpf: string) => LoyaltyMemberResult | Promise<LoyaltyMemberResult>;
};

export const DEFAULT_LOYALTY_CLUB_NAME = 'Clube';
const IDENTITY_KEY = 'totem-customer-identity';
const PROMPT_SEEN_KEY = 'totem-customer-identity-prompt-seen';
export const CUSTOMER_IDENTITY_EVENT = 'totem-customer-identity-change';
export const CUSTOMER_LOYALTY_CONFIGURATION_EVENT = 'totem-customer-loyalty-configuration-change';

let loyaltyApi: CustomerLoyaltyApi = {};
let cachedClubName: string | undefined;
let pendingClubName: Promise<string> | undefined;

export function normalizeLoyaltyClubName(clubName?: string | null) {
  return clubName?.trim() || DEFAULT_LOYALTY_CLUB_NAME;
}

export function configureCustomerLoyaltyApi(api: CustomerLoyaltyApi) {
  loyaltyApi = api;
  cachedClubName = undefined;
  pendingClubName = undefined;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CUSTOMER_LOYALTY_CONFIGURATION_EVENT));
  }
}

export async function getTenantClubName() {
  if (cachedClubName) return cachedClubName;
  if (pendingClubName) return pendingClubName;

  pendingClubName = Promise.resolve()
    .then(() => loyaltyApi.getClubName?.())
    .then(normalizeLoyaltyClubName)
    .catch(() => DEFAULT_LOYALTY_CLUB_NAME)
    .then((clubName) => {
      cachedClubName = clubName;
      pendingClubName = undefined;
      return clubName;
    });

  return pendingClubName;
}

export function useTenantClubName(enabled = true) {
  const [clubName, setClubName] = useState(cachedClubName ?? DEFAULT_LOYALTY_CLUB_NAME);

  useEffect(() => {
    let active = true;
    const loadClubName = () => {
      if (!enabled) {
        setClubName(DEFAULT_LOYALTY_CLUB_NAME);
        return;
      }
      void getTenantClubName().then((nextClubName) => {
        if (active) setClubName(nextClubName);
      });
    };

    loadClubName();
    window.addEventListener(CUSTOMER_LOYALTY_CONFIGURATION_EVENT, loadClubName);
    return () => {
      active = false;
      window.removeEventListener(CUSTOMER_LOYALTY_CONFIGURATION_EVENT, loadClubName);
    };
  }, [enabled]);

  return clubName;
}

export async function validateLoyaltyCpf(cpf: string): Promise<{
  isMember: boolean;
  memberName?: string;
  firstName?: string;
  lastName?: string;
}> {
  const result = await loyaltyApi.validateMemberCpf?.(cpf);
  return typeof result === 'boolean' ? { isMember: result } : result ?? { isMember: false };
}

export function getCustomerIdentity(): CustomerIdentity {
  if (typeof window === 'undefined') return { authState: 'Unidentified', cpf: '' };
  try {
    const stored = window.sessionStorage.getItem(IDENTITY_KEY);
    return stored ? JSON.parse(stored) : { authState: 'Unidentified', cpf: '' };
  } catch {
    return { authState: 'Unidentified', cpf: '' };
  }
}

export function setCustomerIdentity(identity: CustomerIdentity) {
  try {
    window.sessionStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch {
    // Keep the current screen usable when session storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(CUSTOMER_IDENTITY_EVENT));
}

export function resetCustomerIdentitySession() {
  try {
    window.sessionStorage.removeItem(IDENTITY_KEY);
    window.sessionStorage.removeItem(PROMPT_SEEN_KEY);
  } catch {
    // Nothing else is required when session storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(CUSTOMER_IDENTITY_EVENT));
}

export function claimAutomaticIdentityPrompt() {
  try {
    if (window.sessionStorage.getItem(PROMPT_SEEN_KEY) === 'true') return false;
    window.sessionStorage.setItem(PROMPT_SEEN_KEY, 'true');
  } catch {
    // Without storage, show the prompt for the current mounted page.
  }
  return true;
}

export function useCustomerIdentity() {
  const [identity, setIdentity] = useState<CustomerIdentity>(getCustomerIdentity);
  useEffect(() => {
    const update = () => setIdentity(getCustomerIdentity());
    window.addEventListener(CUSTOMER_IDENTITY_EVENT, update);
    return () => window.removeEventListener(CUSTOMER_IDENTITY_EVENT, update);
  }, []);
  return identity;
}
