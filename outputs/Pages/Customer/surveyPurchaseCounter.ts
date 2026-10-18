import { getLocationPreferences } from '../locationPreferences';

const SURVEY_PURCHASE_COUNT_KEY = 'totem-survey-purchase-count';
const SURVEY_HOLIDAYS_KEY = 'totem-survey-holidays';
const SURVEY_FREQUENCY = 15;

type PurchaseCounts = Record<string, number>;

function locationKey() {
  const { network, complex } = getLocationPreferences();
  return `${network.trim().toLocaleLowerCase()}::${complex.trim().toLocaleLowerCase()}`;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function brazilianHolidayKeys(year: number) {
  const fixedDates = [
    [0, 1], [3, 21], [4, 1], [8, 7], [9, 12],
    [10, 2], [10, 15], [10, 20], [11, 25],
  ] as const;
  const holidays = new Set(fixedDates.map(([month, day]) => dateKey(new Date(year, month, day))));
  const goodFriday = easterSunday(year);
  goodFriday.setDate(goodFriday.getDate() - 2);
  holidays.add(dateKey(goodFriday));
  return holidays;
}

function configuredHolidayKeys() {
  if (typeof window === 'undefined') return [] as string[];
  try {
    const stored = JSON.parse(window.localStorage.getItem(SURVEY_HOLIDAYS_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [] as string[];
  }
}

/** Adds state, municipal or exhibitor-specific holidays to the survey calendar. */
export function setSurveyHolidayDates(dates: readonly string[]) {
  if (typeof window === 'undefined') return;
  try {
    const normalizedDates = [...new Set(dates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)))];
    window.localStorage.setItem(SURVEY_HOLIDAYS_KEY, JSON.stringify(normalizedDates));
  } catch {
    // The national calendar and time restrictions remain active without storage.
  }
}

export function isSurveyAvailableAt(date: Date = new Date()) {
  const day = date.getDay();
  const hour = date.getHours();
  const isFridayEvening = day === 5 && hour >= 18;
  const isWeekendAfternoonOrEvening = (day === 0 || day === 6) && hour >= 12;
  const holidays = brazilianHolidayKeys(date.getFullYear());
  configuredHolidayKeys().forEach((holiday) => holidays.add(holiday));
  return !isFridayEvening
    && !isWeekendAfternoonOrEvening
    && !holidays.has(dateKey(date));
}

export function registerCompletedPurchaseForSurvey() {
  if (typeof window === 'undefined') return false;
  try {
    const counts = JSON.parse(
      window.localStorage.getItem(SURVEY_PURCHASE_COUNT_KEY) ?? '{}',
    ) as PurchaseCounts;
    const key = locationKey();
    const nextCount = Math.max(0, Number(counts[key]) || 0) + 1;
    counts[key] = nextCount;
    window.localStorage.setItem(SURVEY_PURCHASE_COUNT_KEY, JSON.stringify(counts));
    return nextCount % SURVEY_FREQUENCY === 0 && isSurveyAvailableAt();
  } catch {
    return false;
  }
}
