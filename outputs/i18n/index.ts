import { useCallback, useSyncExternalStore } from 'react';
import { ptBR, type TranslationKey } from './Locales/pt-BR';
import {
  getLanguagePreferences,
  LANGUAGE_PREFERENCES_EVENT,
} from './languagePreferences';

export const SUPPORTED_LOCALES = ['pt-BR', 'es-419', 'en-US'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = 'pt-BR';

const messages: Partial<Record<AppLocale, Record<TranslationKey, string>>> = {
  'pt-BR': ptBR,
};

const localeLoaders: Record<Exclude<AppLocale, 'pt-BR'>, () => Promise<Record<TranslationKey, string>>> = {
  'es-419': () => import('./Locales/es-419').then(({ es419 }) => es419),
  'en-US': () => import('./Locales/en-US').then(({ enUS }) => enUS),
};

const CUSTOMER_LOCALE_STORAGE_KEY = 'totem-customer-session-locale';

function readCustomerSessionLocale(): AppLocale | null {
  if (typeof window === 'undefined') return null;
  try {
    const storedLocale = window.sessionStorage.getItem(CUSTOMER_LOCALE_STORAGE_KEY);
    return storedLocale ? normalizeLocale(storedLocale) : null;
  } catch {
    return null;
  }
}

let systemLocale: AppLocale = normalizeLocale(getLanguagePreferences().defaultLocale);
let customerSessionLocale: AppLocale | null = readCustomerSessionLocale();
let localeRequestId = 0;
const listeners = new Set<() => void>();

export function normalizeLocale(locale?: string): AppLocale {
  const normalized = locale?.trim().toLowerCase();
  if (normalized === 'en' || normalized?.startsWith('en-')) return 'en-US';
  if (normalized === 'es' || normalized?.startsWith('es-')) return 'es-419';
  return DEFAULT_LOCALE;
}

export function getLocale() {
  if (typeof window !== 'undefined') {
    const isConfigurationFlow = window.location.pathname.startsWith('/admin')
      || window.location.pathname.startsWith('/onboarding');
    if (isConfigurationFlow) return systemLocale;
  }
  return customerSessionLocale ?? systemLocale;
}

export async function setLocale(locale: AppLocale | string) {
  const nextLocale = normalizeLocale(locale);
  const requestId = ++localeRequestId;
  if (!messages[nextLocale] && nextLocale !== 'pt-BR') {
    messages[nextLocale] = await localeLoaders[nextLocale]();
  }
  if (requestId !== localeRequestId) return;
  systemLocale = nextLocale;
  if (typeof document !== 'undefined') document.documentElement.lang = nextLocale;
  listeners.forEach((listener) => listener());
}

export async function setCustomerLocale(locale: AppLocale | string) {
  const nextLocale = normalizeLocale(locale);
  const requestId = ++localeRequestId;
  try {
    window.sessionStorage.setItem(CUSTOMER_LOCALE_STORAGE_KEY, nextLocale);
  } catch {
    // The in-memory override still keeps the customer session translated.
  }
  customerSessionLocale = nextLocale;
  if (!messages[nextLocale] && nextLocale !== 'pt-BR') {
    messages[nextLocale] = await localeLoaders[nextLocale]();
  }
  if (requestId !== localeRequestId) return;
  if (typeof document !== 'undefined') document.documentElement.lang = nextLocale;
  listeners.forEach((listener) => listener());
}

if (typeof window !== 'undefined') {
  const syncConfiguredLocale = () => setLocale(getLanguagePreferences().defaultLocale);
  window.addEventListener(LANGUAGE_PREFERENCES_EVENT, syncConfiguredLocale);
  window.addEventListener('storage', syncConfiguredLocale);
}

export function resetLocale() {
  localeRequestId += 1;
  customerSessionLocale = null;
  try {
    window.sessionStorage.removeItem(CUSTOMER_LOCALE_STORAGE_KEY);
  } catch {
    // The in-memory session is still cleared when storage is unavailable.
  }
  const defaultLocale = normalizeLocale(getLanguagePreferences().defaultLocale);
  if (typeof document !== 'undefined') document.documentElement.lang = defaultLocale;
  listeners.forEach((listener) => listener());
}

export function finishCustomerSession() {
  resetLocale();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function interpolate(message: string, values?: Record<string, string | number>) {
  if (!values) return message;
  return message.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match,
  );
}

export function translate(
  key: TranslationKey,
  values?: Record<string, string | number>,
  locale = getLocale(),
) {
  return interpolate(messages[locale]?.[key] ?? ptBR[key], values);
}

if (systemLocale !== DEFAULT_LOCALE) void setLocale(systemLocale);
if (customerSessionLocale && customerSessionLocale !== DEFAULT_LOCALE) {
  void setCustomerLocale(customerSessionLocale);
}

export function useI18n() {
  const locale = useSyncExternalStore(subscribe, getLocale, () => normalizeLocale(getLanguagePreferences().defaultLocale));
  const t = useCallback(
    (key: TranslationKey, values?: Record<string, string | number>) =>
      translate(key, values, locale),
    [locale],
  );

  return { locale, setLocale, setCustomerLocale, resetLocale, finishCustomerSession, t } as const;
}

export type { TranslationKey } from './Locales/pt-BR';
export {
  getLanguagePreferences,
  setLanguagePreferences,
  useLanguagePreferences,
  type LanguagePreferences,
  type TerminalLocale,
} from './languagePreferences';
