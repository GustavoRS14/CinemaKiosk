export const ACCESSIBILITY_PREFERENCES_EVENT = 'totem-accessibility-preferences-change';

const HIGH_CONTRAST_STORAGE_KEY = 'totem-high-contrast';
const TEXT_SCALE_STORAGE_KEY = 'totem-text-scale';
const LOWERED_SCREEN_STORAGE_KEY = 'totem-lowered-screen';

export const DEFAULT_TEXT_SCALE = 1;
export const MIN_TEXT_SCALE = 1;
export const MAX_TEXT_SCALE = 1.5;
export const TEXT_SCALE_STEP = 0.1;

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getHighContrastPreference(): boolean {
  return readStorage(HIGH_CONTRAST_STORAGE_KEY) === 'true';
}

export function setHighContrastPreference(enabled: boolean) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, String(enabled));
  } catch {
    // The preference still applies to the current page when storage is unavailable.
  }

  document.documentElement.dataset.highContrast = String(enabled);
  window.dispatchEvent(new CustomEvent(ACCESSIBILITY_PREFERENCES_EVENT));
}

export function getTextScalePreference(): number {
  const storedPreference = readStorage(TEXT_SCALE_STORAGE_KEY);
  if (storedPreference === null) return DEFAULT_TEXT_SCALE;

  const storedValue = Number(storedPreference);
  if (!Number.isFinite(storedValue)) return DEFAULT_TEXT_SCALE;
  const normalizedValue = Math.round(storedValue * 10) / 10;
  return Math.min(MAX_TEXT_SCALE, Math.max(MIN_TEXT_SCALE, normalizedValue));
}

export function setTextScalePreference(scale: number) {
  if (typeof window === 'undefined') return;

  const normalizedScale = Math.round(
    Math.min(MAX_TEXT_SCALE, Math.max(MIN_TEXT_SCALE, scale)) * 10,
  ) / 10;

  try {
    window.localStorage.setItem(TEXT_SCALE_STORAGE_KEY, String(normalizedScale));
  } catch {
    // The preference still applies to the current page when storage is unavailable.
  }

  document.documentElement.dataset.textScale = normalizedScale.toFixed(1);
  window.dispatchEvent(new CustomEvent(ACCESSIBILITY_PREFERENCES_EVENT));
}

export function getLoweredScreenPreference(): boolean {
  return readStorage(LOWERED_SCREEN_STORAGE_KEY) === 'true';
}

export function setLoweredScreenPreference(enabled: boolean) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(LOWERED_SCREEN_STORAGE_KEY, String(enabled));
  } catch {
    // The preference still applies to the current page when storage is unavailable.
  }

  document.documentElement.dataset.loweredScreen = String(enabled);
  window.dispatchEvent(new CustomEvent(ACCESSIBILITY_PREFERENCES_EVENT));
}

