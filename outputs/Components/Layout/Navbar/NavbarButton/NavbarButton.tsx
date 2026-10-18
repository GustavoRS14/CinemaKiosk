import React, { useState } from 'react';
import './NavbarButton.css';

export type NavbarButtonProps = {
  className?: string;
  label: string;
  icon: React.ReactNode;
  selected?: boolean;
  defaultSelected?: boolean;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'Default' | 'Accessibility';
  onClick?: () => void;
};

export const NavbarButton = ({
  className = '',
  label,
  icon,
  selected,
  defaultSelected = false,
  orientation = 'horizontal',
  variant = 'Default',
  onClick,
}: NavbarButtonProps) => {
  const [internalSelected, setInternalSelected] = useState(defaultSelected);

  const isControlled = selected !== undefined;
  // Accessibility variant explicitly overrides and disables the selected state
  const isSelected = variant === 'Accessibility' ? false : (isControlled ? selected : internalSelected);

  const handleClick = () => {
    if (variant === 'Accessibility') {
      if (onClick) onClick();
      return;
    }
    if (!isControlled) {
      setInternalSelected(!internalSelected);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={`navbar-button ${className}`.trim()}
      data-orientation={orientation}
      data-variant={variant}
      aria-selected={isSelected}
      onClick={handleClick}
    >
      <div className="navbar-button-icon-wrapper">
        {icon}
      </div>
      <p className="navbar-button-label">
        {label}
      </p>
    </button>
  );
};
