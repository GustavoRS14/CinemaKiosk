import { useEffect, useRef, useState } from 'react';
import { HeroCarousel, type HeroCarouselItem } from '@components/Common/HeroCarousel';
import { resetPageContentPreload } from '@components/Common/PageLoadingScreen';
import { MetadataBar } from '@components/Layout/MetadataBar/MetadataBar';
import { WelcomeFooter } from '@components/Layout/WelcomeFooter';
import { KeyboardDialog } from '@components/Overlays/KeyboardDialog/KeyboardDialog';
import { SuccessDialog } from '@components/Overlays/Dialog/SuccessDialog';
import { PrintingFailureDialog } from '@components/Overlays/Dialog/PrintingFailureDialog';
import { OverlaySurface } from '@components/Overlays/OverlaySurface';
import { AccessibilityOverlay } from '@components/Overlays/Accessibility';
import type { AccessibilityPreferenceValues } from '@components/Overlays/Accessibility/Accessibility';
import { ModalAccessibilityTrigger } from '@components/Layout/Navbar/ModalAccessibilityTrigger';
import { setInactivityMonitoringEnabled } from '@components/Overlays/SystemSessionOverlays';
import { useI18n, useLanguagePreferences } from '../../../../i18n';
import {
  DEFAULT_TEXT_SCALE,
  setHighContrastPreference,
  setLoweredScreenPreference,
  setTextScalePreference,
} from '../../../accessibilityPreferences';
import { useOrientation } from '../../../useOrientation';
import { resetCustomerIdentitySession } from '../../customerIdentitySession';
import { resetCustomerFlowUiSession } from '../../customerFlowReset';
import { resetConcessionOfferSession } from '../../Concessions/useConcessionOfferFlow';
import { resetConcessionsCartSession } from '../../Concessions/useConcessionsCart';
import { resetMovieFiltersSession } from '../../Movies/movieFilters';
import { validateAdminAccessPin } from '../../../adminPinPreferences';
import { resetMoviePurchaseTotal } from '../../Purchase/Movies/moviePurchaseTotal';
import { applyPendingComplexThemeOnHome } from '../../../complexThemePreferences';
import { getThemePreference } from '../../../displayPreferences';
import { getTenantPreference } from '../../../locationPreferences';
import { tokenStyles } from '../../../../StoryTokenCanvas';

import marioHorizontal from '@images/Home/home-mario-horizontal.png';
import marioVertical from '@images/Home/home-mario-vertical.png';
import minionsHorizontal from '@images/Home/home-minions-horizontal.png';
import minionsVertical from '@images/Home/home-minions-vertical.png';
import serclaClubHorizontal from '@images/Home/home-sercla-club-horizontal.png';
import serclaClubVertical from '@images/Home/home-sercla-club-vertical.png';
import odisseiaHorizontal from '@images/Home/home-odisseia-horizontal.png';
import odisseiaVertical from '@images/Home/home-odisseia-vertical.png';
import imperdivelHorizontal from '@images/Home/home-imperdivel-horizontal.png';
import imperdivelVertical from '@images/Home/home-imperdivel-vertical.png';
import spiderManHorizontal from '@images/Home/home-spider-man-horizontal.png';
import spiderManVertical from '@images/Home/home-spider-man-vertical.png';
import toyStoryHorizontal from '@images/Home/home-toy-story-horizontal.png';
import toyStoryVertical from '@images/Home/home-toy-story-vertical.png';

import './HomePage.css';

const homeBanners: HeroCarouselItem[] = [
  {
    id: 'super-mario-galaxy',
    imageUrlHorizontal: marioHorizontal,
    imageUrlVertical: marioVertical,
    altText: 'Promoção Super Mario Galaxy: O Filme',
  },
  {
    id: 'minions-monstros',
    imageUrlHorizontal: minionsHorizontal,
    imageUrlVertical: minionsVertical,
    altText: 'Promoção Minions e Monstros',
  },
  {
    id: 'sercla-clube',
    imageUrlHorizontal: serclaClubHorizontal,
    imageUrlVertical: serclaClubVertical,
    altText: 'Programa de fidelidade Sercla Clube',
  },
  {
    id: 'a-odisseia',
    imageUrlHorizontal: odisseiaHorizontal,
    imageUrlVertical: odisseiaVertical,
    altText: 'A Odisseia nos cinemas',
  },
  {
    id: 'imperdivel',
    imageUrlHorizontal: imperdivelHorizontal,
    imageUrlVertical: imperdivelVertical,
    altText: 'Ofertas imperdíveis do Sercla Clube',
  },
  {
    id: 'homem-aranha',
    imageUrlHorizontal: spiderManHorizontal,
    imageUrlVertical: spiderManVertical,
    altText: 'Homem-Aranha: Um Novo Dia',
  },
  {
    id: 'toy-story',
    imageUrlHorizontal: toyStoryHorizontal,
    imageUrlVertical: toyStoryVertical,
    altText: 'Sorteio Toy Story',
  },
];

const DEFAULT_ORDER_ACCESSIBILITY: AccessibilityPreferenceValues = {
  textScale: DEFAULT_TEXT_SCALE,
  highContrast: false,
  loweredScreen: false,
};

export type HomePageProps = {
  validateOnlineOrder?: (code: string) => boolean | Promise<boolean>;
  /** Live status reported by the thermal-printer integration. */
  onlineOrderPrintStatus?: 'idle' | 'printing' | 'completed' | 'failed';
  /** Starts printing after the order is found. Resolve on completion and reject on failure. */
  onPrintOnlineOrder?: (code: string) => void | Promise<void>;
};

export function HomePage({
  validateOnlineOrder,
  onlineOrderPrintStatus,
  onPrintOnlineOrder,
}: HomePageProps) {
  const { resetLocale, t } = useI18n();
  const languagePreferences = useLanguagePreferences();
  const orientation = useOrientation();
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [orderCodeInvalid, setOrderCodeInvalid] = useState(false);
  const [orderSearching, setOrderSearching] = useState(false);
  const [orderFound, setOrderFound] = useState(false);
  const [printFailed, setPrintFailed] = useState(false);
  const [orderAccessibilityOpen, setOrderAccessibilityOpen] = useState(false);
  const [orderAccessibility, setOrderAccessibility] = useState<AccessibilityPreferenceValues>(
    DEFAULT_ORDER_ACCESSIBILITY,
  );
  const [adminAccessOpen, setAdminAccessOpen] = useState(false);
  const [adminPin, setAdminPinValue] = useState('');
  const [adminPinInvalid, setAdminPinInvalid] = useState(false);
  const [welcomeActionsVisible, setWelcomeActionsVisible] = useState(
    () => !languagePreferences.multilingual,
  );
  const versionClickCountRef = useRef(0);
  const versionClickTimeoutRef = useRef<number | null>(null);
  const welcomeActionsTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    applyPendingComplexThemeOnHome();
    resetPageContentPreload();
    setHighContrastPreference(false);
    setTextScalePreference(DEFAULT_TEXT_SCALE);
    setLoweredScreenPreference(false);
    resetLocale();
    resetCustomerIdentitySession();
    resetConcessionsCartSession();
    resetConcessionOfferSession();
    resetMovieFiltersSession();
    resetCustomerFlowUiSession();
    resetMoviePurchaseTotal();
    setOrderDialogOpen(false);
    setOrderCode('');
    setOrderCodeInvalid(false);
    setOrderSearching(false);
    setOrderFound(false);
    setPrintFailed(false);
    setOrderAccessibilityOpen(false);
    setOrderAccessibility(DEFAULT_ORDER_ACCESSIBILITY);
    setAdminAccessOpen(false);
    setAdminPinValue('');
    setAdminPinInvalid(false);
    setInactivityMonitoringEnabled(false);

    const resetPreloadAfterPageRestore = () => resetPageContentPreload();
    window.addEventListener('pageshow', resetPreloadAfterPageRestore);

    return () => {
      window.removeEventListener('pageshow', resetPreloadAfterPageRestore);
      setInactivityMonitoringEnabled(true);
      if (versionClickTimeoutRef.current !== null) {
        window.clearTimeout(versionClickTimeoutRef.current);
      }
      if (welcomeActionsTimeoutRef.current !== null) {
        window.clearTimeout(welcomeActionsTimeoutRef.current);
      }
    };
  }, [resetLocale]);

  useEffect(() => {
    const navigateTo = (path: string) => {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };
    const showOfflinePage = () => {
      if (window.location.pathname !== '/offline') navigateTo('/offline');
    };
    const returnToHome = () => {
      if (window.location.pathname === '/offline') navigateTo('/');
    };

    window.addEventListener('offline', showOfflinePage);
    window.addEventListener('online', returnToHome);
    if (!window.navigator.onLine) showOfflinePage();

    return () => {
      window.removeEventListener('offline', showOfflinePage);
      window.removeEventListener('online', returnToHome);
    };
  }, []);

  useEffect(() => {
    if (welcomeActionsTimeoutRef.current !== null) {
      window.clearTimeout(welcomeActionsTimeoutRef.current);
      welcomeActionsTimeoutRef.current = null;
    }
    setWelcomeActionsVisible(!languagePreferences.multilingual);
  }, [languagePreferences.multilingual]);

  useEffect(() => {
    if (!orderFound) return;
    if (onlineOrderPrintStatus === 'completed') {
      setOrderDialogOpen(false);
      setOrderAccessibilityOpen(false);
      setOrderAccessibility(DEFAULT_ORDER_ACCESSIBILITY);
      resetLocale();
    }
    if (onlineOrderPrintStatus === 'failed') setPrintFailed(true);
  }, [onlineOrderPrintStatus, orderFound, resetLocale]);

  useEffect(() => {
    if (!orderFound || onPrintOnlineOrder || onlineOrderPrintStatus !== undefined) return undefined;
    const fallback = window.setTimeout(() => {
      setOrderDialogOpen(false);
      setOrderAccessibilityOpen(false);
      setOrderAccessibility(DEFAULT_ORDER_ACCESSIBILITY);
      resetLocale();
    }, 2_000);
    return () => window.clearTimeout(fallback);
  }, [onlineOrderPrintStatus, onPrintOnlineOrder, orderFound, resetLocale]);

  const openOrderSearch = () => {
    setOrderCode('');
    setOrderCodeInvalid(false);
    setOrderFound(false);
    setPrintFailed(false);
    setOrderAccessibilityOpen(false);
    setOrderAccessibility(DEFAULT_ORDER_ACCESSIBILITY);
    setOrderDialogOpen(true);
  };

  const closeOrderSearch = () => {
    setOrderDialogOpen(false);
    setOrderAccessibilityOpen(false);
    setOrderAccessibility(DEFAULT_ORDER_ACCESSIBILITY);
    resetLocale();
  };

  const searchOrder = async () => {
    const normalizedCode = orderCode.trim().toUpperCase();
    if (!normalizedCode || orderSearching) return;
    setOrderSearching(true);
    setOrderCodeInvalid(false);
    const [isValid] = await Promise.all([
      validateOnlineOrder ? validateOnlineOrder(normalizedCode) : normalizedCode === '12345678910',
      new Promise((resolve) => window.setTimeout(resolve, 500)),
    ]);
    setOrderSearching(false);
    if (!isValid) {
      setOrderCodeInvalid(true);
      return;
    }
    setOrderFound(true);
    if (onPrintOnlineOrder) {
      try {
        await onPrintOnlineOrder(normalizedCode);
        closeOrderSearch();
      } catch {
        setPrintFailed(true);
      }
    }
  };

  const registerVersionClick = () => {
    if (versionClickTimeoutRef.current !== null) {
      window.clearTimeout(versionClickTimeoutRef.current);
    }
    versionClickCountRef.current += 1;
    if (versionClickCountRef.current >= 5) {
      versionClickCountRef.current = 0;
      setAdminPinValue('');
      setAdminPinInvalid(false);
      setAdminAccessOpen(true);
      return;
    }
    versionClickTimeoutRef.current = window.setTimeout(() => {
      versionClickCountRef.current = 0;
    }, 2_000);
  };

  const revealWelcomeActions = () => {
    if (!languagePreferences.multilingual) return;
    setWelcomeActionsVisible(true);
    if (welcomeActionsTimeoutRef.current !== null) {
      window.clearTimeout(welcomeActionsTimeoutRef.current);
    }
    welcomeActionsTimeoutRef.current = window.setTimeout(() => {
      setWelcomeActionsVisible(false);
      welcomeActionsTimeoutRef.current = null;
    }, 60_000);
  };

  const accessAdminPanel = () => {
    if (!validateAdminAccessPin(adminPin)) {
      setAdminPinInvalid(true);
      return;
    }
    setAdminAccessOpen(false);
    window.history.pushState({}, '', '/admin');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  const orderKeyboardActive = orderDialogOpen && !orderFound && !printFailed;
  const orderScopeStyles = tokenStyles(
    getThemePreference() === 'dark' ? 'Dark' : 'Light',
    orientation === 'horizontal' ? 'Horizontal' : 'Vertical',
    getTenantPreference(),
    orderAccessibility.highContrast,
    orderAccessibility.textScale,
  );
  return (
    <div className={`customer-home-page customer-home-page--${orientation}`} data-orientation={orientation}>
      <main
        className={`customer-home-page__hero ${languagePreferences.multilingual && !welcomeActionsVisible ? 'customer-home-page__hero--interactive' : ''}`.trim()}
        aria-label={t('home.highlightsAria')}
        onClick={languagePreferences.multilingual && !welcomeActionsVisible ? revealWelcomeActions : undefined}
      >
        <HeroCarousel
          key={orientation}
          items={homeBanners}
          orientation={orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
        />
      </main>

      <WelcomeFooter
        showActions={welcomeActionsVisible}
        defaultLocale={languagePreferences.defaultLocale}
        onPickupOrder={openOrderSearch}
        onRevealActions={revealWelcomeActions}
      />
      <MetadataBar version="V 1.0.0.1" onVersionClick={registerVersionClick} />
      <div
        className="customer-home-page__order-accessibility-scope"
        data-high-contrast={orderAccessibility.highContrast}
        data-text-scale={orderAccessibility.textScale.toFixed(1)}
        data-lowered-screen={orderAccessibility.loweredScreen}
        style={orderScopeStyles}
      >
        <OverlaySurface
          open={orderDialogOpen}
          kind="modal"
          orientation={orientation}
          modalPlacement={orderAccessibility.loweredScreen ? 'above-navigation' : 'center'}
          closeOnBackdrop={false}
          onClose={closeOrderSearch}
        >
        {printFailed ? (
          <PrintingFailureDialog
            scenario="online-order"
            size="md"
            onClose={closeOrderSearch}
          />
        ) : orderFound ? (
          <SuccessDialog variant="order-found" size="md" />
        ) : (
          <KeyboardDialog
            variant="alphanumeric"
            size="lg"
            title={t('home.orderSearchTitle')}
            description={t('home.orderSearchDescription')}
            inputPlaceholder={t('home.orderNumber')}
            value={orderCode}
            onChange={(value) => {
              setOrderCode(value);
              setOrderCodeInvalid(false);
            }}
            inputState={orderCodeInvalid ? 'Invalid' : orderCode ? 'Filled' : 'Default'}
            supportingText={orderCodeInvalid ? t('home.orderNotFound') : undefined}
            secondaryActionLabel={t('checkout.cancel')}
            primaryActionLabel={t('home.searchOrder')}
            primaryDisabled={!orderCode.trim()}
            busy={orderSearching}
            busyPrimaryActionLabel={t('home.searching')}
            onSecondaryAction={() => {
              closeOrderSearch();
            }}
            onPrimaryAction={searchOrder}
          />
        )}
        </OverlaySurface>
        <ModalAccessibilityTrigger
          visible={orderKeyboardActive && !orderAccessibilityOpen}
          orientation={orientation}
          onClick={() => setOrderAccessibilityOpen(true)}
        />
        <AccessibilityOverlay
          open={orderAccessibilityOpen}
          orientation={orientation}
          onClose={() => setOrderAccessibilityOpen(false)}
          preferences={orderAccessibility}
          onPreferencesChange={setOrderAccessibility}
        />
      </div>
      <OverlaySurface
        open={adminAccessOpen}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => setAdminAccessOpen(false)}
      >
        <KeyboardDialog
          variant="numeric"
          size="md"
          title={t('admin.dialog.restrictedAccess')}
          description={t('home.adminAccessDescription')}
          inputPlaceholder={t('admin.dialog.pinPlaceholder')}
          value={adminPin}
          maxLength={6}
          maskValue
          inputState={adminPinInvalid ? 'Invalid' : adminPin ? 'Filled' : 'Default'}
          supportingText={adminPinInvalid ? t('admin.dialog.invalidPin') : undefined}
          secondaryActionLabel={t('checkout.cancel')}
          primaryActionLabel={t('home.accessAdminPanel')}
          primaryDisabled={adminPin.length < 4}
          onChange={(value) => {
            setAdminPinValue(value);
            setAdminPinInvalid(false);
          }}
          onSecondaryAction={() => setAdminAccessOpen(false)}
          onPrimaryAction={accessAdminPanel}
        />
      </OverlaySurface>
    </div>
  );
}

HomePage.displayName = 'HomePage';
