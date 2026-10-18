import { useMemo, useState } from 'react';

import { ProgressTracker } from '@components/Admin/ProgressTracker';
import { Input } from '@components/Common/Input';
import { Footer } from '@components/Layout/Footer/Footer';
import { AccessibilityOverlay } from '@components/Overlays/Accessibility';
import { KeyboardDialog } from '@components/Overlays/KeyboardDialog';
import { OverlaySurface } from '@components/Overlays/OverlaySurface';
import { ActionDialog } from '@components/Overlays/Dialog/ActionDialog';
import ServerErrorIllustration from '@illustrations/ServerError.svg';
import { useOrientation } from '../../useOrientation';
import { setTerminalId as persistTerminalId } from '../../terminalPreferences';
import { useI18n } from '../../../i18n';
import { onboardingTokenStyles } from '../onboardingTokenStyles';
import { useElectronWindowMode } from '../../electronWindowMode';
import './OnboardingActivationPage.css';

export type OnboardingActivationPageProps = {
  validateActivationToken?: (token: string) => boolean | Promise<boolean>;
};

export function OnboardingActivationPage({ validateActivationToken }: OnboardingActivationPageProps) {
  useElectronWindowMode('onboarding');
  const orientation = useOrientation();
  const { t } = useI18n();
  const stepLabels = [t('onboarding.step.activation'), t('onboarding.step.location'), t('onboarding.step.hardware'), t('onboarding.step.security')] as const;
  const [activationToken, setActivationToken] = useState('');
  const [terminalId, setTerminalId] = useState('');
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [keyboardField, setKeyboardField] = useState<'token' | 'terminal' | null>(null);
  const [keyboardValue, setKeyboardValue] = useState('');
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [communicationErrorOpen, setCommunicationErrorOpen] = useState(false);

  const canContinue = useMemo(
    () => activationToken.trim().length > 0 && !tokenInvalid && terminalId.trim().length > 0,
    [activationToken, terminalId, tokenInvalid],
  );

  const openKeyboard = (field: 'token' | 'terminal') => {
    setKeyboardField(field);
    setKeyboardValue(field === 'token' ? activationToken : terminalId);
  };

  const confirmKeyboardValue = async () => {
    if (keyboardField === 'token') {
      const normalizedToken = keyboardValue.trim().toUpperCase();
      try {
        const isValid = validateActivationToken
          ? await validateActivationToken(normalizedToken)
          : /^[A-Z]{4}[-–]\d{4}$/.test(normalizedToken);
        setActivationToken(normalizedToken);
        setTokenInvalid(!isValid);
        setKeyboardField(null);
      } catch {
        setCommunicationErrorOpen(true);
      }
      return;
    }
    const normalizedId = keyboardValue.trim();
    setTerminalId(normalizedId);
    persistTerminalId(normalizedId);
    setKeyboardField(null);
  };

  return (
    <div className={`onboarding-activation-page onboarding-activation-page--${orientation}`} data-theme="light" style={onboardingTokenStyles}>
      <ProgressTracker
        className="onboarding-activation-page__progress"
        orientation={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
        currentStep={1}
        stepLabels={stepLabels}
      />

      <div className="onboarding-activation-page__body">
        <main className="onboarding-activation-page__main">
          <header className="onboarding-activation-page__copy">
            <h1>{t('onboarding.activation.title')}</h1>
            <p>{t('onboarding.activation.description')}</p>
          </header>

          <form className="onboarding-activation-page__form" onSubmit={(event) => event.preventDefault()}>
            <Input
              showTitle
              title={t('onboarding.activation.token')}
              placeholder={t('onboarding.activation.tokenPlaceholder')}
              value={activationToken}
              state={tokenInvalid ? 'Invalid' : 'Filled'}
              onChange={() => undefined}
              showSupportingText={tokenInvalid}
              supportingText={tokenInvalid ? 'Chave incorreta. Tente novamente.' : undefined}
              controlRole="button"
              controlTabIndex={0}
              onControlClick={() => openKeyboard('token')}
              onControlKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') openKeyboard('token');
              }}
              autoComplete="off"
              aria-label={t('onboarding.activation.token')}
              border="xs"
            />
            <Input
              showTitle
              title={t('onboarding.activation.terminalId')}
              placeholder={t('onboarding.activation.terminalIdPlaceholder')}
              value={terminalId}
              state="Filled"
              onChange={() => undefined}
              controlRole="button"
              controlTabIndex={0}
              onControlClick={() => openKeyboard('terminal')}
              onControlKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') openKeyboard('terminal');
              }}
              autoComplete="off"
              aria-label={t('onboarding.activation.terminalId')}
              border="xs"
            />
          </form>
        </main>

        <Footer
          actionLeft={false}
          showPrice={false}
          showTotalPrice={false}
          showMainCta
          mainCtaLabel={t('action.next')}
          mainCtaDisabled={!canContinue}
          onAccessibility={() => setIsAccessibilityOpen(true)}
        />
        <AccessibilityOverlay open={isAccessibilityOpen} orientation={orientation} onClose={() => setIsAccessibilityOpen(false)} />
        <OverlaySurface
          open={keyboardField !== null}
          kind="modal"
          orientation={orientation}
          closeOnBackdrop={false}
          onClose={() => setKeyboardField(null)}
        >
          <KeyboardDialog
            variant="alphanumeric"
            size="lg"
            showIntro={false}
            inputPlaceholder={keyboardField === 'token'
              ? t('onboarding.activation.token')
              : t('onboarding.activation.terminalId')}
            value={keyboardValue}
            onChange={setKeyboardValue}
            secondaryActionLabel={t('checkout.cancel')}
            primaryActionLabel={t('concessions.confirm')}
            primaryDisabled={!keyboardValue.trim()}
            onSecondaryAction={() => setKeyboardField(null)}
            onPrimaryAction={() => void confirmKeyboardValue()}
          />
        </OverlaySurface>
        <OverlaySurface
          open={communicationErrorOpen}
          kind="modal"
          orientation={orientation}
          closeOnBackdrop={false}
          onClose={() => undefined}
        >
          <ActionDialog
            size="md"
            illustration={<ServerErrorIllustration aria-hidden="true" />}
            title={t('admin.dialog.communicationFailure')}
            description={t('admin.dialog.communicationFailureDescription')}
            secondaryActionLabel={t('action.back')}
            primaryActionLabel={t('checkout.tryAgain')}
            onSecondaryAction={() => setCommunicationErrorOpen(false)}
            onPrimaryAction={() => {
              setCommunicationErrorOpen(false);
              void confirmKeyboardValue();
            }}
          />
        </OverlaySurface>
      </div>
    </div>
  );
}

OnboardingActivationPage.displayName = 'OnboardingActivationPage';
