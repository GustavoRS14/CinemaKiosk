import { useState } from 'react';

import { ProgressTracker } from '@components/Admin/ProgressTracker';
import { SectionHeader } from '@components/Admin/SectionHeader';
import { Input } from '@components/Common/Input';
import { Footer } from '@components/Layout/Footer/Footer';
import { AccessibilityOverlay } from '@components/Overlays/Accessibility';
import KeyIcon from '@icons/key.svg';
import { useOrientation } from '../../useOrientation';
import { useI18n } from '../../../i18n';
import { onboardingTokenStyles } from '../onboardingTokenStyles';
import { markOnboardingComplete, useElectronWindowMode } from '../../electronWindowMode';
import '../OnboardingSetupPage.css';

export interface OnboardingSecurityPageProps {
  onBack?: () => void;
  onFinish?: (pin: string) => void;
}

const normalizePin = (value: string) => value.replace(/\D/g, '').slice(0, 6);

export function OnboardingSecurityPage({ onBack, onFinish }: OnboardingSecurityPageProps) {
  useElectronWindowMode('onboarding');
  const orientation = useOrientation();
  const { t } = useI18n();
  const horizontalStepLabels = [t('onboarding.step.activation'), t('onboarding.step.linkUnit'), t('onboarding.step.hardware'), t('onboarding.step.security')] as const;
  const verticalStepLabels = [t('onboarding.step.activation'), t('onboarding.step.location'), t('onboarding.step.hardware'), t('onboarding.step.security')] as const;
  const [pin, setPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const canFinish = /^\d{4,6}$/.test(pin) && pin === confirmation;

  return (
    <div className={`onboarding-setup-page onboarding-security-page onboarding-setup-page--${orientation}`} data-theme="light" style={onboardingTokenStyles}>
      <ProgressTracker
        className="onboarding-setup-page__progress"
        orientation={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
        currentStep={4}
        stepLabels={orientation === 'horizontal' ? horizontalStepLabels : verticalStepLabels}
      />

      <div className="onboarding-setup-page__body">
        <main className="onboarding-setup-page__main">
          <header className="onboarding-setup-page__copy">
            <h1>{t('onboarding.security.title')}</h1>
            <p>{t('onboarding.security.description')}</p>
          </header>

          <section className="onboarding-setup-page__card" aria-label={t('onboarding.security.section')}>
            <SectionHeader
              title={t('onboarding.security.section')}
              icon={<KeyIcon className="section-header-icon onboarding-security-page__section-icon" aria-hidden="true" />}
            />

            <div className="onboarding-setup-page__grid onboarding-security-page__fields">
              <Input
                showTitle
                title={t('onboarding.security.pin')}
                placeholder={t('onboarding.security.pin')}
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={6}
                value={pin}
                onChange={(event) => setPin(normalizePin(event.target.value))}
              />
              <Input
                showTitle
                title={t('onboarding.security.confirmPin')}
                placeholder={t('onboarding.security.confirmPin')}
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={6}
                value={confirmation}
                onChange={(event) => setConfirmation(normalizePin(event.target.value))}
              />
            </div>
          </section>
        </main>

        <Footer
          actionLeft
          showPrice={false}
          showTotalPrice={false}
          showMainCta
          mainCtaLabel={t('onboarding.security.finish')}
          mainCtaDisabled={!canFinish}
          onBack={onBack}
          onMainAction={canFinish ? () => {
            onFinish?.(pin);
            void markOnboardingComplete();
          } : undefined}
          onAccessibility={() => setIsAccessibilityOpen(true)}
        />
        <AccessibilityOverlay open={isAccessibilityOpen} orientation={orientation} onClose={() => setIsAccessibilityOpen(false)} />
      </div>
    </div>
  );
}

OnboardingSecurityPage.displayName = 'OnboardingSecurityPage';
