import {
  DEFAULT_MASTER_PIN,
  DEFAULT_SUPER_MASTER_PIN,
  validateMasterPin,
} from './masterPinPreferences';

const ADMIN_PIN_KEY = 'totem-admin-pin';
export const DEFAULT_ADMIN_PIN = '123456';
export type AdminAccessLevel = 1 | 2 | 3;

export function getAdminPin() {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PIN;
  try {
    return window.localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
  } catch {
    return DEFAULT_ADMIN_PIN;
  }
}

export function validateAdminPin(pin: string) {
  return pin === getAdminPin();
}

/** Higher credentials inherit every permission granted to lower levels. */
export function getAdminAccessLevel(pin: string): AdminAccessLevel | null {
  if (pin === DEFAULT_SUPER_MASTER_PIN) return 3;
  if (pin === DEFAULT_MASTER_PIN || validateMasterPin(pin)) return 2;
  if (validateAdminPin(pin)) return 1;
  return null;
}

export function validateAdminAccessPin(pin: string) {
  return getAdminAccessLevel(pin) !== null;
}

export function setAdminPin(pin: string) {
  if (!/^\d{4,6}$/.test(pin)) return false;
  try {
    window.localStorage.setItem(ADMIN_PIN_KEY, pin);
    return true;
  } catch {
    return false;
  }
}
