import { useEffect, useState } from 'react';

export type TerminalLocale = 'pt-BR' | 'es-ES' | 'en-US';

export type LanguagePreferences = {
  defaultLocale: TerminalLocale;
  multilingual: boolean;
};

export const LANGUAGE_PREFERENCES_EVENT = 'totem-language-preferences-change';
const LANGUAGE_PREFERENCES_STORAGE_KEY = 'totem-language-preferences';

export const DEFAULT_LANGUAGE_PREFERENCES: LanguagePreferences = {
  defaultLocale: 'pt-BR',
  multilingual: false,
};

const isTerminalLocale = (value: unknown): value is TerminalLocale => (
  value === 'pt-BR' || value === 'es-ES' || value === 'en-US'
);

export function getLanguagePreferences(): LanguagePreferences {
  if (typeof window === 'undefined') return { ...DEFAULT_LANGUAGE_PREFERENCES };

  try {
    const stored = window.localStorage.getItem(LANGUAGE_PREFERENCES_STORAGE_KEY);
    if (!stored) return { ...DEFAULT_LANGUAGE_PREFERENCES };
    const parsed = JSON.parse(stored) as Partial<LanguagePreferences>;
    return {
      defaultLocale: isTerminalLocale(parsed.defaultLocale)
        ? parsed.defaultLocale
        : DEFAULT_LANGUAGE_PREFERENCES.defaultLocale,
      multilingual: typeof parsed.multilingual === 'boolean'
        ? parsed.multilingual
        : DEFAULT_LANGUAGE_PREFERENCES.multilingual,
    };
  } catch {
    return { ...DEFAULT_LANGUAGE_PREFERENCES };
  }
}

export function setLanguagePreferences(preferences: LanguagePreferences) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(LANGUAGE_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Keep the preference active in memory when persistent storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent(LANGUAGE_PREFERENCES_EVENT));
}

export function useLanguagePreferences() {
  const [preferences, setPreferences] = useState<LanguagePreferences>(getLanguagePreferences);

  useEffect(() => {
    const update = () => setPreferences(getLanguagePreferences());
    window.addEventListener(LANGUAGE_PREFERENCES_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(LANGUAGE_PREFERENCES_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return preferences;
}
