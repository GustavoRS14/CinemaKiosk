export type ThemePreference = 'light' | 'dark';
export type OrientationPreference = 'automatic' | 'vertical' | 'horizontal';

export const DISPLAY_PREFERENCES_EVENT = 'totem-display-preferences-change';

const THEME_STORAGE_KEY = 'totem-theme';
const THEME_SOURCE_STORAGE_KEY = 'totem-theme-source';
const ORIENTATION_STORAGE_KEY = 'totem-orientation';

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The preference still applies to the current page when storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent(DISPLAY_PREFERENCES_EVENT));
}

export function getThemePreference(): ThemePreference {
  return readStorage(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

export function hasThemePreference(): boolean {
  const value = readStorage(THEME_STORAGE_KEY);
  return value === 'light' || value === 'dark';
}

export function hasManualThemePreference(): boolean {
  if (!hasThemePreference()) return false;
  // Preferences saved before source tracking are preserved as user choices.
  return readStorage(THEME_SOURCE_STORAGE_KEY) !== 'automatic';
}

export function setThemePreference(theme: ThemePreference, source: 'automatic' | 'manual' = 'manual') {
  writeStorage(THEME_SOURCE_STORAGE_KEY, source);
  writeStorage(THEME_STORAGE_KEY, theme);
}

export function getOrientationPreference(): OrientationPreference {
  const value = readStorage(ORIENTATION_STORAGE_KEY);
  return value === 'vertical' || value === 'horizontal' ? value : 'automatic';
}

export function setOrientationPreference(orientation: OrientationPreference) {
  writeStorage(ORIENTATION_STORAGE_KEY, orientation);
}
