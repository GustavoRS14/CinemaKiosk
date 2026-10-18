import { getFeaturePreferences } from './featurePreferences';

export const DELIVERY_ROOM_TYPES = ['2D', '3D', 'Laser', 'Azul', 'VIP'] as const;

export type DeliveryRoomType = typeof DELIVERY_ROOM_TYPES[number];
export type DeliveryPurchaseType = 'combined' | 'standalone';

export type DeliveryPreferences = {
  enabled: boolean;
  modes: [combined: boolean, standalone: boolean];
  schedule: boolean[][];
};

const DELIVERY_STORAGE_KEY = 'totem-seat-delivery-preferences';
export const DELIVERY_PREFERENCES_EVENT = 'totem-seat-delivery-preferences-change';

export const DEFAULT_DELIVERY_SCHEDULE = [
  [false, true, true, true, true, false, false, false],
  [false, true, true, true, true, false, false, false],
  [false, true, true, true, true, false, false, true],
  [false, true, true, true, true, false, false, false],
  [true, true, true, true, true, true, true, true],
];

export const DEFAULT_DELIVERY_PREFERENCES: DeliveryPreferences = {
  enabled: false,
  modes: [true, false],
  schedule: DEFAULT_DELIVERY_SCHEDULE.map((days) => [...days]),
};

export function getDeliveryPreferences(): DeliveryPreferences {
  if (typeof window === 'undefined') return structuredClone(DEFAULT_DELIVERY_PREFERENCES);
  try {
    const serialized = window.localStorage.getItem(DELIVERY_STORAGE_KEY);
    const stored = JSON.parse(serialized ?? '{}') as Partial<DeliveryPreferences>;
    const modes: DeliveryPreferences['modes'] = Array.isArray(stored.modes)
      ? [Boolean(stored.modes[0]), Boolean(stored.modes[1])]
      : [...DEFAULT_DELIVERY_PREFERENCES.modes];
    return {
      enabled: Boolean(serialized ? stored.enabled : getFeaturePreferences().seatDelivery) && modes.some(Boolean),
      modes,
      schedule: Array.isArray(stored.schedule)
        ? DEFAULT_DELIVERY_SCHEDULE.map((fallback, index) =>
          fallback.map((value, day) => Boolean(stored.schedule?.[index]?.[day] ?? value)))
        : DEFAULT_DELIVERY_SCHEDULE.map((days) => [...days]),
    };
  } catch {
    return structuredClone(DEFAULT_DELIVERY_PREFERENCES);
  }
}

export function isSeatDeliveryConfigured(purchaseType: DeliveryPurchaseType) {
  const preferences = getDeliveryPreferences();
  const modeIndex = purchaseType === 'combined' ? 0 : 1;
  return Boolean(preferences.enabled && preferences.modes[modeIndex]);
}

export function setDeliveryPreferences(preferences: DeliveryPreferences) {
  if (typeof window === 'undefined') return;
  const normalized = { ...preferences, enabled: preferences.enabled && preferences.modes.some(Boolean) };
  try {
    window.localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // The active screen remains usable when persistent storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(DELIVERY_PREFERENCES_EVENT));
}

export function isSeatDeliveryAvailable({
  purchaseType,
  roomType = '2D',
  date = new Date(),
  isHoliday = false,
}: {
  purchaseType: DeliveryPurchaseType;
  roomType?: DeliveryRoomType;
  date?: Date;
  isHoliday?: boolean;
}) {
  const preferences = getDeliveryPreferences();
  const modeIndex = purchaseType === 'combined' ? 0 : 1;
  const roomIndex = DELIVERY_ROOM_TYPES.indexOf(roomType);
  const dayIndex = isHoliday ? 7 : date.getDay();
  return Boolean(
    preferences.enabled
    && preferences.modes[modeIndex]
    && preferences.schedule[roomIndex]?.[dayIndex],
  );
}

export function formatSeatDeliveryEstimate(now = new Date()) {
  const start = new Date(now.getTime() + 25 * 60_000);
  const end = new Date(now.getTime() + 45 * 60_000);
  const format = (value: Date) => `${String(value.getHours()).padStart(2, '0')}h${String(value.getMinutes()).padStart(2, '0')}`;
  return `${format(start)} - ${format(end)}`;
}
