import React, { useState } from 'react';
import './ShowtimeButton.css';
import {
  DEFAULT_SALES_CUTOFF_MINUTES,
  isShowtimeAvailable,
  useShowtimeClock,
} from './showtimeAvailability';
import { useFeaturePreferences } from '../../../Pages/featurePreferences';
import { useI18n } from '../../../i18n';
import { formatLocalizedShowtime } from '../movieLocalization';

export interface ShowtimeButtonProps {
  time?: string;
  occupancyState?: 'Normal' | 'High' | 'Critical';
  occupancyPercentage?: number;
  availableSeats?: number;
  defaultSelected?: boolean;
  selected?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  badgeElement?: React.ReactNode;
  /** Date of the session. When omitted, the session is treated as occurring today. */
  showtimeDate?: Date | string;
  /** Hidden business rule: minutes after start time during which sales remain available. */
  salesCutoffMinutes?: number;
  onClick?: () => void;
}

export const ShowtimeButton: React.FC<ShowtimeButtonProps> = ({
  time = '10:00',
  occupancyState = 'Normal',
  occupancyPercentage,
  availableSeats,
  defaultSelected = false,
  selected,
  selectable = false,
  disabled = false,
  readOnly = false,
  badgeElement,
  showtimeDate,
  salesCutoffMinutes = DEFAULT_SALES_CUTOFF_MINUTES,
  onClick,
}) => {
  const { showOccupancyLevel } = useFeaturePreferences();
  const { locale, t } = useI18n();
  const resolvedOccupancyState: NonNullable<ShowtimeButtonProps['occupancyState']> = !showOccupancyLevel
    ? 'Normal'
    : availableSeats !== undefined && availableSeats <= 20
      ? 'Critical'
      : occupancyPercentage !== undefined && occupancyPercentage >= 60
        ? 'High'
        : 'Normal';
  const [internalSelected, setInternalSelected] = useState(selected ?? defaultSelected);
  const isSelected = selected ?? internalSelected;
  const availability = [{ time, showtimeDate, salesCutoffMinutes, availableSeats }];
  const nowTimestamp = useShowtimeClock(availability, salesCutoffMinutes);

  if (!isShowtimeAvailable(availability[0], nowTimestamp, salesCutoffMinutes)) {
    return null;
  }

  const handleClick = () => {
    if (disabled || readOnly) return;
    if (selectable) {
      if (selected === undefined) setInternalSelected((prev) => !prev);
    }
    if (onClick) onClick();
  };

  const renderSubtitle = () => {
    if (selectable) return null;

    if (resolvedOccupancyState === 'High' && occupancyPercentage !== undefined && occupancyPercentage >= 60) {
      return <span className="showtime-button-subtitle">{t('movie.occupiedPercentage', { count: occupancyPercentage })}</span>;
    }
    if (resolvedOccupancyState === 'Critical' && availableSeats !== undefined && availableSeats <= 20) {
      return <span className="showtime-button-subtitle">{t('movie.remainingSeats', { count: availableSeats })}</span>;
    }
    return null;
  };

  return (
    <button
      className="showtime-button"
      data-locale={locale}
      data-selected={isSelected}
      data-occupancy={resolvedOccupancyState}
      disabled={disabled}
      aria-readonly={readOnly}
      onClick={handleClick}
      type="button"
    >
      {badgeElement && (
        <div className="showtime-button-badge">
          {badgeElement}
        </div>
      )}
      <span className="showtime-button-time">{formatLocalizedShowtime(time, locale)}</span>
      {renderSubtitle()}
    </button>
  );
};
