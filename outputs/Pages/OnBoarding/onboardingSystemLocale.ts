import type { TerminalLocale } from '../../i18n';

type ElectronLocaleBridge = {
  getSystemLocale?: () => string | Promise<string>;
  getLocale?: () => string | Promise<string>;
};

type ElectronLocaleWindow = Window & {
  electronAPI?: ElectronLocaleBridge;
  electron?: ElectronLocaleBridge;
};

/**
 * Maps only the language subtag. The country/region is intentionally ignored,
 * so values such as en-CA, es-MX and pt-PT use the supported app locale.
 */
export function terminalLocaleFromSystemLocale(systemLocale?: string | null): TerminalLocale | null {
  const language = systemLocale?.trim().toLowerCase().split(/[-_]/)[0];

  if (language === 'pt') return 'pt-BR';
  if (language === 'en') return 'en-US';
  if (language === 'es') return 'es-ES';
  return null;
}

async function readElectronSystemLocale() {
  if (typeof window === 'undefined') return null;

  const electronWindow = window as ElectronLocaleWindow;
  const bridges = [electronWindow.electronAPI, electronWindow.electron];

  for (const bridge of bridges) {
    const reader = bridge?.getSystemLocale ?? bridge?.getLocale;
    if (!reader) continue;

    try {
      const locale = await reader.call(bridge);
      if (locale) return locale;
    } catch {
      // Fall back to the Chromium locale when an optional preload bridge fails.
    }
  }

  return null;
}

/**
 * Electron can expose app.getLocale() through either supported preload bridge.
 * Without a custom bridge, Chromium's navigator.language is derived from the
 * Windows language and remains a safe renderer fallback.
 */
export async function resolveOnboardingSystemLocale(
  systemLocaleOverride?: string | null,
): Promise<TerminalLocale | null> {
  if (systemLocaleOverride !== undefined) {
    return terminalLocaleFromSystemLocale(systemLocaleOverride);
  }

  const electronLocale = await readElectronSystemLocale();
  if (electronLocale) return terminalLocaleFromSystemLocale(electronLocale);

  if (typeof navigator === 'undefined') return null;
  const browserLocale = navigator.language
    || Intl.DateTimeFormat().resolvedOptions().locale;
  return terminalLocaleFromSystemLocale(browserLocale);
}

