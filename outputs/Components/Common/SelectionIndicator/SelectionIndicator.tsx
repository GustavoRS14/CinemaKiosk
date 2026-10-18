import React, { useState, useEffect } from 'react';
import './SelectionIndicator.css';
import CheckIcon from '@icons/Check.svg';

export type SelectionIndicatorProps = {
  className?: string;
  selected?: boolean;
  state?: 'Default' | 'Pressed' | 'Read Only' | 'Disabled';
  onClick?: () => void;
  /** Leaves selection state entirely under the parent component's control. */
  controlled?: boolean;
};

export const SelectionIndicator = ({
  className = '',
  selected = false,
  state = 'Default',
  onClick,
  controlled = false,
}: SelectionIndicatorProps) => {
  const [internalSelected, setInternalSelected] = useState(selected);

  // Sync state if prop changes
  useEffect(() => {
    setInternalSelected(selected);
  }, [selected]);

  const isBlocked = state === 'Disabled' || state === 'Read Only';

  const handleClick = () => {
    if (isBlocked) return;
    if (!controlled) setInternalSelected((prev) => !prev);
    if (onClick) onClick();
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={internalSelected}
      className={`selection-indicator selection-indicator-container ${className}`.trim()}
      data-state={state}
      data-selected={internalSelected.toString()}
      disabled={isBlocked}
      onClick={handleClick}
    >
      <CheckIcon aria-hidden="true" className="selection-indicator-icon"/>
    </button>
  );
};
