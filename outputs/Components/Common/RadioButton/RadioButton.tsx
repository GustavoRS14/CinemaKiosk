import React, { useState, useEffect } from 'react';
import './RadioButton.css';

export type RadioButtonState = 'Default' | 'Disabled' | 'Read Only';

export type RadioButtonProps = {
  className?: string;
  defaultSelected?: boolean;
  selected?: boolean;
  state?: RadioButtonState;
  onClick?: () => void;
};

export const RadioButton = ({
  className = '',
  defaultSelected = false,
  selected,
  state = 'Default',
  onClick,
}: RadioButtonProps) => {
  const [internalSelected, setInternalSelected] = useState(selected ?? defaultSelected);

  useEffect(() => {
    if (selected !== undefined) {
      setInternalSelected(selected);
    }
  }, [selected]);

  const isDisabled = state === 'Disabled';
  const isReadOnly = state === 'Read Only';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisabled || isReadOnly) return;
    setInternalSelected(true); // Radio buttons usually only select, they don't unselect on click unless grouped
    if (onClick) onClick();
  };

  return (
    <div
      className={`radio-button ${className}`}
      data-state={state}
      data-selected={internalSelected.toString()}
      aria-disabled={isDisabled}
      aria-readonly={isReadOnly}
      onClick={handleClick}
      role="radio"
      aria-checked={internalSelected}
    >
      {/* Inner circle is handled via CSS ::after */}
    </div>
  );
};
