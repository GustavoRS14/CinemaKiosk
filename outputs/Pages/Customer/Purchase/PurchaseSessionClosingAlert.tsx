import { useEffect, useRef, useState } from 'react';
import { Alert } from '@components/Common/Alert';
import { useI18n } from '../../../i18n';
import {
  getShowtimeExpirationTimestamp,
  isShowtimeAvailable,
  useShowtimeClock,
  type ShowtimeAvailability,
} from '@components/Common/ShowtimeButton';
import './PurchaseSessionClosingAlert.css';

export type PurchaseShowtimeSales = Pick<
  ShowtimeAvailability,
  'time' | 'showtimeDate' | 'salesCutoffMinutes' | 'availableSeats'
>;

export function usePurchaseSessionUnavailable(showtime?: PurchaseShowtimeSales) {
  const nowTimestamp = useShowtimeClock(showtime ? [showtime] : []);
  return Boolean(showtime && !isShowtimeAvailable(showtime, nowTimestamp));
}

const getRemainingMinutes = (showtime?: PurchaseShowtimeSales) => {
  if (!showtime) return 0;
  const nowTimestamp = Date.now();
  const expirationTimestamp = getShowtimeExpirationTimestamp(
    showtime,
    new Date(nowTimestamp),
  );
  return expirationTimestamp === null
    ? 0
    : Math.ceil((expirationTimestamp - nowTimestamp) / 60_000);
};

export function useSalesClosingCountdown(showtime?: PurchaseShowtimeSales) {
  const [remainingMinutes, setRemainingMinutes] = useState(() => getRemainingMinutes(showtime));
  const time = showtime?.time;
  const showtimeDate = showtime?.showtimeDate;
  const salesCutoffMinutes = showtime?.salesCutoffMinutes;

  useEffect(() => {
    const currentShowtime = time ? { time, showtimeDate, salesCutoffMinutes } : undefined;
    const updateCountdown = () => setRemainingMinutes(getRemainingMinutes(currentShowtime));
    updateCountdown();
    if (!currentShowtime) return undefined;

    const interval = window.setInterval(updateCountdown, 1_000);
    return () => window.clearInterval(interval);
  }, [salesCutoffMinutes, showtimeDate, time]);

  return remainingMinutes > 0 && remainingMinutes <= 10 ? remainingMinutes : null;
}

export type PurchaseSessionClosingAlertProps = {
  remainingMinutes: number;
};

export function PurchaseSessionClosingAlert({ remainingMinutes }: PurchaseSessionClosingAlertProps) {
  const { t } = useI18n();
  const shellRef = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const shell = shellRef.current;
    const purchasePage = shell?.closest<HTMLElement>('[data-purchase-page]');
    if (!shell || !purchasePage) return undefined;

    const updateAlertHeight = () => {
      purchasePage.style.setProperty('--purchase-session-closing-alert-height', `${shell.offsetHeight}px`);
    };
    updateAlertHeight();
    const observer = new ResizeObserver(updateAlertHeight);
    observer.observe(shell);
    return () => {
      observer.disconnect();
      purchasePage.style.removeProperty('--purchase-session-closing-alert-height');
    };
  }, []);

  return (
    <div ref={shellRef} className="purchase-session-closing-alert-shell">
      <Alert
        className="purchase-session-closing-alert"
        intent="Warning"
        isVisible={!dismissed}
        onClose={() => setDismissed(true)}
        title={t('session.closingTitle')}
        description={(
          <span>{t('session.closingDescription', {
            time: `${remainingMinutes} ${t(remainingMinutes === 1 ? 'session.minute' : 'session.minutes')}`,
          })}</span>
        )}
      />
    </div>
  );
}
