import { useEffect } from 'react';

export type ElectronWindowMode = 'kiosk' | 'onboarding' | 'onboarding-update';

declare global {
  interface Window {
    totemDesktop?: {
      setWindowMode: (mode: ElectronWindowMode) => void;
      markOnboardingComplete: () => Promise<boolean>;
      updateTenantIcon: (tenant?: string) => Promise<boolean>;
    };
  }
}

let pendingKioskRequest: number | undefined;

export function useElectronWindowMode(mode: Exclude<ElectronWindowMode, 'kiosk'>) {
  useEffect(() => {
    if (pendingKioskRequest !== undefined) {
      window.clearTimeout(pendingKioskRequest);
      pendingKioskRequest = undefined;
    }
    window.totemDesktop?.setWindowMode(mode);

    return () => {
      pendingKioskRequest = window.setTimeout(() => {
        window.totemDesktop?.setWindowMode('kiosk');
        pendingKioskRequest = undefined;
      }, 0);
    };
  }, [mode]);
}

export function markOnboardingComplete() {
  return window.totemDesktop?.markOnboardingComplete() ?? Promise.resolve(false);
}
