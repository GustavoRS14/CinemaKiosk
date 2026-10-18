import { useEffect, useRef, useState } from 'react';
import BackgroundIllustration from '@illustrations/BackgroundIllustration.svg';
import terminalUpdateMockup from '@images/Onboarding/terminal-update-mockup.png';
import {
  SteppedProgressIndicator,
  type SteppedProgressIndicatorProps,
} from '@components/Admin/SteppedProgressIndicator';

import { VendorLogo } from '../../../Utilities/Vendor/VendorLogo';
import { useOrientation } from '../../useOrientation';
import { useI18n } from '../../../i18n';
import { onboardingTokenStyles } from '../onboardingTokenStyles';
import { useElectronWindowMode } from '../../electronWindowMode';
import './OnboardingUpdatePage.css';

export interface OnboardingUpdatePageProps {
  progress?: SteppedProgressIndicatorProps['progress'];
  step?: SteppedProgressIndicatorProps['step'];
}

export function OnboardingUpdatePage({
  progress = '0',
  step = '1',
}: OnboardingUpdatePageProps) {
  useElectronWindowMode('onboarding-update');
  const orientation = useOrientation();
  const { t } = useI18n();
  const normalizedStep = Math.min(3, Math.max(1, Number.parseInt(step, 10) || 1));
  const [currentStep, setCurrentStep] = useState(normalizedStep);
  const previousStepPropRef = useRef(normalizedStep);
  const previousProgressWasCompleteRef = useRef(false);

  useEffect(() => {
    if (previousStepPropRef.current !== normalizedStep) {
      previousStepPropRef.current = normalizedStep;
      setCurrentStep(normalizedStep);
    }
  }, [normalizedStep]);

  useEffect(() => {
    const progressIsComplete = Number(progress) >= 100;
    const stepJustCompleted = progressIsComplete && !previousProgressWasCompleteRef.current;

    if (stepJustCompleted) {
      setCurrentStep((current) => Math.min(3, current + 1));
    }

    previousProgressWasCompleteRef.current = progressIsComplete;
  }, [progress]);

  return (
    <div className={`onboarding-update-page onboarding-update-page--${orientation}`} data-theme="light" style={onboardingTokenStyles}>
      <main className="onboarding-update-page__content">
        <header className="onboarding-update-page__copy">
          <h1>{t('onboarding.update.title')}</h1>
          <p>{t('onboarding.update.description')}</p>
        </header>

        <section className="onboarding-update-page__showcase" aria-label={t('onboarding.update.showcaseAria')}>
          <BackgroundIllustration
            className="onboarding-update-page__showcase-background"
            aria-hidden="true"
            focusable="false"
            preserveAspectRatio="xMidYMid slice"
          />

          <div className="onboarding-update-page__showcase-copy">
            <VendorLogo className="onboarding-update-page__vendor-logo" />
            <h2>{t('onboarding.update.showcaseTitle')}</h2>
            <p>{t('onboarding.update.showcaseDescription')}</p>
          </div>

          <div className="onboarding-update-page__mockup">
            <img src={terminalUpdateMockup} alt={t('onboarding.update.imageAlt')} />
          </div>
        </section>

        <SteppedProgressIndicator
          className="onboarding-update-page__progress"
          progress={progress}
          step={String(currentStep)}
        />
      </main>
    </div>
  );
}

OnboardingUpdatePage.displayName = 'OnboardingUpdatePage';
