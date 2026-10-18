import { useState } from 'react';
import { ProgressTracker } from '@components/Admin/ProgressTracker';
import { SectionHeader } from '@components/Admin/SectionHeader';
import {
  DeviceStatusCard,
  findDetectedHardwareDevice,
  getHardwareDevicePresentation,
  type DetectedHardwareDevice,
} from '@components/Admin/DeviceStatusCard/DeviceStatusCard';
import { Footer } from '@components/Layout/Footer/Footer';
import { AccessibilityOverlay } from '@components/Overlays/Accessibility';
import ChipIcon from '@icons/chip.svg';
import { useOrientation } from '../../useOrientation';
import { useI18n } from '../../../i18n';
import { onboardingTokenStyles } from '../onboardingTokenStyles';
import { useElectronWindowMode } from '../../electronWindowMode';
import '../OnboardingSetupPage.css';

export interface OnboardingHardwarePageProps {
  printerConnected?: boolean;
  paymentTerminalConnected?: boolean;
  /** Device snapshots supplied by the machine/native hardware integration. */
  detectedDevices?: readonly DetectedHardwareDevice[];
  onBack?: () => void;
  onPrintTest?: () => void;
  onTestPayment?: () => void;
  onContinue?: () => void;
}

export function OnboardingHardwarePage({
  printerConnected = false,
  paymentTerminalConnected = false,
  detectedDevices,
  onBack,
  onPrintTest,
  onTestPayment,
  onContinue,
}: OnboardingHardwarePageProps) {
  useElectronWindowMode('onboarding');
  const orientation = useOrientation();
  const { t } = useI18n();
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const horizontalStepLabels = [t('onboarding.step.activation'), t('onboarding.step.linkUnit'), t('onboarding.step.hardware'), t('onboarding.step.security')] as const;
  const verticalStepLabels = [t('onboarding.step.activation'), t('onboarding.step.location'), t('onboarding.step.hardware'), t('onboarding.step.security')] as const;
  const resolvedDevices: readonly DetectedHardwareDevice[] = detectedDevices ?? [
    ...(printerConnected
      ? [{ id: 'printer', type: 'printer' as const, connected: true, paperStatus: 'ok' as const }]
      : []),
    ...(paymentTerminalConnected
      ? [{ id: 'payment-terminal', type: 'payment-terminal' as const, connected: true }]
      : []),
  ];
  const printer = findDetectedHardwareDevice(resolvedDevices, 'printer');
  const paymentTerminal = findDetectedHardwareDevice(resolvedDevices, 'payment-terminal');
  const canContinue = getHardwareDevicePresentation('printer', printer).actionAvailable
    && getHardwareDevicePresentation('payment-terminal', paymentTerminal).actionAvailable;

  return (
    <div className={`onboarding-setup-page onboarding-hardware-page onboarding-setup-page--${orientation}`} data-theme="light" style={onboardingTokenStyles}>
      <ProgressTracker
        className="onboarding-setup-page__progress"
        orientation={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
        currentStep={3}
        stepLabels={orientation === 'horizontal' ? horizontalStepLabels : verticalStepLabels}
      />

      <div className="onboarding-setup-page__body">
        <main className="onboarding-setup-page__main">
          <header className="onboarding-setup-page__copy">
            <h1>{t('onboarding.hardware.title')}</h1>
            <p>{t('onboarding.hardware.description')}</p>
          </header>

          <section className="onboarding-setup-page__card" aria-label={t('onboarding.hardware.section')}>
            <SectionHeader
              title={t('onboarding.hardware.section')}
              icon={<ChipIcon className="section-header-icon onboarding-hardware-page__section-icon" aria-hidden="true" />}
            />

            <div className="onboarding-setup-page__grid onboarding-hardware-page__devices">
              <DeviceStatusCard
                deviceType="printer"
                detectedDevices={resolvedDevices}
                actionLabel={t('onboarding.hardware.printTest')}
                onAction={onPrintTest}
              />
              <DeviceStatusCard
                deviceType="payment-terminal"
                detectedDevices={resolvedDevices}
                actionLabel={t('onboarding.hardware.testCommunication')}
                onAction={onTestPayment}
              />
            </div>
          </section>
        </main>

        <Footer
          actionLeft
          showPrice={false}
          showTotalPrice={false}
          showMainCta
          mainCtaLabel={t('action.next')}
          mainCtaDisabled={!canContinue}
          onBack={onBack}
          onMainAction={canContinue ? onContinue : undefined}
          onAccessibility={() => setIsAccessibilityOpen(true)}
        />
        <AccessibilityOverlay open={isAccessibilityOpen} orientation={orientation} onClose={() => setIsAccessibilityOpen(false)} />
      </div>
    </div>
  );
}

OnboardingHardwarePage.displayName = 'OnboardingHardwarePage';
