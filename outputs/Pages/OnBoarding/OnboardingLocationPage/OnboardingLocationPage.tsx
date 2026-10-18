import { useMemo, useState } from 'react';

import { ProgressTracker } from '@components/Admin/ProgressTracker';
import { SectionHeader } from '@components/Admin/SectionHeader';
import { Footer } from '@components/Layout/Footer/Footer';
import { AccessibilityOverlay } from '@components/Overlays/Accessibility';
import { OverlaySurface } from '@components/Overlays/OverlaySurface';
import {
  OrganizationSelectionSlideOver,
  type OrganizationSelectionType,
} from '@components/Overlays/SlideOver/OrganizationSelectionSlideOver';
import ChevronDownIcon from '@icons/chevron-down.svg';
import LocationIcon from '@icons/location.svg';
import { useOrientation } from '../../useOrientation';
import { useI18n } from '../../../i18n';
import { setLocationPreferences } from '../../locationPreferences';
import { onboardingTokenStyles } from '../onboardingTokenStyles';
import { useElectronWindowMode } from '../../electronWindowMode';
import './OnboardingLocationPage.css';

export interface OnboardingLocationOption {
  value: string;
  label: string;
}

export interface OnboardingLocationSelection {
  exhibitor: string;
  complex: string;
}

export interface OnboardingLocationPageProps {
  exhibitors?: OnboardingLocationOption[];
  complexesByExhibitor?: Record<string, OnboardingLocationOption[]>;
  onBack?: () => void;
  onContinue?: (selection: OnboardingLocationSelection) => void;
}

const defaultExhibitors: OnboardingLocationOption[] = [
  { value: 'arcoplex', label: 'Arcoplex Cinemas' },
  { value: 'cine-araujo', label: 'Cine Araújo' },
  { value: 'cinemais', label: 'Cinemais' },
  { value: 'cinesercla', label: 'Cinesercla Cinemas' },
  { value: 'cine-show', label: 'Cine Show' },
  { value: 'circuito', label: 'Circuito Cinemas' },
  { value: 'cineflix', label: 'Cineflix' },
  { value: 'kinoplex', label: 'Kinoplex' },
  { value: 'multicine', label: 'Multicine' },
];

const defaultComplexes: OnboardingLocationOption[] = [
  { value: 'big-shopping', label: 'BIG Shopping' },
  { value: 'gv-shopping', label: 'GV Shopping' },
  { value: 'palmas-shopping', label: 'Palmas Shopping' },
  { value: 'shopping-avenida-28', label: 'Shopping Avenida 28' },
  { value: 'shopping-montserrat', label: 'Shopping Montserrat' },
  { value: 'shopping-norte', label: 'Shopping Norte' },
  { value: 'shopping-osasco-plaza', label: 'Shopping Osasco Plaza' },
  { value: 'shopping-praia-sul', label: 'Shopping Praia Sul' },
  { value: 'shopping-premio', label: 'Shopping Prêmio' },
];

export function OnboardingLocationPage({
  exhibitors = defaultExhibitors,
  complexesByExhibitor = {},
  onBack,
  onContinue,
}: OnboardingLocationPageProps) {
  useElectronWindowMode('onboarding');
  const orientation = useOrientation();
  const { t } = useI18n();
  const horizontalStepLabels = [t('onboarding.step.activation'), t('onboarding.step.linkUnit'), t('onboarding.step.hardware'), t('onboarding.step.security')] as const;
  const verticalStepLabels = [t('onboarding.step.activation'), t('onboarding.step.location'), t('onboarding.step.hardware'), t('onboarding.step.security')] as const;
  const [selectedExhibitor, setSelectedExhibitor] = useState('');
  const [selectedComplex, setSelectedComplex] = useState('');
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [organizationSlideOver, setOrganizationSlideOver] = useState<OrganizationSelectionType | null>(null);

  const availableComplexes = useMemo(
    () => complexesByExhibitor[selectedExhibitor] ?? (selectedExhibitor ? defaultComplexes : []),
    [complexesByExhibitor, selectedExhibitor],
  );
  const canContinue = selectedExhibitor.length > 0 && selectedComplex.length > 0;

  const handleExhibitorChange = (value: string) => {
    setSelectedExhibitor(value);
    setSelectedComplex('');
  };

  const handleContinue = () => {
    if (canContinue) {
      setLocationPreferences({
        network: exhibitors.find((option) => option.value === selectedExhibitor)?.label ?? selectedExhibitor,
        complex: availableComplexes.find((option) => option.value === selectedComplex)?.label ?? selectedComplex,
      });
      onContinue?.({ exhibitor: selectedExhibitor, complex: selectedComplex });
    }
  };

  return (
    <div className={`onboarding-location-page onboarding-location-page--${orientation}`} data-theme="light" style={onboardingTokenStyles}>
      <ProgressTracker
        className="onboarding-location-page__progress"
        orientation={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
        currentStep={2}
        stepLabels={orientation === 'horizontal' ? horizontalStepLabels : verticalStepLabels}
      />

      <div className="onboarding-location-page__body">
        <main className="onboarding-location-page__main">
          <header className="onboarding-location-page__copy">
            <h1>{t('onboarding.location.title')}</h1>
            <p>{t('onboarding.location.description')}</p>
          </header>

          <section className="onboarding-location-page__card" aria-label={t('onboarding.location.section')}>
            <SectionHeader
              title={t('onboarding.location.section')}
              icon={<LocationIcon className="section-header-icon" aria-hidden="true" />}
            />

            <div className="onboarding-location-page__fields">
              <div className="onboarding-location-page__field">
                <span>{t('onboarding.location.exhibitor')}</span>
                <span className="onboarding-location-page__select-wrapper">
                  <button
                    type="button"
                    className="onboarding-location-page__select-control"
                    onClick={() => setOrganizationSlideOver('network')}
                  >
                    <span className="onboarding-location-page__select-value">
                      {exhibitors.find((option) => option.value === selectedExhibitor)?.label
                        ?? t('onboarding.location.select')}
                    </span>
                  </button>
                  <ChevronDownIcon aria-hidden="true" />
                </span>
              </div>

              <div className="onboarding-location-page__field">
                <span>{t('onboarding.location.complex')}</span>
                <span className="onboarding-location-page__select-wrapper">
                  <button
                    type="button"
                    className="onboarding-location-page__select-control"
                    disabled={!selectedExhibitor}
                    onClick={() => setOrganizationSlideOver('complex')}
                  >
                    <span className="onboarding-location-page__select-value">
                      {availableComplexes.find((option) => option.value === selectedComplex)?.label
                        ?? t('onboarding.location.select')}
                    </span>
                  </button>
                  <ChevronDownIcon aria-hidden="true" />
                </span>
              </div>
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
          onMainAction={handleContinue}
          onAccessibility={() => setIsAccessibilityOpen(true)}
        />
        <AccessibilityOverlay open={isAccessibilityOpen} orientation={orientation} onClose={() => setIsAccessibilityOpen(false)} />
        <OverlaySurface
          open={organizationSlideOver !== null}
          kind="slideover"
          orientation={orientation}
          onClose={() => setOrganizationSlideOver(null)}
        >
          <OrganizationSelectionSlideOver
            type={organizationSlideOver ?? 'network'}
            options={(organizationSlideOver === 'complex' ? availableComplexes : exhibitors).map((option) => ({
              id: option.value,
              title: option.label,
            }))}
            selectedId={organizationSlideOver === 'complex' ? selectedComplex : selectedExhibitor}
            networkSelected={Boolean(selectedExhibitor)}
            onClose={() => setOrganizationSlideOver(null)}
            onConfirm={(option) => {
              if (organizationSlideOver === 'network') handleExhibitorChange(option.id);
              else setSelectedComplex(option.id);
              setOrganizationSlideOver(null);
            }}
          />
        </OverlaySurface>
      </div>
    </div>
  );
}

OnboardingLocationPage.displayName = 'OnboardingLocationPage';
