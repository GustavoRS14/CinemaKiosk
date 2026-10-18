import React, { HTMLAttributes } from 'react';
import './ProgressBar.css';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** The progress percentage (0-100) */
  progress?: number;
  /** The visual intent color scheme */
  intent?: 'Primary' | 'Information';
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ progress = 0, intent = 'Primary', className = '', ...props }, ref) => {
    const safeProgress = Math.min(Math.max(progress, 0), 100);
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={safeProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        data-intent={intent}
        className={`progress-bar-container ${className}`.trim()}
        {...props}
      >
        <div className="progress-bar-fill" style={{ width: `${safeProgress}%` }} />
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
