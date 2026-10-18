import { useEffect, useState, type ReactNode } from 'react';

import AddPlusIcon from '@icons/add-plus.svg';
import MinusIcon from '@icons/minus.svg';
import LoweredScreenIllustration from '@illustrations/LoweredScreen.svg';
import { Button } from '../../Common/Button';
import { IconButton } from '../../Common/IconButton';
import { ModalHeader } from '../../Common/ModalHeader';
import { TextButton } from '../../Common/TextButton';
import { Toggle } from '../../Common/Toggle';
import { ActionDialog } from '../Dialog/ActionDialog';
import { OverlaySurface } from '../OverlaySurface';
import { useOrientation, type PageOrientation } from '../../../Pages/useOrientation';
import { useI18n } from '../../../i18n';
import {
  DEFAULT_TEXT_SCALE,
  getHighContrastPreference,
  getLoweredScreenPreference,
  getTextScalePreference,
  MAX_TEXT_SCALE,
  MIN_TEXT_SCALE,
  setHighContrastPreference,
  setLoweredScreenPreference,
  setTextScalePreference,
  TEXT_SCALE_STEP,
} from '../../../Pages/accessibilityPreferences';
import '../overlayDialog.css';
import './Accessibility.css';

export type AccessibilityProps = {
  orientation?: PageOrientation;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onComplete?: () => void;
  preferences?: AccessibilityPreferenceValues;
  onPreferencesChange?: (preferences: AccessibilityPreferenceValues) => void;
};

export type AccessibilityPreferenceValues = {
  textScale: number;
  highContrast: boolean;
  loweredScreen: boolean;
};

export function Accessibility({
  orientation: orientationOverride,
  size = 'md',
  className = '',
  onComplete,
  preferences,
  onPreferencesChange,
}: AccessibilityProps) {
  const orientation = useOrientation(orientationOverride);
  const { t } = useI18n();
  const [textScale, setTextScale] = useState(() => preferences?.textScale ?? getTextScalePreference());
  const [highContrast, setHighContrast] = useState(() => preferences?.highContrast ?? getHighContrastPreference());
  const [loweredScreen, setLoweredScreen] = useState(() => preferences?.loweredScreen ?? getLoweredScreenPreference());
  const [loweredScreenConfirmationOpen, setLoweredScreenConfirmationOpen] = useState(false);
  const hasAdjustments = textScale !== DEFAULT_TEXT_SCALE || highContrast || loweredScreen;

  useEffect(() => {
    if (!preferences) return;
    setTextScale(preferences.textScale);
    setHighContrast(preferences.highContrast);
    setLoweredScreen(preferences.loweredScreen);
  }, [preferences]);

  const commitPreferences = (next: AccessibilityPreferenceValues) => {
    setTextScale(next.textScale);
    setHighContrast(next.highContrast);
    setLoweredScreen(next.loweredScreen);
    if (onPreferencesChange) {
      onPreferencesChange(next);
      return;
    }
    setTextScalePreference(next.textScale);
    setHighContrastPreference(next.highContrast);
    setLoweredScreenPreference(next.loweredScreen);
  };

  const resetAdjustments = () => {
    commitPreferences({ textScale: DEFAULT_TEXT_SCALE, highContrast: false, loweredScreen: false });
    setLoweredScreenConfirmationOpen(false);
  };

  const changeHighContrast = (enabled: boolean) => {
    commitPreferences({ textScale, highContrast: enabled, loweredScreen });
  };

  const changeTextScale = (amount: number) => {
    const next = Math.min(MAX_TEXT_SCALE, Math.max(MIN_TEXT_SCALE, textScale + amount));
    const normalizedNext = Math.round(next * 10) / 10;
    commitPreferences({ textScale: normalizedNext, highContrast, loweredScreen });
  };

  const changeLoweredScreen = (enabled: boolean) => {
    if (enabled) {
      setLoweredScreenConfirmationOpen(true);
      return;
    }

    commitPreferences({ textScale, highContrast, loweredScreen: enabled });
  };

  const cancelLoweredScreenActivation = () => {
    setLoweredScreenConfirmationOpen(false);
  };

  const confirmLoweredScreenActivation = () => {
    commitPreferences({ textScale, highContrast, loweredScreen: true });
    setLoweredScreenConfirmationOpen(false);
  };

  return (
    <section
      className={`overlay-dialog overlay-dialog--size-${size} accessibility-dialog accessibility-dialog--${orientation} ${className}`.trim()}
      aria-label={t('accessibility.title')}
      data-orientation={orientation}
    >
      <ModalHeader text={t('accessibility.title')} onClose={onComplete} />

      <div className="accessibility-dialog__content">
        <div className="accessibility-dialog__top-action">
          <TextButton
            intent="Danger"
            size="sm"
            weight="SemiBold"
            label={t('accessibility.clear')}
            disabled={!hasAdjustments}
            hasRightIcon
            rightIcon={<TrashIcon />}
            onClick={resetAdjustments}
          />
        </div>

        <AccessibilityOption
          title={t('accessibility.increaseText')}
          description={t('accessibility.increaseTextDescription')}
        >
          <div className="accessibility-dialog__counter" aria-label={t('accessibility.textScale')}>
            <IconButton
              state={textScale <= MIN_TEXT_SCALE ? 'Disabled' : 'Default'}
              icon={<MinusIcon />}
              aria-label={t('accessibility.decreaseText')}
              onClick={() => changeTextScale(-TEXT_SCALE_STEP)}
            />
            <output aria-live="polite">{textScale.toFixed(1)}</output>
            <IconButton
              state={textScale >= MAX_TEXT_SCALE ? 'Disabled' : 'Default'}
              icon={<AddPlusIcon />}
              aria-label={t('accessibility.increaseTextAction')}
              onClick={() => changeTextScale(TEXT_SCALE_STEP)}
            />
          </div>
        </AccessibilityOption>

        <AccessibilityOption
          title={t('accessibility.highContrast')}
          description={t('accessibility.highContrastDescription')}
        >
          <Toggle
            isActive={highContrast}
            onActiveChange={changeHighContrast}
            aria-label={t('accessibility.enableHighContrast')}
          />
        </AccessibilityOption>

        {orientation === 'vertical' && (
          <AccessibilityOption
            title={t('accessibility.loweredScreen')}
            description={t('accessibility.loweredScreenDescription')}
          >
            <Toggle
              isActive={loweredScreen}
              onActiveChange={changeLoweredScreen}
              aria-label={t('accessibility.enableLoweredScreen')}
            />
          </AccessibilityOption>
        )}
      </div>

      <footer className="accessibility-dialog__footer">
        <Button
          label={t('accessibility.done')}
          intent="primary"
          variant="solid"
          radius="md"
          showLeftIcon={false}
          showRightIcon={false}
          showSecondaryLabel={false}
          onClick={onComplete}
        />
      </footer>

      <OverlaySurface
        open={loweredScreenConfirmationOpen}
        kind="modal"
        orientation="vertical"
        modalPlacement="above-navigation"
        onClose={cancelLoweredScreenActivation}
        portal
      >
        <ActionDialog
          title={t('accessibility.loweredConfirmTitle')}
          description={t('accessibility.loweredConfirmDescription')}
          illustration={<LoweredScreenIllustration aria-hidden="true" />}
          primaryActionLabel={t('accessibility.activateMode')}
          secondaryActionLabel={t('accessibility.cancel')}
          onPrimaryAction={confirmLoweredScreenActivation}
          onSecondaryAction={cancelLoweredScreenActivation}
          size="md"
        />
      </OverlaySurface>
    </section>
  );
}

function AccessibilityOption({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="accessibility-dialog__option">
      <div className="accessibility-dialog__option-copy">
        <p className="accessibility-dialog__option-title">{title}</p>
        <p className="accessibility-dialog__option-description">{description}</p>
      </div>
      <div className="accessibility-dialog__option-control">{children}</div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
