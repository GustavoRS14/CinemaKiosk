import React, { ButtonHTMLAttributes } from 'react';
import './TextButton.css';
const AddIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H12M12 12H19M12 12V19M12 12V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export type TextButtonIntent = 'Neutral' | 'Primary' | 'Muted' | 'Danger' | 'Success' | 'Warning' | 'Information';
export type TextButtonSize = 'sm' | 'md' | 'lg';
export type TextButtonWeight = 'Medium' | 'SemiBold' | 'Bold';

export interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: TextButtonIntent;
  size?: TextButtonSize;
  weight?: TextButtonWeight;
  label?: string;
  hasLeftIcon?: boolean;
  hasRightIcon?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextButton = React.forwardRef<HTMLButtonElement, TextButtonProps>(
  ({ 
    intent = 'Neutral', 
    size = 'sm', 
    weight = 'Medium', 
    label = 'Label', 
    hasLeftIcon = false, 
    hasRightIcon = false, 
    leftIcon,
    rightIcon,
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
        className={`text-button ${className}`}
        data-intent={intent}
        data-size={size}
        data-weight={weight}
        disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        {(hasLeftIcon || leftIcon) && (
          <div className="text-button-icon">
            {leftIcon ? leftIcon : <AddIcon />}
          </div>
        )}
        
        <div className="text-button-label">
          <p>{label}</p>
        </div>

        {(hasRightIcon || rightIcon) && (
          <div className="text-button-icon">
            {rightIcon ? rightIcon : <AddIcon />}
          </div>
        )}
      </button>
    );
  }
);

TextButton.displayName = 'TextButton';
