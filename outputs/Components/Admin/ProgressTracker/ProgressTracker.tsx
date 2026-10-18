import React, { useEffect, useState } from 'react';
import AlertIllustration from '@illustrations/Alert.svg';
import { TextButton } from '../../Common/TextButton';
import { ActionDialog } from '../../Overlays/Dialog/ActionDialog';
import { OverlaySurface } from '../../Overlays/OverlaySurface';
import { setInactivityMonitoringEnabled } from '../../Overlays/SystemSessionOverlays';
import { VendorLogo } from '../../../Utilities/Vendor/VendorLogo';
import { ProgressStep } from './ProgressStep';
import { useI18n } from '../../../i18n';
import './ProgressTracker.css';

export interface ProgressTrackerProps {
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  currentStep?: number;
  /** Optional labels for flows that use the same four steps with contextual naming. */
  stepLabels?: readonly [string, string, string, string];
  cancelLabel?: string;
  onCancelInstallation?: () => void;
  onExitInstallation?: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  className = '',
  orientation = 'vertical',
  currentStep = 1,
  stepLabels = ['Ativação', 'Localização', 'Hardware', 'Segurança'],
  cancelLabel,
  onCancelInstallation,
  onExitInstallation,
}) => {
  const { t } = useI18n();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const resolvedCancelLabel = cancelLabel ?? t('onboarding.cancelInstallation');

  useEffect(() => {
    setInactivityMonitoringEnabled(false);
    return () => setInactivityMonitoringEnabled(true);
  }, []);

  const requestCancelInstallation = () => {
    setCancelDialogOpen(true);
  };

  const exitInstallation = () => {
    setCancelDialogOpen(false);
    if (onExitInstallation || onCancelInstallation) {
      (onExitInstallation ?? onCancelInstallation)?.();
      return;
    }
    window.dispatchEvent(new CustomEvent('totem-close-application'));
    window.close();
  };
  const steps = [
    { num: 1, label: stepLabels[0] },
    { num: 2, label: stepLabels[1] },
    { num: 3, label: stepLabels[2] },
    { num: 4, label: stepLabels[3] },
  ];

  const logo = (
    <div className="progress-tracker-logo">
      <VendorLogo />
    </div>
  );

  const cancelButton = (
    <TextButton
      className="progress-tracker__cancel"
      type="button"
      intent="Muted"
      size="sm"
      hasLeftIcon={false}
      hasRightIcon={false}
      label={resolvedCancelLabel}
      onClick={requestCancelInstallation}
    />
  );

  return (
    <>
    <div className={`progress-tracker progress-tracker--${orientation} ${className}`.trim()}>
      {orientation === 'vertical' ? (
        <div className="progress-tracker__brand-actions">
          {logo}
          {cancelButton}
        </div>
      ) : logo}
      <div className="progress-tracker-list">
        {steps.map((step, index) => {
          let state: 'Complete' | 'Current' | 'Not Reached' = 'Not Reached';
          if (currentStep > step.num) state = 'Complete';
          else if (currentStep === step.num) state = 'Current';

          return (
            <ProgressStep
              key={step.num}
              className="progress-tracker__step"
              stepNumber={step.num}
              label={step.label}
              state={state}
              // CRITICAL FIX: The internal step orientation must be the inverse of the container's layout orientation
              orientation={orientation === 'vertical' ? 'vertical' : 'horizontal'}
              showDivider={index < steps.length - 1}
            />
          );
        })}
      </div>
      {orientation === 'horizontal' && cancelButton}
    </div>
    <OverlaySurface
      open={cancelDialogOpen}
      kind="modal"
      orientation={orientation}
      closeOnBackdrop={false}
      onClose={() => setCancelDialogOpen(false)}
    >
      <ActionDialog
        size="md"
        illustration={<AlertIllustration aria-hidden="true" />}
        title={t('onboarding.cancelTitle')}
        description={t('onboarding.cancelDescription')}
        secondaryActionLabel={t('onboarding.exitInstallation')}
        primaryActionLabel={t('onboarding.resumeInstallation')}
        onSecondaryAction={exitInstallation}
        onPrimaryAction={() => setCancelDialogOpen(false)}
      />
    </OverlaySurface>
    </>
  );
};
