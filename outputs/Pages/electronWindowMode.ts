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

const ONBOARDING_OFFLINE_PATH = '/onboarding/offline';
const ONBOARDING_ENTRY_PATH = '/onboarding';
const ONBOARDING_RETURN_PATH_KEY = 'totem-onboarding-return-path';

function navigateTo(pathname: string) {
  if (window.location.pathname === pathname) return;
  window.history.pushState({}, '', pathname);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function useElectronWindowMode(mode: Exclude<ElectronWindowMode, 'kiosk'>) {
  useEffect(() => {
    if (pendingKioskRequest !== undefined) {
      window.clearTimeout(pendingKioskRequest);
      pendingKioskRequest = undefined;
    }
    window.totemDesktop?.setWindowMode(mode);

    const showOfflinePage = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== ONBOARDING_OFFLINE_PATH && currentPath.startsWith('/onboarding')) {
        window.sessionStorage.setItem(ONBOARDING_RETURN_PATH_KEY, currentPath);
      }
      navigateTo(ONBOARDING_OFFLINE_PATH);
    };

    const resumeOnboarding = () => {
      if (window.location.pathname !== ONBOARDING_OFFLINE_PATH) return;
      const savedPath = window.sessionStorage.getItem(ONBOARDING_RETURN_PATH_KEY);
      window.sessionStorage.removeItem(ONBOARDING_RETURN_PATH_KEY);
      navigateTo(savedPath?.startsWith('/onboarding') && savedPath !== ONBOARDING_OFFLINE_PATH
        ? savedPath
        : ONBOARDING_ENTRY_PATH);
    };

    window.addEventListener('offline', showOfflinePage);
    window.addEventListener('online', resumeOnboarding);
    if (window.navigator.onLine) resumeOnboarding();
    else showOfflinePage();

    return () => {
      window.removeEventListener('offline', showOfflinePage);
      window.removeEventListener('online', resumeOnboarding);
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
