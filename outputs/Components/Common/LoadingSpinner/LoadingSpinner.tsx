import React from 'react';
import './LoadingSpinner.css';

export interface LoadingSpinnerProps {
  /**
   * The size of the spinner.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * The visual intent/color of the spinner.
   * @default 'Primary'
   */
  intent?: 'Primary' | 'Neutral' | 'Inverse';
  
  /**
   * Optional custom class name.
   */
  className?: string;
  
  /**
   * ARIA label for accessibility.
   * @default 'Loading'
   */
  'aria-label'?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  intent = 'Primary',
  className = '',
  'aria-label': ariaLabel = 'Loading',
  ...props
}) => {
  const baseClass = 'totem-loading-spinner';
  const classes = [
    baseClass,
    `${baseClass}--size-${size}`,
    `${baseClass}--intent-${intent.toLowerCase()}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role="status"
      aria-label={ariaLabel}
      {...props}
    >
      <span className="totem-sr-only">Loading...</span>
    </div>
  );
};
