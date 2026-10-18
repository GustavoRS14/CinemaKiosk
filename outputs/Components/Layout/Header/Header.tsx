import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../../BrandLogo/BrandLogo';
import { VendorLogo } from '../../../Utilities/Vendor/VendorLogo';
import { UserBadge, type UserBadgeClubStatus } from '../../Common/UserBadge';
import { CloseButton } from '../../Common/CloseButton';
import { Tag } from '../../Common/Tag';
import { ModalAccessibilityTrigger } from '../Navbar/ModalAccessibilityTrigger';
import { SystemSessionOverlays, setInactivityMonitoringEnabled } from '../../Overlays/SystemSessionOverlays';
import { CustomerHomeExitDialog } from '../../Overlays/CustomerHomeExitDialog';
import { InputDialog } from '../../Overlays/InputDialog';
import { LoyaltyClubDialog } from '../../Overlays/Dialog/LoyaltyClubDialog';
import { OverlaySurface } from '../../Overlays/OverlaySurface';
import { useI18n, useLanguagePreferences, type AppLocale } from '../../../i18n';
import { useFeaturePreferences } from '../../../Pages/featurePreferences';
import { useOrientation } from '../../../Pages/useOrientation';
import {
  DISPLAY_PREFERENCES_EVENT,
  getThemePreference,
  type ThemePreference,
} from '../../../Pages/displayPreferences';
import {
  getTenantPreference,
  LOCATION_PREFERENCES_EVENT,
} from '../../../Pages/locationPreferences';
import { getBrandPaletteCountForTenant } from '../../../Tokens/activeBrand';
import { recommendThemeForTenant } from '../../../StoryTokenCanvas';
import {
  claimAutomaticIdentityPrompt,
  setCustomerIdentity,
  useCustomerIdentity,
  useTenantClubName,
  validateLoyaltyCpf,
} from '../../../Pages/Customer/customerIdentitySession';
import { validateSchoolProjectCnpj } from '../../../Pages/Customer/schoolProjectApi';
import { CUSTOMER_FLOW_RESET_EVENT } from '../../../Pages/Customer/customerFlowReset';
import './Header.css';

export type HeaderProps = {
  className?: string;
  context?: 'Customer' | 'Admin';
  type?: 'Default' | 'Purchase' | 'Offline';
  /** Optional override. If omitted, uses live local date. */
  date?: string;
  /** Optional override. If omitted, uses live local time. */
  time?: string;
  /** Version displayed beside the vendor logo in the Admin context. */
  version?: string;
  /** Handles the close action during a purchase flow. */
  onClose?: () => void;
  /** Overrides the loyalty-program state configured in Admin. */
  clubStatus?: UserBadgeClubStatus;
  /** Shows the identification invitation once per customer session. */
  autoOpenIdentityPrompt?: boolean;
  /** Shows the standalone Navbar accessibility action while the initial identity modal is open. */
  onInitialModalAccessibility?: () => void;
  initialModalAccessibilityOpen?: boolean;
};

// Helper functions for localized formatting
const getLiveTime = (locale: AppLocale) => {
  return new Date().toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getLiveDate = (locale: AppLocale) => {
  const now = new Date();
  const formatted = now.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const Header = ({
  className = '',
  context = 'Customer',
  type = 'Default',
  date,
  time,
  version = 'V 1.0.0.0',
  onClose,
  clubStatus,
  autoOpenIdentityPrompt = false,
  onInitialModalAccessibility,
  initialModalAccessibilityOpen = false,
}: HeaderProps) => {
  const { locale, resetLocale, t } = useI18n();
  const languagePreferences = useLanguagePreferences();
  const activeType = context === 'Admin' ? 'Default' : type;
  const { groupSalesSchoolProject, loyaltyProgram } = useFeaturePreferences();
  const resolvedClubStatus = clubStatus ?? (loyaltyProgram ? 'active' : 'inactive');
  const clubName = useTenantClubName(resolvedClubStatus === 'active');
  const orientation = useOrientation();
  const [activeTheme, setActiveTheme] = useState<ThemePreference>(() => getThemePreference());
  const [activeTenant, setActiveTenant] = useState(() => getTenantPreference());
  const identity = useCustomerIdentity();
  const [identityDialog, setIdentityDialog] = useState<'closed' | 'loyalty' | 'input'>('closed');
  const [cpfInput, setCpfInput] = useState(identity.cpf);
  const [submittingCpf, setSubmittingCpf] = useState(false);
  const suppressIdentityForTranslatedFlow = languagePreferences.defaultLocale === 'pt-BR'
    && locale !== 'pt-BR';
  const identityDocumentLengthIsValid = cpfInput.length === 11
    || (groupSalesSchoolProject && cpfInput.length === 14);

  useEffect(() => {
    const updateDisplayContext = () => {
      setActiveTheme(getThemePreference());
      setActiveTenant(getTenantPreference());
    };
    window.addEventListener(DISPLAY_PREFERENCES_EVENT, updateDisplayContext);
    window.addEventListener(LOCATION_PREFERENCES_EVENT, updateDisplayContext);
    window.addEventListener('storage', updateDisplayContext);
    return () => {
      window.removeEventListener(DISPLAY_PREFERENCES_EVENT, updateDisplayContext);
      window.removeEventListener(LOCATION_PREFERENCES_EVENT, updateDisplayContext);
      window.removeEventListener('storage', updateDisplayContext);
    };
  }, []);

  useEffect(() => {
    if (!groupSalesSchoolProject && cpfInput.length > 11) {
      setCpfInput((current) => current.slice(0, 11));
    }
  }, [cpfInput.length, groupSalesSchoolProject]);

  useEffect(() => {
    if (groupSalesSchoolProject || identity.documentType !== 'CNPJ') return;
    setCustomerIdentity({ authState: 'Unidentified', cpf: '' });
    setCpfInput('');
  }, [groupSalesSchoolProject, identity.documentType]);

  useEffect(() => {
    const resetIdentityDialog = () => {
      setIdentityDialog('closed');
      setCpfInput('');
      setSubmittingCpf(false);
    };
    window.addEventListener(CUSTOMER_FLOW_RESET_EVENT, resetIdentityDialog);
    return () => window.removeEventListener(CUSTOMER_FLOW_RESET_EVENT, resetIdentityDialog);
  }, []);

  useEffect(() => {
    if (suppressIdentityForTranslatedFlow) {
      setIdentityDialog('closed');
      return;
    }
    if (!autoOpenIdentityPrompt || !claimAutomaticIdentityPrompt()) return;
    setIdentityDialog(resolvedClubStatus === 'active' ? 'loyalty' : 'input');
  }, [autoOpenIdentityPrompt, resolvedClubStatus, suppressIdentityForTranslatedFlow]);

  useEffect(() => {
    const silentTimeoutPage = window.location.pathname === '/concessions'
      || window.location.pathname === '/movies';
    if (identityDialog !== 'loyalty' || !silentTimeoutPage) return undefined;

    setInactivityMonitoringEnabled(false);
    let timeoutId: number;
    const scheduleReturnHome = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIdentityDialog('closed');
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 90_000);
    };
    const activityEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'wheel'];
    activityEvents.forEach((event) => window.addEventListener(event, scheduleReturnHome, { passive: true }));
    scheduleReturnHome();

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((event) => window.removeEventListener(event, scheduleReturnHome));
      setInactivityMonitoringEnabled(true);
    };
  }, [identityDialog]);

  const openCpfDialog = () => {
    setCpfInput(identity.cpf);
    setIdentityDialog('input');
  };

  const updateCpf = (cpf: string) => {
    setCpfInput(cpf);
  };

  const handleIdentitySecondaryAction = () => {
    if (identity.cpf) {
      setCustomerIdentity({ authState: 'Unidentified', cpf: '' });
      setCpfInput('');
    }
    setIdentityDialog('closed');
  };

  const confirmCpf = async () => {
    if (!identityDocumentLengthIsValid || submittingCpf) return;
    setSubmittingCpf(true);
    try {
      const isCnpj = cpfInput.length === 14;
      if (isCnpj) {
        const registration = await validateSchoolProjectCnpj(cpfInput);
        setCustomerIdentity({
          authState: 'Guest',
          cpf: cpfInput,
          documentType: 'CNPJ',
          schoolProjectRegistered: registration.isRegistered,
          organizationName: registration.organizationName,
          organizationNameParts: registration.organizationNameParts,
        });
        setIdentityDialog('closed');
        return;
      }

      const member = resolvedClubStatus === 'active'
        ? await validateLoyaltyCpf(cpfInput)
        : { isMember: false };
      setCustomerIdentity({
        authState: member.isMember ? 'Member' : 'Guest',
        cpf: cpfInput,
        memberName: member.memberName,
        memberFirstName: member.firstName,
        memberLastName: member.lastName,
        documentType: 'CPF',
        schoolProjectRegistered: false,
      });
      setIdentityDialog('closed');
    } catch {
      // Keep the dialog open so the customer can retry after a temporary API failure.
    } finally {
      setSubmittingCpf(false);
    }
  };

  // Internal state for the live clock. Falls back to static props if provided (for Storybook)
  const [currentTime, setCurrentTime] = useState(time || getLiveTime(locale));
  const [currentDate, setCurrentDate] = useState(date || getLiveDate(locale));
  const recommendedTheme = recommendThemeForTenant(
    orientation === 'horizontal' ? 'Horizontal' : 'Vertical',
    activeTenant,
  );
  const purchasePrimaryOverride = activeType === 'Purchase' && activeTheme !== recommendedTheme
    ? (activeTheme === 'light' ? 'Black' : 'White')
    : undefined;
  const purchaseTextOverride = activeType === 'Purchase'
    && getBrandPaletteCountForTenant(activeTenant) === 1
    ? (activeTheme === 'light' ? 'Black' : 'White')
    : undefined;

  useEffect(() => {
    // If both static overrides are provided via props, no need to run the interval
    if (time && date) return;

    if (!time) setCurrentTime(getLiveTime(locale));
    if (!date) setCurrentDate(getLiveDate(locale));
    const intervalId = setInterval(() => {
      if (!time) setCurrentTime(getLiveTime(locale));
      if (!date) setCurrentDate(getLiveDate(locale));
    }, 10000); // Check every 10 seconds to quickly catch minute changes

    return () => clearInterval(intervalId);
  }, [time, date, locale]);

  // Isolate Admin context to strictly render only VendorLogo group and Tag
  if (context === 'Admin') {
    return (
      <>
      <header className={`header ${className}`.trim()} data-type={activeType} data-context="Admin">
        <div className="header-admin-content">
          <div className="header-vendor-wrapper">
            <span className="header-powered-text">Powered By</span>
            <VendorLogo />
          </div>
          <Tag status="Neutral" text={version} />
        </div>
      </header>
      <SystemSessionOverlays monitorInactivity={false} monitorConnectivity={false} />
      </>
    );
  }

  return (
    <>
    <header className={`header ${className}`.trim()} data-type={activeType} data-context={context}>
      {activeType === 'Offline' ? (
        <BrandLogo
          colorVariant="DefaultColor"
          imageVariantContext="CustomerHeaderPurchaseOrOffline"
        />
      ) : (
        <>
          <div className="header-left">
            <BrandLogo
              colorVariant={type === 'Default' ? 'WhiteColor' : 'DefaultColor'}
              imageVariantContext={type === 'Default'
                ? 'CustomerHeaderDefault'
                : 'CustomerHeaderPurchaseOrOffline'}
              matchPrimarySurfaceContrast={type === 'Default'}
              primaryFoundationOverride={purchasePrimaryOverride}
              textFoundationOverride={purchaseTextOverride}
            />
          </div>

          <div className="header-center">
            {!suppressIdentityForTranslatedFlow && (resolvedClubStatus === 'active' ? (
              <UserBadge
                authState={identity.authState}
                clubStatus="active"
                clubName={clubName}
                documentType={identity.documentType}
                organizationName={identity.organizationName}
                organizationNameParts={identity.organizationNameParts}
                schoolProjectRegistered={identity.schoolProjectRegistered}
                memberFirstName={identity.memberFirstName}
                memberLastName={identity.memberLastName}
                label={identity.authState === 'Member' ? identity.memberName ?? clubName : clubName}
                value={identity.cpf}
                contextFlow={activeType === 'Purchase' ? 'Checkout' : 'Browsing'}
                onClick={openCpfDialog}
              />
            ) : (
              <UserBadge
                authState={identity.authState === 'Member' ? 'Guest' : identity.authState}
                clubStatus="inactive"
                documentType={identity.documentType}
                organizationName={identity.organizationName}
                organizationNameParts={identity.organizationNameParts}
                schoolProjectRegistered={identity.schoolProjectRegistered}
                value={identity.cpf}
                contextFlow={activeType === 'Purchase' ? 'Checkout' : 'Browsing'}
                onClick={openCpfDialog}
              />
            ))}
          </div>

          <div className="header-right">
            <div className="header-actions-wrapper">
              <div className="header-time-date">
                <p className="header-time">{currentTime}</p>
                <p className="header-date">{currentDate}</p>
              </div>
              {activeType === 'Purchase' && (
                <CloseButton type="Contained" onClick={onClose ?? resetLocale} />
              )}
            </div>
          </div>
        </>
      )}
    </header>
    <SystemSessionOverlays monitorInactivity={activeType !== 'Offline'} />
    <CustomerHomeExitDialog onExit={() => {
      resetLocale();
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }} />
    <OverlaySurface
      open={!suppressIdentityForTranslatedFlow && identityDialog !== 'closed'}
      kind="modal"
      orientation={orientation}
      closeOnBackdrop={false}
      onClose={() => setIdentityDialog('closed')}
    >
      {identityDialog === 'loyalty' ? (
        <LoyaltyClubDialog
          size="lg"
          clubName={clubName}
          onEnterCpf={openCpfDialog}
          onDecline={() => setIdentityDialog('closed')}
        />
      ) : (
        <InputDialog
          size="lg"
          title={resolvedClubStatus === 'active' ? t('identity.enterCpf') : t('identity.identifyPurchase')}
          description={resolvedClubStatus === 'active'
            ? t('identity.clubDescription', { clubName })
            : t('identity.receiptDescription')}
          showMethodText={false}
          inputPlaceholder="CPF"
          value={cpfInput}
          maxLength={groupSalesSchoolProject ? 14 : 11}
          inputFormat="document"
          maskValue
          primaryActionLabel={submittingCpf
            ? t('identity.checking')
            : t(groupSalesSchoolProject ? 'identity.confirm' : 'identity.confirmCpf')}
          secondaryActionLabel={t(identity.cpf ? 'identity.doNotInform' : 'identity.skip')}
          primaryDisabled={!identityDocumentLengthIsValid || submittingCpf}
          onChange={updateCpf}
          onPrimaryAction={() => void confirmCpf()}
          onSecondaryAction={handleIdentitySecondaryAction}
        />
      )}
    </OverlaySurface>
    <ModalAccessibilityTrigger
      visible={Boolean(
        onInitialModalAccessibility
        && !initialModalAccessibilityOpen
        && !suppressIdentityForTranslatedFlow
        && identityDialog !== 'closed'
      )}
      orientation={orientation}
      onClick={onInitialModalAccessibility ?? (() => undefined)}
    />
    </>
  );
};
