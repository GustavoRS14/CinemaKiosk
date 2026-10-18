import { useEffect, useState, type ButtonHTMLAttributes } from 'react';

import './FilterChip.css';

export type FilterChipState = 'Default' | 'Pressed';

export type FilterChipProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'disabled'
> & {
  state?: FilterChipState;
  selected?: boolean;
  text?: string;
  controlledSelection?: boolean;
};

export function FilterChip({
  state = 'Default',
  selected = true,
  text = 'Texto',
  controlledSelection = false,
  className = '',
  onClick,
  ...buttonProps
}: FilterChipProps) {
  const [isSelected, setIsSelected] = useState(selected);

  useEffect(() => setIsSelected(selected), [selected]);

  return (
    <button
      {...buttonProps}
      type="button"
      className={`filter-chip ${className}`.trim()}
      data-state={state.toLowerCase()}
      data-selected={controlledSelection ? selected : isSelected}
      aria-pressed={controlledSelection ? selected : isSelected}
      onClick={(event) => {
        if (!controlledSelection) setIsSelected((current) => !current);
        onClick?.(event);
      }}
    >
      <span className="filter-chip__text">{text}</span>
    </button>
  );
}

FilterChip.displayName = 'FilterChip';
