const MASTER_PIN_KEY = 'totem-master-pin';
export const DEFAULT_MASTER_PIN = '654321';
export const DEFAULT_SUPER_MASTER_PIN = '987654';

export type LocationPinAccess = 'complex' | 'full';

export function getMasterPin() {
  if (typeof window === 'undefined') return DEFAULT_MASTER_PIN;
  try {
    return window.localStorage.getItem(MASTER_PIN_KEY) || DEFAULT_MASTER_PIN;
  } catch {
    return DEFAULT_MASTER_PIN;
  }
}

export function validateMasterPin(pin: string) {
  return pin === getMasterPin();
}

export function validateLocationPinAccess(pin: string): LocationPinAccess | null {
  if (pin === DEFAULT_SUPER_MASTER_PIN) return 'full';
  if (pin === DEFAULT_MASTER_PIN || validateMasterPin(pin)) return 'complex';
  return null;
}

export function setMasterPin(pin: string) {
  if (!/^\d{4,6}$/.test(pin)) return false;
  try {
    window.localStorage.setItem(MASTER_PIN_KEY, pin);
    return true;
  } catch {
    return false;
  }
}
