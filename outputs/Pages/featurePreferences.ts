import { useEffect, useState } from 'react';

export type TicketCategoryFilterPreference = 'all' | 'promotional' | 'full' | 'half';

export type FeaturePreferences = {
  ageRatingNotice: boolean;
  acceptCouponsAndVouchers: boolean;
  productCustomization: boolean;
  loyaltyProgram: boolean;
  groupSalesSchoolProject: boolean;
  crossSellUpsell: boolean;
  inclusiveSessionNotice: boolean;
  seatDelivery: boolean;
  showOccupancyLevel: boolean;
  showEstimatedEndTime: boolean;
  showAuditorium: boolean;
  showExperienceBadges: boolean;
  formatDurationToMinutes: boolean;
  ticketCategoryFilter: boolean;
  ticketCategoryFilterDefault: TicketCategoryFilterPreference;
  experienceLogoMode: 'all' | 'custom';
  selectedExperienceLogos: string[];
};

export const EXPERIENCE_LOGO_OPTIONS = ['3D', 'VIP', 'Laser', 'Dolby Atmos', 'IMAX', 'Infinity Vision'] as const;

export const FEATURE_PREFERENCES_EVENT = 'totem-feature-preferences-change';

const FEATURE_STORAGE_KEY = 'totem-feature-preferences';

export const DEFAULT_FEATURE_PREFERENCES: FeaturePreferences = {
  ageRatingNotice: false,
  acceptCouponsAndVouchers: true,
  productCustomization: false,
  loyaltyProgram: true,
  groupSalesSchoolProject: false,
  crossSellUpsell: true,
  inclusiveSessionNotice: true,
  seatDelivery: false,
  showOccupancyLevel: false,
  showEstimatedEndTime: false,
  showAuditorium: false,
  showExperienceBadges: false,
  formatDurationToMinutes: false,
  ticketCategoryFilter: false,
  ticketCategoryFilterDefault: 'all',
  experienceLogoMode: 'all',
  selectedExperienceLogos: [...EXPERIENCE_LOGO_OPTIONS],
};

export function getFeaturePreferences(): FeaturePreferences {
  if (typeof window === 'undefined') return { ...DEFAULT_FEATURE_PREFERENCES };

  try {
    const stored = window.localStorage.getItem(FEATURE_STORAGE_KEY);
    if (!stored) return { ...DEFAULT_FEATURE_PREFERENCES };
    return { ...DEFAULT_FEATURE_PREFERENCES, ...JSON.parse(stored) };
  } catch {
    return { ...DEFAULT_FEATURE_PREFERENCES };
  }
}

export function setFeaturePreferences(preferences: FeaturePreferences) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(FEATURE_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // The current screen remains usable when persistent storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent(FEATURE_PREFERENCES_EVENT));
}

export function useFeaturePreferences(): FeaturePreferences {
  const [preferences, setPreferences] = useState<FeaturePreferences>(getFeaturePreferences);

  useEffect(() => {
    const update = () => setPreferences(getFeaturePreferences());
    window.addEventListener(FEATURE_PREFERENCES_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(FEATURE_PREFERENCES_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return preferences;
}
