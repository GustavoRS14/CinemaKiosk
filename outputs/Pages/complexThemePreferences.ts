import { setThemePreference, type ThemePreference } from './displayPreferences';
import { getLocationPreferences, type TerminalLocation } from './locationPreferences';

const THEMES_STORAGE_KEY = 'totem-complex-theme-settings';
const APPLIED_STORAGE_KEY = 'totem-complex-theme-last-applied';
const CHANNEL_NAME = 'totem-complex-theme-sync';

export type ComplexThemeUpdate = TerminalLocation & {
  theme: ThemePreference;
  revision: string;
  updatedAt: number;
};

const locationKey = ({ network, complex }: TerminalLocation) =>
  `${network.trim().toLocaleLowerCase('pt-BR')}::${complex.trim().toLocaleLowerCase('pt-BR')}`;

const sameLocation = (left: TerminalLocation, right: TerminalLocation) =>
  locationKey(left) === locationKey(right);

const readUpdates = (): Record<string, ComplexThemeUpdate> => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(THEMES_STORAGE_KEY) ?? '{}') as Record<string, ComplexThemeUpdate>;
  } catch {
    return {};
  }
};

const isHomePage = () => Boolean(document.querySelector('.customer-home-page'));

export function applyComplexThemeUpdate(update: ComplexThemeUpdate, force = false) {
  if (typeof window === 'undefined' || !sameLocation(update, getLocationPreferences())) return false;
  if (!force && !isHomePage()) return false;
  if (window.localStorage.getItem(APPLIED_STORAGE_KEY) === update.revision) return true;
  setThemePreference(update.theme, 'manual');
  window.localStorage.setItem(APPLIED_STORAGE_KEY, update.revision);
  return true;
}

export function applyPendingComplexThemeOnHome() {
  const currentLocation = getLocationPreferences();
  const update = readUpdates()[locationKey(currentLocation)];
  return update ? applyComplexThemeUpdate(update, true) : false;
}

export function receiveComplexThemeUpdate(update: ComplexThemeUpdate) {
  if (typeof window === 'undefined') return;
  const updates = readUpdates();
  const key = locationKey(update);
  if (!updates[key] || updates[key].updatedAt <= update.updatedAt) {
    updates[key] = update;
    window.localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(updates));
  }
  applyComplexThemeUpdate(update);
}

export function publishComplexTheme(theme: ThemePreference, location: TerminalLocation) {
  if (typeof window === 'undefined') return;
  const update: ComplexThemeUpdate = {
    ...location,
    theme,
    updatedAt: Date.now(),
    revision: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
  receiveComplexThemeUpdate(update);
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(update);
    channel.close();
  }
}

export function subscribeToComplexThemeUpdates() {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return () => undefined;
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event: MessageEvent<ComplexThemeUpdate>) => receiveComplexThemeUpdate(event.data);
  return () => channel.close();
}
