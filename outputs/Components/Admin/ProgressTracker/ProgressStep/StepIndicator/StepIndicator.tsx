import React from 'react';
import './StepIndicator.css';

export interface StepIndicatorProps {
  /** Optional custom class name */
  className?: string;
  /** Figma state property */
  state?: "Current" | "Completed" | "Not Reached";
  /** Figma text property */
  step?: string;
}

// Inline Check Icon to guarantee inheritance and zero path errors
const CheckIcon = () => (
  <svg className="totem-step-indicator__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function StepIndicator({
  className = "",
  state = "Current",
  step = "1",
}: StepIndicatorProps) {
  return (
    <div 
      className={`totem-step-indicator ${className}`.trim()}
      data-state={state}
    >
      <div className="totem-step-indicator__inner">
        {state === "Completed" ? (
          <CheckIcon />
        ) : (
          <p className="totem-step-indicator__text">{step}</p>
        )}
      </div>
    </div>
  );
}
