import React, { useState, useEffect } from 'react';
import './SelectionTile.css';
import { RadioButton } from '../RadioButton';

export type SelectionTileState = 'Default' | 'Disabled' | 'ReadOnly';

export type SelectionTileProps = {
className?: string;
borderRadius?: 'xs' | 'sm' | 'md' | 'lg';
defaultSelected?: boolean;
selected?: boolean;
state?: SelectionTileState;
slotContent?: React.ReactNode;
text?: string;
onClick?: () => void;
};

export const SelectionTile = ({
className = '',
borderRadius = 'md',
defaultSelected = false,
selected,
state = 'Default',
slotContent,
text = 'Texto',
onClick,
}: SelectionTileProps) => {
const [internalSelected, setInternalSelected] = useState(selected ?? defaultSelected);

useEffect(() => {
  if (selected !== undefined) {
    setInternalSelected(selected);
  }
}, [selected]);

const isDisabled = state === 'Disabled';
const isReadOnly = state === 'ReadOnly';

const handleClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  if (isDisabled || isReadOnly) return;
  if (selected === undefined) {
    setInternalSelected(!internalSelected);
  }
  if (onClick) onClick();
};

return (
  <div
    className={`selection-tile ${className}`}
    data-state={state}
    data-selected={internalSelected.toString()}
    data-radius={borderRadius}
    aria-disabled={isDisabled}
    aria-readonly={isReadOnly}
    onClick={handleClick}
    role="button"
    tabIndex={isDisabled || isReadOnly ? -1 : 0}
  >
    <div className="selection-tile-border-control">
      <div className="selection-tile-inner">
        <div className="slot-wrapper">
          {slotContent}
        </div>
        <div className="text-wrapper">
          <p>{text}</p>
        </div>
        <RadioButton 
          className="selection-tile-radio"
          selected={internalSelected}
          state={isDisabled ? 'Disabled' : isReadOnly ? 'Read Only' : 'Default'}
        />
      </div>
    </div>
  </div>
);
};
