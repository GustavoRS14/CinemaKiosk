import React from 'react';
import './IndeterminateLinearProgress.css';

export interface IndeterminateLinearProgressProps {
  /**
   * Optional custom class name for the container
   */
  className?: string;
  /**
   * Optional aria-label for accessibility (defaults to "Loading...")
   */
  'aria-label'?: string;
}

/**
 * A highly scalable, performant indeterminate linear progress indicator built with native CSS keyframes.
 * Adheres strictly to design system variable consumption and custom animation overrides.
 */
export const IndeterminateLinearProgress: React.FC<IndeterminateLinearProgressProps> = ({
  className = '',
  'aria-label': ariaLabel = 'Loading...',
}) => {
  return (
    <div
      className={`indeterminate-linear-progress-container ${className}`.trim()}
      role="progressbar"
      aria-label={ariaLabel}
    >
      <div className="indeterminate-linear-progress-bar" />
    </div>
  );
};
