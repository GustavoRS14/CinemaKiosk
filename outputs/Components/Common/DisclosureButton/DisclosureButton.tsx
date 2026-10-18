import React, { ButtonHTMLAttributes } from 'react';
import './DisclosureButton.css';
import AddIcon from '@icons/add-plus.svg';

export type DisclosureButtonBorder = 'sm' | 'md' | 'lg';

export interface DisclosureButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  border?: DisclosureButtonBorder;
  label?: string;
  hasLeftIcon?: boolean;
  hasRightIcon?: boolean;
}

export const DisclosureButton = React.forwardRef<HTMLButtonElement, DisclosureButtonProps>(
  ({ 
    border = 'sm', 
    label = 'Label', 
    hasLeftIcon = false, 
    hasRightIcon = false, 
    className = '', 
    disabled, 
    ...props 
  }, ref) => {
    
    // Explicitly handle disabled interactions
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      props.onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={`disclosure-button ${className}`}
        data-border={border}
        disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        {hasLeftIcon && (
          <div className="disclosure-button-icon">
            <AddIcon />
          </div>
        )}
        
        <div className="disclosure-button-label">
          <p>{label}</p>
        </div>

        {hasRightIcon && (
          <div className="disclosure-button-icon">
            <AddIcon />
          </div>
        )}
      </button>
    );
  }
);

DisclosureButton.displayName = 'DisclosureButton';
