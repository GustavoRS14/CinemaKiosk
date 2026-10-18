import { useCallback, useEffect, useRef, useState } from 'react';
import ServerErrorIllustration from '@illustrations/ServerError.svg';
import CriticalErrorIllustration from '@illustrations/CriticalError.svg';
import InactivityIllustration from '@illustrations/Inactivity.svg';
import { ActionDialog } from '../Dialog/ActionDialog';
import { OverlaySurface } from '../OverlaySurface';
import { useOrientation } from '../../../Pages/useOrientation';
import { useI18n } from '../../../i18n';
import './SystemSessionOverlays.css';

const SYSTEM_ERROR_EVENT = 'totem-system-error';
const INACTIVITY_MONITORING_EVENT = 'totem-inactivity-monitoring-change';
const ERROR_COUNT_KEY = 'totem-consecutive-system-errors';
const INACTIVITY_DELAY_MS = 60_000;
const INACTIVITY_COUNTDOWN_SECONDS = 30;

type RetryRequest = () => void | Promise<void>;

export function reportSystemError(retry?: RetryRequest) {
  window.dispatchEvent(new CustomEvent(SYSTEM_ERROR_EVENT, { detail: { retry } }));
}

export function resolveSystemError() {
  try {
    window.sessionStorage.setItem(ERROR_COUNT_KEY, '0');
  } catch {
    // Session state remains functional when storage is unavailable.
  }
}

export function setInactivityMonitoringEnabled(enabled: boolean) {
  window.dispatchEvent(new CustomEvent(INACTIVITY_MONITORING_EVENT, { detail: { enabled } }));
}

function navigateTo(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function readErrorCount() {
  try {
    return Number.parseInt(window.sessionStorage.getItem(ERROR_COUNT_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

export type SystemSessionOverlaysProps = {
  monitorInactivity?: boolean;
  monitorConnectivity?: boolean;
};

export function SystemSessionOverlays({
  monitorInactivity = true,
  monitorConnectivity = true,
}: SystemSessionOverlaysProps) {
  const orientation = useOrientation();
  const { resetLocale, t } = useI18n();
  const [errorCount, setErrorCount] = useState(0);
  const [errorOpen, setErrorOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const retryRef = useRef<RetryRequest>();
  const [inactivityOpen, setInactivityOpen] = useState(false);
  const [inactivityEnabled, setInactivityEnabled] = useState(monitorInactivity);
  const [remainingSeconds, setRemainingSeconds] = useState(INACTIVITY_COUNTDOWN_SECONDS);
  const inactivityTimerRef = useRef<number>();

  const scheduleInactivity = useCallback(() => {
    if (!inactivityEnabled) return;
    if (inactivityTimerRef.current !== undefined) window.clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = window.setTimeout(() => {
      setRemainingSeconds(INACTIVITY_COUNTDOWN_SECONDS);
      setInactivityOpen(true);
    }, INACTIVITY_DELAY_MS);
  }, [inactivityEnabled]);

  useEffect(() => {
    setInactivityEnabled(monitorInactivity);
    if (!monitorInactivity) {
      setInactivityOpen(false);
      if (inactivityTimerRef.current !== undefined) {
        window.clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = undefined;
      }
    }
  }, [monitorInactivity]);

  useEffect(() => {
    if (!monitorConnectivity) return undefined;

    const showOfflinePage = () => {
      if (window.location.pathname !== '/offline') navigateTo('/offline');
    };
    const returnToHome = () => {
      if (window.location.pathname !== '/offline') return;
      resetLocale();
      navigateTo('/');
    };

    window.addEventListener('offline', showOfflinePage);
    window.addEventListener('online', returnToHome);

    if (!window.navigator.onLine) showOfflinePage();
    else returnToHome();

    return () => {
      window.removeEventListener('offline', showOfflinePage);
      window.removeEventListener('online', returnToHome);
    };
  }, [monitorConnectivity, resetLocale]);

  useEffect(() => {
    const updateMonitoring = (event: Event) => {
      const enabled = (event as CustomEvent<{ enabled: boolean }>).detail.enabled;
      setInactivityEnabled(enabled && monitorInactivity);
      if (!enabled) {
        setInactivityOpen(false);
        if (inactivityTimerRef.current !== undefined) window.clearTimeout(inactivityTimerRef.current);
      }
    };
    window.addEventListener(INACTIVITY_MONITORING_EVENT, updateMonitoring);
    return () => window.removeEventListener(INACTIVITY_MONITORING_EVENT, updateMonitoring);
  }, [monitorInactivity]);

  useEffect(() => {
    if (!inactivityEnabled) return undefined;
    const registerActivity = () => {
      if (!inactivityOpen) scheduleInactivity();
    };
    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'wheel'];
    events.forEach((event) => window.addEventListener(event, registerActivity, { passive: true }));
    scheduleInactivity();
    return () => {
      events.forEach((event) => window.removeEventListener(event, registerActivity));
      if (inactivityTimerRef.current !== undefined) window.clearTimeout(inactivityTimerRef.current);
    };
  }, [inactivityEnabled, inactivityOpen, scheduleInactivity]);

  useEffect(() => {
    if (!inactivityOpen) return undefined;
    if (inactivityTimerRef.current !== undefined) window.clearTimeout(inactivityTimerRef.current);
    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setInactivityOpen(false);
          resetLocale();
          navigateTo('/');
          return 0;
        }
        return current - 1;
      });
    }, 1_000);
    return () => window.clearInterval(interval);
  }, [inactivityOpen, resetLocale]);

  useEffect(() => {
    const showError = (event: Event) => {
      const nextCount = readErrorCount() + 1;
      try {
        window.sessionStorage.setItem(ERROR_COUNT_KEY, String(nextCount));
      } catch {
        // Keep the in-memory counter when storage is unavailable.
      }
      retryRef.current = (event as CustomEvent<{ retry?: RetryRequest }>).detail?.retry;
      setErrorCount(nextCount);
      setErrorOpen(true);
    };
    window.addEventListener(SYSTEM_ERROR_EVENT, showError);
    return () => window.removeEventListener(SYSTEM_ERROR_EVENT, showError);
  }, []);

  const retry = async () => {
    if (!retryRef.current || retrying) return;
    setRetrying(true);
    try {
      await retryRef.current();
      resolveSystemError();
      setErrorOpen(false);
    } catch {
      const nextCount = errorCount + 1;
      try {
        window.sessionStorage.setItem(ERROR_COUNT_KEY, String(nextCount));
      } catch {
        // Keep the in-memory counter when storage is unavailable.
      }
      setErrorCount(nextCount);
    } finally {
      setRetrying(false);
    }
  };

  const critical = errorCount >= 3;
  const configurationFlow = window.location.pathname.startsWith('/admin')
    || window.location.pathname.startsWith('/onboarding');

  const keepCurrentOrder = () => {
    setInactivityOpen(false);
    scheduleInactivity();
  };

  return (
    <>
      <OverlaySurface open={errorOpen} kind="modal" orientation={orientation} closeOnBackdrop={false} onClose={() => undefined}>
        <ActionDialog
          size="md"
          illustration={!configurationFlow && critical
            ? <CriticalErrorIllustration aria-hidden="true" />
            : <ServerErrorIllustration aria-hidden="true" />}
          title={configurationFlow
            ? 'Falha de comunicação'
            : critical ? t('systemError.criticalTitle') : t('systemError.temporaryTitle')}
          description={configurationFlow
            ? 'Houve um erro inesperado de comunicação com a matriz. Por favor, tente executar a ação novamente.'
            : critical
              ? t('systemError.criticalDescription')
              : t('systemError.temporaryDescription')}
          secondaryActionLabel={configurationFlow ? t('action.back') : critical ? t('checkout.tryAgain') : t('systemError.backMovies')}
          primaryActionLabel={configurationFlow ? t('checkout.tryAgain') : critical ? t('systemError.backHome') : t('checkout.tryAgain')}
          onSecondaryAction={configurationFlow
            ? () => setErrorOpen(false)
            : critical ? retry : () => navigateTo('/movies')}
          onPrimaryAction={configurationFlow ? retry : critical ? () => {
            resetLocale();
            navigateTo('/');
          } : retry}
        />
      </OverlaySurface>

      <OverlaySurface
        open={inactivityOpen}
        kind="modal"
        orientation={orientation}
        className="system-session-overlays__inactivity-surface"
        closeOnBackdrop
        portal
        onClose={keepCurrentOrder}
      >
        <div
          className="system-session-overlays__inactivity-content"
          onClick={(event) => {
            const clickedButton = event.target instanceof Element
              ? event.target.closest('button')
              : null;
            const endNowButton = event.currentTarget.querySelector(
              '.action-dialog-action-group button:first-of-type',
            );

            if (clickedButton === endNowButton) return;
            keepCurrentOrder();
          }}
        >
          <ActionDialog
            size="md"
            illustration={<InactivityIllustration className="system-session-overlays__inactivity-illustration" aria-hidden="true" />}
            title={t('inactivity.title')}
            description={(
              <span>
                {t('inactivity.prefix')}{' '}
                <strong className="system-session-overlays__countdown">{t('inactivity.seconds', { count: remainingSeconds })}</strong>{' '}
                {t('inactivity.suffix')}
              </span>
            )}
            secondaryActionLabel={t('inactivity.endNow')}
            primaryActionLabel={t('purchase.keepOrder')}
            onSecondaryAction={() => {
              setInactivityOpen(false);
              resetLocale();
              navigateTo('/');
            }}
          />
        </div>
      </OverlaySurface>
    </>
  );
}
