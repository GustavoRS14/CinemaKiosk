import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AccessibilityIcon from '@icons/accessibility.svg';
import HomeIcon from '@icons/home.svg';
import MoviesIcon from '@icons/video.svg';
import PopcornIcon from '@icons/popcorn.svg';
import AOdisseiaPoster from '@images/a-odisseia-1.png';
import ToyStoryPoster from '@images/toy-story-5-1.png';
import MoanaPoster from '@images/moana-1.png';
import MinionsPoster from '@images/minions-monstros-1.png';
import AguasMortaisPoster from '@images/aguas-mortais-1.png';
import { ConcessionCard } from '@components/Common/ConcessionCard';
import { ConcessionsTab } from '@components/Common/ConcessionsTab';
import { PageLoadingScreen, usePageLoadingScreen } from '@components/Common/PageLoadingScreen';
import { Header } from '@components/Layout/Header';
import { Navbar } from '@components/Layout/Navbar';
import { NavbarButton } from '@components/Layout/Navbar/NavbarButton';
import { useOrientation } from '../../../useOrientation';
import { useI18n, type TranslationKey } from '../../../../i18n';
import { CustomerAccessibilityOverlay } from '../../CustomerAccessibilityOverlay';
import {
  CONCESSION_CATEGORIES,
  CONCESSION_PRODUCTS,
  formatConcessionPrice,
  type ConcessionCategoryId,
  type ConcessionProduct,
} from '../concessionsCatalog';
import { useConcessionsCart } from '../useConcessionsCart';
import { CustomerConcessionCart } from '../CustomerConcessionCart';
import { useConcessionOfferFlow } from '../useConcessionOfferFlow';
import { OverlaySurface } from '@components/Overlays/OverlaySurface';
import {
  OrderFulfillmentDialog,
  type OrderFulfillmentDetails,
  type OrderFulfillmentMethod,
  type OrderFulfillmentStep,
} from '@components/Overlays/Dialog/OrderFulfillmentDialog';
import {
  MovieSessionSelectionSlideOver,
  type MovieSelectionOption,
  type ShowtimeSelectionGroup,
} from '@components/Overlays/SlideOver/MovieSessionSelectionSlideOver';
import { KeyboardDialog } from '@components/Overlays/KeyboardDialog';
import { requestCustomerHomeExit } from '@components/Overlays/CustomerHomeExitDialog';
import {
  formatSeatDeliveryEstimate,
  isSeatDeliveryAvailable,
  isSeatDeliveryConfigured,
  type DeliveryRoomType,
} from '../../../deliveryPreferences';
import './ConcessionsPage.css';
import { useFeaturePreferences } from '../../../featurePreferences';
import { ProductCustomizationSlideOver } from '@components/Overlays/SlideOver/ProductCustomizationSlideOver';
import { CUSTOMER_FLOW_RESET_EVENT } from '../../customerFlowReset';

const icon = (Icon: ComponentType) => <Icon />;
const categoryKey = (id: ConcessionCategoryId): TranslationKey => `concessions.category.${id}`;

export type ConcessionsPageProps = {
  deliveryCatalog?: DeliveryCatalogMovie[];
  purchaseDate?: Date;
  isHoliday?: boolean;
};

export type DeliveryCatalogSession = {
  id: string;
  time: string;
  roomType: DeliveryRoomType;
  language?: string;
  date?: string;
  availableSeats?: readonly string[];
};

export type DeliveryCatalogMovie = {
  id: string;
  title: string;
  supportingText: string;
  posterUrl: string;
  sessions: DeliveryCatalogSession[];
};

const DEFAULT_DELIVERY_CATALOG: DeliveryCatalogMovie[] = [
  { id: 'odyssey', title: 'A Odisseia', supportingText: 'Ação | 18 Anos', posterUrl: AOdisseiaPoster, sessions: [
    { id: 'odyssey-1000-2d', time: '10:00', roomType: '2D', language: 'Dub' },
    { id: 'odyssey-1930-vip', time: '19:30', roomType: 'VIP', language: 'Leg' },
  ] },
  { id: 'toy-story', title: 'Toy Story 5', supportingText: 'Animação | 6 Anos', posterUrl: ToyStoryPoster, sessions: [
    { id: 'toy-story-1400-2d', time: '14:00', roomType: '2D', language: 'Dub' },
    { id: 'toy-story-1600-azul', time: '16:00', roomType: 'Azul', language: 'Dub' },
  ] },
  { id: 'moana', title: 'Moana', supportingText: 'Aventura | 10 Anos', posterUrl: MoanaPoster, sessions: [
    { id: 'moana-1930-3d', time: '19:30', roomType: '3D', language: 'Dub' },
    { id: 'moana-2200-vip', time: '22:00', roomType: 'VIP', language: 'Dub' },
  ] },
  { id: 'minions', title: 'Minions & Monstros', supportingText: 'Animação | 10 Anos', posterUrl: MinionsPoster, sessions: [
    { id: 'minions-2000-laser', time: '20:00', roomType: 'Laser', language: 'Dub' },
    { id: 'minions-2230-3d', time: '22:30', roomType: '3D', language: 'Leg' },
  ] },
  { id: 'deadly-waters', title: 'Águas Mortais', supportingText: 'Suspense | 16 Anos', posterUrl: AguasMortaisPoster, sessions: [
    { id: 'deadly-waters-2100-2d', time: '21:00', roomType: '2D', language: 'Dub' },
  ] },
];

const EMPTY_FULFILLMENT_DETAILS: OrderFulfillmentDetails = { movie: '', session: '', recipientName: '', seat: '' };
const DEFAULT_AVAILABLE_SEATS = Array.from({ length: 10 }, (_, row) =>
  Array.from({ length: 20 }, (_, seat) => `${String.fromCharCode(65 + row)}${seat + 1}`),
).flat();
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function ConcessionsPage({
  deliveryCatalog = DEFAULT_DELIVERY_CATALOG,
  purchaseDate = new Date(),
  isHoliday = false,
}: ConcessionsPageProps) {
  const isPageLoading = usePageLoadingScreen();
  const orientation = useOrientation();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { productCustomization } = useFeaturePreferences();
  const [selectedCategory, setSelectedCategory] = useState<ConcessionCategoryId>('combos');
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [fulfillmentOpen, setFulfillmentOpen] = useState(false);
  const [fulfillmentStep, setFulfillmentStep] = useState<OrderFulfillmentStep>('method');
  const [fulfillmentMethod, setFulfillmentMethod] = useState<OrderFulfillmentMethod>();
  const [fulfillmentDetails, setFulfillmentDetails] = useState<OrderFulfillmentDetails>(EMPTY_FULFILLMENT_DETAILS);
  const [selectionPanel, setSelectionPanel] = useState<'movie' | 'showtime' | null>(null);
  const [pendingSelection, setPendingSelection] = useState('');
  const [keyboardField, setKeyboardField] = useState<'recipientName' | 'seat' | 'search' | null>(null);
  const [keyboardValue, setKeyboardValue] = useState('');
  const [keyboardError, setKeyboardError] = useState(false);
  const [movieSearchValue, setMovieSearchValue] = useState('');
  const [customizationProduct, setCustomizationProduct] = useState<ConcessionProduct | null>(null);
  const [customizationPrice, setCustomizationPrice] = useState<number>();
  const cart = useConcessionsCart();
  const {
    quantities,
    discountedPrices,
    notification,
    totalItems,
    totalPrice,
    changeAmount,
    dismissNotification,
    undoRemoval,
    replaceQuantities,
    clearCart,
  } = cart;

  useEffect(() => {
    const resetPageState = () => {
      setSelectedCategory('combos');
      setIsAccessibilityOpen(false);
      setFulfillmentOpen(false);
      setFulfillmentStep('method');
      setFulfillmentMethod(undefined);
      setFulfillmentDetails(EMPTY_FULFILLMENT_DETAILS);
      setSelectionPanel(null);
      setPendingSelection('');
      setKeyboardField(null);
      setKeyboardValue('');
      setKeyboardError(false);
      setMovieSearchValue('');
      setCustomizationProduct(null);
      setCustomizationPrice(undefined);
    };
    window.addEventListener(CUSTOMER_FLOW_RESET_EVENT, resetPageState);
    return () => window.removeEventListener(CUSTOMER_FLOW_RESET_EVENT, resetPageState);
  }, []);
  const goToCheckout = (method?: OrderFulfillmentMethod, details?: OrderFulfillmentDetails) => {
    navigate('/purchase/movies/checkout', {
      state: {
        orderContents: 'ConcessionsOnly',
        fulfillmentMethod: method,
        fulfillmentDetails: details,
        deliveryEstimate: method === 'seat-delivery' ? fulfillmentDeliveryEstimate : undefined,
        returnPath: `${location.pathname}${location.search}`,
      },
    });
  };
  const requestFulfillment = () => {
    if (totalItems > 0 && isSeatDeliveryConfigured('standalone')) {
      setFulfillmentStep('method');
      setFulfillmentMethod(undefined);
      setFulfillmentDetails(EMPTY_FULFILLMENT_DETAILS);
      setFulfillmentOpen(true);
      return;
    }
    goToCheckout();
  };
  const { requestAmountChange, requestCheckout, offerOverlay } = useConcessionOfferFlow({
    cart,
    orientation,
    onCheckout: requestFulfillment,
    onCustomizeProduct: productCustomization ? (product, offeredPrice) => {
      setCustomizationProduct(product);
      setCustomizationPrice(offeredPrice);
    } : undefined,
  });
  const products = CONCESSION_PRODUCTS[selectedCategory];
  const showCartActions = totalItems > 0 || Boolean(notification);
  const currentDateKey = dateKey(purchaseDate);
  const sessionIsEligible = (session: DeliveryCatalogSession) => (
    (!session.date || session.date === currentDateKey)
    && isSeatDeliveryAvailable({
      purchaseType: 'standalone',
      roomType: session.roomType,
      date: purchaseDate,
      isHoliday,
    })
  );
  const eligibleMovies = useMemo(
    () => deliveryCatalog.filter((movie) => movie.sessions.some(sessionIsEligible)),
    [deliveryCatalog, currentDateKey, isHoliday],
  );
  const selectedMovie = eligibleMovies.find((movie) => movie.id === fulfillmentDetails.movie);
  const eligibleSessions = selectedMovie?.sessions.filter(sessionIsEligible) ?? [];
  const fulfillmentDeliveryEstimate = useMemo(
    () => fulfillmentDetails.session ? formatSeatDeliveryEstimate() : '',
    [fulfillmentDetails.session],
  );
  const movieOptions: MovieSelectionOption[] = eligibleMovies.map(({ id, title, supportingText, posterUrl }) => ({ id, title, supportingText, posterUrl }));
  const fulfillmentMovieOptions = eligibleMovies.map(({ id, title }) => ({ value: id, label: title }));
  const fulfillmentSessionOptions = eligibleSessions.map(({ id, time }) => ({ value: id, label: time }));
  const showtimeGroups: ShowtimeSelectionGroup[] = Object.values(eligibleSessions.reduce<Record<string, ShowtimeSelectionGroup>>((groups, session) => {
    const groupId = `${session.language ?? 'Dub'}-${session.roomType}`;
    groups[groupId] ??= {
      id: groupId,
      tags: [
        { text: session.language ?? 'Dub', status: 'Brand' },
        { text: session.roomType, status: 'Information' },
      ],
      times: [],
    };
    groups[groupId].times.push(session.time);
    return groups;
  }, {}));

  const openKeyboard = (field: 'recipientName' | 'seat' | 'search') => {
    setKeyboardError(false);
    setKeyboardField(field);
    setKeyboardValue(field === 'search' ? movieSearchValue : fulfillmentDetails[field]);
  };

  return (
    <div className={`concessions-page concessions-page--${orientation}${showCartActions ? ' concessions-page--has-cart-actions' : ''}${isPageLoading ? ' page-loading-active' : ''}`}>
      <Header
        context="Customer"
        type="Default"
        autoOpenIdentityPrompt
        onInitialModalAccessibility={() => setIsAccessibilityOpen(true)}
        initialModalAccessibilityOpen={isAccessibilityOpen}
      />
      <PageLoadingScreen active={isPageLoading} modalAbove />

      <div className="concessions-page__shell">
        <Navbar className="concessions-page__navbar" orientation={orientation}>
          <NavbarButton label={t('navigation.home')} icon={icon(HomeIcon)} selected={false} onClick={requestCustomerHomeExit} />
          <NavbarButton label={t('navigation.movies')} icon={icon(MoviesIcon)} selected={false} onClick={() => navigate('/movies')} />
          <NavbarButton
            label={t('navigation.concessions')}
            icon={icon(PopcornIcon)}
            selected
            onClick={() => navigate('/concessions')}
          />
          <NavbarButton
            label={t('navigation.accessibility')}
            icon={icon(AccessibilityIcon)}
            variant="Accessibility"
            onClick={() => setIsAccessibilityOpen(true)}
          />
        </Navbar>

        <main className="concessions-page__main">
          <section className="concessions-page__content" aria-label={t('concessions.productsAria')}>
            <nav className="concessions-page__categories" aria-label={t('concessions.categoriesAria')}>
              {CONCESSION_CATEGORIES.map((category) => (
                <ConcessionsTab
                  key={category.id}
                  category={t(categoryKey(category.id))}
                  imageUrl={category.imageUrl}
                  selected={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                />
              ))}
            </nav>

            <div className="concessions-page__products" aria-live="polite">
              {products.map((product) => (
                <ConcessionCard
                  key={product.id}
                  flowType={productCustomization ? 'Personalized' : 'Express'}
                  title={product.title}
                  price={formatConcessionPrice(product.price)}
                  imageUrl={product.imageUrl}
                  imageUrls={product.imageUrls}
                  amount={quantities[product.id] ?? 0}
                  maxAmount={cart.maxItems}
                  cartLimitReached={totalItems >= cart.maxItems}
                  onAmountChange={(amount) => requestAmountChange(product, amount)}
                  onClick={productCustomization ? () => requestAmountChange(product, (quantities[product.id] ?? 0) + 1) : undefined}
                />
              ))}
            </div>
          </section>
        </main>
      </div>

      <CustomerConcessionCart
        orientation={orientation}
        onPay={requestCheckout}
        cart={{
          quantities,
          discountedPrices,
          notification,
          totalItems,
          totalPrice,
          maxItems: cart.maxItems,
          changeAmount,
          dismissNotification,
          undoRemoval,
          replaceQuantities,
          clearCart,
        }}
      />

      {offerOverlay}

      <OverlaySurface
        open={customizationProduct !== null}
        kind="slideover"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => setCustomizationProduct(null)}
      >
        {customizationProduct && (
          <ProductCustomizationSlideOver
            productName={customizationProduct.title}
            productImageSrc={customizationProduct.imageUrl}
            basePrice={customizationPrice ?? customizationProduct.price}
            groups={customizationProduct.customizationGroups}
            onClose={() => setCustomizationProduct(null)}
            onAddItem={({ quantity, total }) => {
              changeAmount(
                customizationProduct,
                (quantities[customizationProduct.id] ?? 0) + quantity,
                total / quantity,
              );
              setCustomizationProduct(null);
              setCustomizationPrice(undefined);
            }}
          />
        )}
      </OverlaySurface>

      <OverlaySurface
        open={fulfillmentOpen}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        closeOnEscape={false}
        onClose={() => setFulfillmentOpen(false)}
      >
        <OrderFulfillmentDialog
          step={fulfillmentStep}
          selectedMethod={fulfillmentMethod}
          details={fulfillmentDetails}
          movies={fulfillmentMovieOptions}
          sessions={fulfillmentSessionOptions}
          deliveryEstimate={fulfillmentDeliveryEstimate}
          seatDeliveryEnabled
          onDetailsChange={setFulfillmentDetails}
          onMovieFieldClick={() => {
            setPendingSelection(fulfillmentDetails.movie);
            setSelectionPanel('movie');
          }}
          onSessionFieldClick={() => {
            const session = eligibleSessions.find((item) => item.id === fulfillmentDetails.session);
            setPendingSelection(session
              ? `${session.language ?? 'Dub'}-${session.roomType}-${session.time}`
              : '');
            setSelectionPanel('showtime');
          }}
          onRecipientFieldClick={() => openKeyboard('recipientName')}
          onSeatFieldClick={() => openKeyboard('seat')}
          onStepChange={setFulfillmentStep}
          onMethodChange={setFulfillmentMethod}
          onBack={() => fulfillmentStep === 'method' && setFulfillmentOpen(false)}
          onSubmit={(method, details) => goToCheckout(method, details)}
        />
      </OverlaySurface>

      <OverlaySurface
        open={selectionPanel !== null}
        kind="slideover"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => setSelectionPanel(null)}
      >
        <MovieSessionSelectionSlideOver
          type={selectionPanel ?? 'movie'}
          width="sm"
          movies={movieOptions}
          showtimeGroups={showtimeGroups}
          searchValue={movieSearchValue}
          selectedId={pendingSelection}
          onSearchChange={setMovieSearchValue}
          onSearchFieldClick={selectionPanel === 'movie' ? () => openKeyboard('search') : undefined}
          onSelectionChange={setPendingSelection}
          onClose={() => setSelectionPanel(null)}
          onConfirm={(id) => {
            if (selectionPanel === 'movie') {
              setFulfillmentDetails((current) => ({ ...current, movie: id, session: '', recipientName: '', seat: '' }));
            } else {
              const chosenGroup = showtimeGroups.find((group) => group.times.some((time) => `${group.id}-${time}` === id));
              const chosenTime = chosenGroup?.times.find((time) => `${chosenGroup.id}-${time}` === id);
              const chosenSession = eligibleSessions.find((session) => session.time === chosenTime
                && `${session.language ?? 'Dub'}-${session.roomType}` === chosenGroup?.id);
              if (chosenSession) setFulfillmentDetails((current) => ({ ...current, session: chosenSession.id, recipientName: '', seat: '' }));
            }
            setSelectionPanel(null);
          }}
        />
      </OverlaySurface>

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
          inputPlaceholder={keyboardField === 'seat' ? t('concessions.seat') : keyboardField === 'search' ? t('concessions.searchMovie') : t('concessions.name')}
          value={keyboardValue}
          inputState={keyboardError ? 'Invalid' : keyboardValue.trim() ? 'Filled' : 'Default'}
          supportingText={keyboardError ? t('concessions.invalidSeat') : undefined}
          primaryActionLabel={keyboardField === 'search' ? t('concessions.search') : t('concessions.confirm')}
          secondaryActionLabel={t('checkout.cancel')}
          primaryDisabled={!keyboardValue.trim()}
          onChange={(value) => {
            setKeyboardValue(value);
            setKeyboardError(false);
          }}
          onSecondaryAction={() => setKeyboardField(null)}
          onPrimaryAction={() => {
            if (keyboardField === 'search') {
              setMovieSearchValue(keyboardValue);
            } else if (keyboardField) {
              if (keyboardField === 'seat') {
                const normalizedSeat = keyboardValue.trim().toUpperCase();
                const selectedSession = eligibleSessions.find((session) => session.id === fulfillmentDetails.session);
                const validSeats = selectedSession?.availableSeats ?? DEFAULT_AVAILABLE_SEATS;
                if (!validSeats.some((seat) => seat.trim().toUpperCase() === normalizedSeat)) {
                  setKeyboardError(true);
                  return;
                }
              }
              setFulfillmentDetails((current) => ({
                ...current,
                [keyboardField]: keyboardField === 'seat' ? keyboardValue.trim().toUpperCase() : keyboardValue,
              }));
            }
            setKeyboardField(null);
          }}
        />
      </OverlaySurface>

      <CustomerAccessibilityOverlay
        open={isAccessibilityOpen}
        orientation={orientation}
        onClose={() => setIsAccessibilityOpen(false)}
      />
    </div>
  );
}
