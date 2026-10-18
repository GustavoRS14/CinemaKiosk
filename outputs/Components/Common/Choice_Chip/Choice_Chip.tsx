import React, { useState, useEffect } from 'react';
import './Choice_Chip.css';

export type Choice_ChipProps = {
  className?: string;
  selected?: boolean;
  state?: 'Default' | 'Pressed' | 'Read Only' | 'Disabled';
  optionName?: string;
  controlledSelection?: boolean;
  onClick?: () => void;
};

export const Choice_Chip = ({
  className = '',
  selected = true,
  state = 'Default',
  optionName = 'Opção',
  controlledSelection = false,
  onClick,
}: Choice_ChipProps) => {
  const [internalSelected, setInternalSelected] = useState(selected);

  // Sync state if prop changes
  useEffect(() => {
    setInternalSelected(selected);
  }, [selected]);

  const isBlocked = state === 'Disabled' || state === 'Read Only';

  const handleClick = () => {
    if (isBlocked) return;
    if (!controlledSelection) setInternalSelected(prev => !prev);
    if (onClick) onClick();
  };

  return (
    <button
      type="button"
      className={`choice-chip choice-chip-container ${className}`.trim()}
      data-state={state}
      data-selected={internalSelected.toString()}
      disabled={isBlocked}
      onClick={handleClick}
    >
      <div className="choice-chip-text">
        <p>{optionName}</p>
      </div>
    </button>
  );
};

export default Choice_Chip;
