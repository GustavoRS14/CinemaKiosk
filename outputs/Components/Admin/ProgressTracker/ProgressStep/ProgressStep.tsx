import { HTMLAttributes, ReactNode } from 'react';
import { Divider } from '../../../Common/Divider';
import { StepIndicator } from './StepIndicator';
import './ProgressStep.css';

export interface ProgressStepProps extends HTMLAttributes<HTMLDivElement> {
  state?: 'Current' | 'Not Reached' | 'Complete';
  stepNumber?: number | string;
  label?: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  showDivider?: boolean;
}

export const ProgressStep = ({
  state = 'Current',
  stepNumber = 1,
  label = 'Passo',
  orientation = 'vertical',
  showDivider = true,
  className = '',
  ...nativeProps
}: ProgressStepProps) => {
  const isComplete = state === 'Complete';
  const isCurrent = state === 'Current';
  const isNotReached = state === 'Not Reached';

  // Strictly locked to Solid per user directive
  let dividerState: 'Default' | 'Disabled' | 'Read Only' = 'Default';
  let dividerType: 'Solid' | 'Dashed' = 'Solid';

  if (isCurrent) {
    dividerType = 'Solid';
    dividerState = 'Default';
  } else if (isNotReached) {
    dividerType = 'Solid';
    dividerState = 'Default';
  }

  // CRITICAL FIX: Replaced 'Default' with 'Not Reached' to match the updated StepIndicator component
  const indicatorState = isComplete ? 'Completed' : isCurrent ? 'Current' : 'Not Reached';
  
  // CRITICAL FIX: Added conditional class to trigger Hug behavior when divider is false
  const safeClassName = `totem-progress-step totem-progress-step--${orientation} totem-progress-step--${state.toLowerCase().replace(' ', '-')} ${!showDivider ? 'totem-progress-step--no-divider' : ''} ${className}`.trim();

  return (
    <div className={safeClassName} {...nativeProps}>
      <div className="totem-progress-step__content">
        <StepIndicator state={indicatorState} step={String(stepNumber)} />
        <div className="totem-progress-step__label">
          {label}
        </div>
      </div>
      {showDivider && (
        <div className="totem-progress-step__divider-wrapper">
          <Divider
            className="totem-progress-step__divider"
            state={dividerState}
            type={dividerType}
            vertical={orientation === 'horizontal'} // Vertical mode stays false. Horizontal mode gets a vertical line (true).
          />
        </div>
      )}
    </div>
  );
};
