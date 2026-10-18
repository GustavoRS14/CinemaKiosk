const LAST_INSTALLED_UPDATE_KEY = 'totem-last-installed-system-update';

export function getLastInstalledSystemUpdate(): Date | null {
  if (typeof window === 'undefined') return null;
  try {
    const storedValue = window.localStorage.getItem(LAST_INSTALLED_UPDATE_KEY);
    if (!storedValue) return null;
    const date = new Date(storedValue);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export function setLastInstalledSystemUpdate(date: Date) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAST_INSTALLED_UPDATE_KEY, date.toISOString());
  } catch {
    // The current Admin session still shows the applied update date.
  }
}
