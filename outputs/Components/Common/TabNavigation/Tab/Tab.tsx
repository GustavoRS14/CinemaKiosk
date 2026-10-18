import React from 'react';
import './Tab.css';

export interface TabProps {
  /** Optional custom class name */
  className?: string;
  /** Figma Boolean property for selection state */
  selected?: boolean;
  /** Figma state property */
  state?: "Default" | "Disabled" | "Read Only";
  /** Figma variant property */
  type?: "Default" | "Underline";
  /** Figma text property */
  text?: string;
  /** Callback fired when the tab is clicked */
  onClick?: () => void;
}

export function Tab({
  className = "",
  selected = false,
  state = "Default",
  type = "Default",
  text = "Texto",
  onClick,
}: TabProps) {
  const isDisabled = state === 'Disabled';
  const isReadOnly = state === 'Read Only';
  const isBlocked = isDisabled || isReadOnly;

  const handleClick = () => {
    if (isBlocked) return;
    if (onClick) onClick();
  };

  return (
    <div
      className={`totem-tab ${className}`.trim()}
      data-selected={selected}
      data-state={state}
      data-type={type}
      role="tab"
      aria-selected={selected}
      aria-disabled={isDisabled ? true : undefined}
      aria-readonly={isReadOnly ? true : undefined}
      onClick={handleClick}
    >
      <div className="totem-tab__inner">
        <p className="totem-tab__text">{text}</p>
      </div>
    </div>
  );
}
