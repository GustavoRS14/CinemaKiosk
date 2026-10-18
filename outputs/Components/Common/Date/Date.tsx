import React, { useState, useEffect } from 'react';
import { useI18n, type TranslationKey } from '../../../i18n';
import './Date.css';

export type DateProps = {
  className?: string;
  day?: string;
  date?: string;
  month?: string;
  selected?: boolean;
  onClick?: () => void;
};

export const DateComponent = ({
  className = '',
  day = 'Seg',
  date = '20',
  month = 'Jul',
  selected = false,
  onClick,
}: DateProps) => {
  const { t } = useI18n();
  const dayKeys: Record<string, TranslationKey> = {
    Dom: 'calendar.sun', Seg: 'calendar.mon', Ter: 'calendar.tue', Qua: 'calendar.wed',
    Qui: 'calendar.thu', Sex: 'calendar.fri', Sáb: 'calendar.sat',
  };
  const monthKeys: Record<string, TranslationKey> = { Mar: 'calendar.mar', Jul: 'calendar.jul' };
  const [internalSelected, setInternalSelected] = useState(selected);

  useEffect(() => {
    setInternalSelected(selected);
  }, [selected]);

  const handleClick = () => {
    setInternalSelected(!internalSelected);
    if (onClick) onClick();
  };

  return (
    <div
      className={`date-component ${className}`}
      data-selected={internalSelected.toString()}
      onClick={handleClick}
    >
      <div className="date-component-day">
        <p>{dayKeys[day] ? t(dayKeys[day]) : day}</p>
      </div>
      <div className="date-component-number">
        <p>{date}</p>
      </div>
      <div className="date-component-month">
        <p>{monthKeys[month] ? t(monthKeys[month]) : month}</p>
      </div>
    </div>
  );
};
