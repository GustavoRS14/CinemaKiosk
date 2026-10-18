import { useEffect, useState } from 'react';

import { LocaleAvatar } from '@components/Admin/LocaleAvatar';
import { SelectionTile } from '@components/Common/SelectionTile';
import { Footer } from '@components/Layout/Footer/Footer';
import { AccessibilityOverlay } from '@components/Overlays/Accessibility';
import { VendorLogo } from '../../../Utilities/Vendor/VendorLogo';
import {
  getLanguagePreferences,
  setLanguagePreferences,
  useI18n,
  type TerminalLocale,
} from '../../../i18n';
import { useOrientation } from '../../useOrientation';
import { OnboardingActivationPage } from '../OnboardingActivationPage';
import { resolveOnboardingSystemLocale } from '../onboardingSystemLocale';
import { onboardingTokenStyles } from '../onboardingTokenStyles';
import { useElectronWindowMode } from '../../electronWindowMode';
import './OnboardingLanguagePage.css';

const languages: Array<{ locale: TerminalLocale; labelKey: 'language.portuguese' | 'language.spanish' | 'language.english' }> = [
  { locale: 'pt-BR', labelKey: 'language.portuguese' },
  { locale: 'es-ES', labelKey: 'language.spanish' },
  { locale: 'en-US', labelKey: 'language.english' },
];

export interface OnboardingLanguagePageProps {
  /** Enables Windows/Electron language detection before showing this step. */
  autoDetectSystemLanguage?: boolean;
  /** Optional locale override for the host integration and deterministic tests. */
  systemLocale?: string | null;
  /** Notifies a host router when a supported system language skips this page. */
  onLanguageDetected?: (locale: TerminalLocale) => void;
  /** Notifies a host router when the user continues after a manual selection. */
  onContinue?: (locale: TerminalLocale) => void;
}

export function OnboardingLanguagePage({
  autoDetectSystemLanguage = true,
  systemLocale,
  onLanguageDetected,
  onContinue,
}: OnboardingLanguagePageProps) {
  useElectronWindowMode('onboarding');
  const orientation = useOrientation();
  const { t, setLocale } = useI18n();
  const [selectedLanguage, setSelectedLanguage] = useState<TerminalLocale>(
    () => getLanguagePreferences().defaultLocale,
  );
  const [isDetectingLanguage, setIsDetectingLanguage] = useState(autoDetectSystemLanguage);
  const [showActivation, setShowActivation] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  const applyLanguage = async (locale: TerminalLocale) => {
    setSelectedLanguage(locale);
    const currentPreferences = getLanguagePreferences();
    setLanguagePreferences({ ...currentPreferences, defaultLocale: locale });
    await setLocale(locale);
  };

  useEffect(() => {
    if (!autoDetectSystemLanguage) {
      setIsDetectingLanguage(false);
      return undefined;
    }

    let isActive = true;

    const detectSystemLanguage = async () => {
      const detectedLocale = await resolveOnboardingSystemLocale(systemLocale);
      if (!isActive) return;

      if (!detectedLocale) {
        setIsDetectingLanguage(false);
        return;
      }

      await applyLanguage(detectedLocale);
      if (!isActive) return;
      setShowActivation(true);
      setIsDetectingLanguage(false);
      onLanguageDetected?.(detectedLocale);
    };

    void detectSystemLanguage();
    return () => {
      isActive = false;
    };
  }, [autoDetectSystemLanguage, systemLocale]);

  const handleLanguageChange = (locale: TerminalLocale) => {
    void applyLanguage(locale);
  };

  const handleContinue = () => {
    setShowActivation(true);
    onContinue?.(selectedLanguage);
  };

  if (showActivation) return <OnboardingActivationPage />;

  if (isDetectingLanguage) {
    return (
      <div
        className={`onboarding-language-page onboarding-language-page--${orientation}`}
        data-theme="light"
        style={onboardingTokenStyles}
        aria-busy="true"
      />
    );
  }

  return (
    <div className={`onboarding-language-page onboarding-language-page--${orientation}`} data-theme="light" style={onboardingTokenStyles}>
      <main className="onboarding-language-page__main">
        <VendorLogo className="onboarding-language-page__logo" />

        <section className="onboarding-language-page__content" aria-labelledby="onboarding-language-title">
          <div className="onboarding-language-page__copy">
            <h1 id="onboarding-language-title">{t('onboarding.language.title')}</h1>
            <p>{t('onboarding.language.description')}</p>
          </div>

          <div className="onboarding-language-page__languages" role="radiogroup" aria-label={t('onboarding.language.aria')}>
            {languages.map(({ locale, labelKey }) => (
              <SelectionTile
                key={locale}
                className="onboarding-language-page__language"
                text={t(labelKey)}
                selected={selectedLanguage === locale}
                slotContent={<LocaleAvatar locale={locale} />}
                onClick={() => handleLanguageChange(locale)}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer
        actionLeft={false}
        showCenterAction
        showPrice={false}
        showTotalPrice={false}
        showMainCta
        mainCtaLabel={t('action.next')}
        onMainAction={handleContinue}
        onAccessibility={() => setIsAccessibilityOpen(true)}
      />
      <AccessibilityOverlay open={isAccessibilityOpen} orientation={orientation} onClose={() => setIsAccessibilityOpen(false)} />
    </div>
  );
}

OnboardingLanguagePage.displayName = 'OnboardingLanguagePage';
