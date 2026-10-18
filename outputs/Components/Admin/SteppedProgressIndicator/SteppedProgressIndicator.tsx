import React from 'react';
import { ProgressBar } from '../../Common/ProgressBar';
import { useI18n } from '../../../i18n';
import './SteppedProgressIndicator.css';

export interface SteppedProgressIndicatorProps {
  /** Optional custom class name */
  className?: string;
  /** Figma state property */
  progress?: "0" | "25" | "50" | "75" | "100";
  /** Figma text property */
  step?: string;
}

export function SteppedProgressIndicator({
  className = "",
  progress = "0",
  step = "1",
}: SteppedProgressIndicatorProps) {
  const { t } = useI18n();
  // Convert string props to numbers for mathematical calculation
  const currentStep = parseInt(step, 10) || 1;
  const currentProgress = parseInt(progress, 10) || 0;

  // Logic to fill the bars correctly based on the current step
  const getBarProgress = (barIndex: number) => {
    if (currentStep > barIndex) return 100; // Previous steps are fully loaded
    if (currentStep === barIndex) return currentProgress; // Current step uses the progress prop
    return 0; // Future steps are empty
  };

  // Logic to update the main title text dynamically
  const getStepTitle = (s: number) => {
    switch (s) {
      case 2:
        return t('onboarding.update.installing');
      case 3:
        return t('onboarding.update.applying');
      case 1:
      default:
        return t('onboarding.update.searching');
    }
  };

  // Logic to update the subtitle text dynamically
  const getStepDescription = (s: number) => {
    switch (s) {
      case 2:
        return t('onboarding.update.applyingImprovements');
      case 3:
        return t('onboarding.update.downloadingCatalog');
      case 1:
      default:
        return t('onboarding.update.downloadingFiles');
    }
  };

  return (
    <div className={`totem-stepped-progress-indicator ${className}`.trim()}>
      <div className="totem-stepped-progress-indicator__inner">
        <p className="totem-stepped-progress-indicator__title">{getStepTitle(currentStep)}</p>
        <div className="totem-stepped-progress-indicator__bars">
          <ProgressBar intent="Information" progress={getBarProgress(1)} />
          <ProgressBar intent="Information" progress={getBarProgress(2)} />
          <ProgressBar intent="Information" progress={getBarProgress(3)} />
        </div>
        <p className="totem-stepped-progress-indicator__subtitle">
          {t('onboarding.update.stepProgress', {
            step,
            description: getStepDescription(currentStep),
            progress,
          })}
        </p>
      </div>
    </div>
  );
}
