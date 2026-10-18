import { useEffect, useMemo, useState } from 'react';

export const DEFAULT_SALES_CUTOFF_MINUTES = 15;

export type ShowtimeAvailability = {
  time: string;
  showtimeDate?: Date | string;
  salesCutoffMinutes?: number;
  /** Undefined means the inventory has not been informed; zero means sold out. */
  availableSeats?: number;
};

function resolveShowtimeDate(showtimeDate: Date | string | undefined, now: Date) {
  if (showtimeDate instanceof Date && !Number.isNaN(showtimeDate.getTime())) {
    return new Date(showtimeDate);
  }

  if (typeof showtimeDate === 'string') {
    const dateOnly = showtimeDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) {
      return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    }

    const parsedDate = new Date(showtimeDate);
    if (!Number.isNaN(parsedDate.getTime())) return parsedDate;
  }

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getShowtimeExpirationTimestamp(
  showtime: ShowtimeAvailability,
  now = new Date(),
  defaultSalesCutoffMinutes = DEFAULT_SALES_CUTOFF_MINUTES,
) {
  const timeMatch = showtime.time.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!timeMatch) return null;

  const start = resolveShowtimeDate(showtime.showtimeDate, now);
  start.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);

  const cutoff = Math.max(
    0,
    showtime.salesCutoffMinutes ?? defaultSalesCutoffMinutes,
  );

  return start.getTime() + cutoff * 60_000;
}

export function isShowtimeAvailable(
  showtime: ShowtimeAvailability,
  nowTimestamp = Date.now(),
  defaultSalesCutoffMinutes = DEFAULT_SALES_CUTOFF_MINUTES,
) {
  if (showtime.availableSeats !== undefined && showtime.availableSeats <= 0) {
    return false;
  }

  const expiration = getShowtimeExpirationTimestamp(
    showtime,
    new Date(nowTimestamp),
    defaultSalesCutoffMinutes,
  );

  return expiration === null || nowTimestamp < expiration;
}

/**
 * Keeps consumers synchronized with the nearest sales cutoff without polling.
 * The returned timestamp changes only when a showtime crosses its cutoff.
 */
export function useShowtimeClock(
  showtimes: readonly ShowtimeAvailability[],
  defaultSalesCutoffMinutes = DEFAULT_SALES_CUTOFF_MINUTES,
) {
  const signature = useMemo(
    () => showtimes
      .map(({ time, showtimeDate, salesCutoffMinutes, availableSeats }) => (
        `${time}|${showtimeDate instanceof Date ? showtimeDate.getTime() : showtimeDate ?? ''}|${salesCutoffMinutes ?? ''}|${availableSeats ?? ''}`
      ))
      .join(';'),
    [showtimes],
  );
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  useEffect(() => {
    const currentTimestamp = Date.now();
    const nextExpiration = showtimes
      .map((showtime) => getShowtimeExpirationTimestamp(
        showtime,
        new Date(currentTimestamp),
        defaultSalesCutoffMinutes,
      ))
      .filter((expiration): expiration is number => (
        expiration !== null && expiration > currentTimestamp
      ))
      .sort((a, b) => a - b)[0];

    setNowTimestamp(currentTimestamp);
    if (nextExpiration === undefined) return undefined;

    const timeout = window.setTimeout(
      () => setNowTimestamp(Date.now()),
      Math.min(nextExpiration - currentTimestamp + 25, 2_147_483_647),
    );

    return () => window.clearTimeout(timeout);
  }, [defaultSalesCutoffMinutes, signature]);

  return nowTimestamp;
}
