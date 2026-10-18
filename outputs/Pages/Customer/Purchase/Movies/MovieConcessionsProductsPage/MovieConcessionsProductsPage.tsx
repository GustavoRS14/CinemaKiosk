import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConcessionCard } from '@components/Common/ConcessionCard';
import { ConcessionsTab } from '@components/Common/ConcessionsTab';
import { PageLoadingScreen, usePageLoadingScreen } from '@components/Common/PageLoadingScreen';
import { Footer } from '@components/Layout/Footer/Footer';
import { PurchaseHeader } from '../../PurchaseHeader';
import {
  PurchaseSessionClosingAlert,
  useSalesClosingCountdown,
} from '../../PurchaseSessionClosingAlert';
import { useOrientation } from '../../../../useOrientation';
import { useI18n, type TranslationKey } from '../../../../../i18n';
import {
  CONCESSION_CATEGORIES,
  CONCESSION_PRODUCTS,
  formatConcessionPrice,
  type ConcessionCategoryId,
  type ConcessionProduct,
} from '../../../Concessions/concessionsCatalog';
import { useConcessionsCart } from '../../../Concessions/useConcessionsCart';
import { useConcessionOfferFlow } from '../../../Concessions/useConcessionOfferFlow';
import { OverlaySurface } from '@components/Overlays/OverlaySurface';
import {
  OrderFulfillmentDialog,
  type OrderFulfillmentMethod,
} from '@components/Overlays/Dialog/OrderFulfillmentDialog';
import {
  formatSeatDeliveryEstimate,
  isSeatDeliveryAvailable,
  type DeliveryRoomType,
} from '../../../../deliveryPreferences';
import './MovieConcessionsProductsPage.css';
import { useFeaturePreferences } from '../../../../featurePreferences';
import { ProductCustomizationSlideOver } from '@components/Overlays/SlideOver/ProductCustomizationSlideOver';
import { CustomerConcessionCart } from '../../../Concessions/CustomerConcessionCart';
import { CUSTOMER_FLOW_RESET_EVENT } from '../../../customerFlowReset';
import { getMovieTicketCount, getMovieTicketTotal } from '../moviePurchaseTotal';

const categoryKey = (id: ConcessionCategoryId): TranslationKey => `concessions.category.${id}`;

export type MovieConcessionsProductsPageProps = {
  sessionStartTime?: string;
  showtimeDate?: Date | string;
  salesCutoffMinutes?: number;
  availableSeats?: number;
  movieDetailsPath?: string;
  onViewNextShowtimes?: () => void;
  sessionType?: DeliveryRoomType;
  isHoliday?: boolean;
};

export function MovieConcessionsProductsPage({
  sessionStartTime,
  showtimeDate,
  salesCutoffMinutes,
  availableSeats,
  movieDetailsPath,
  onViewNextShowtimes,
  sessionType = '2D',
  isHoliday = false,
}: MovieConcessionsProductsPageProps) {
  const isPageLoading = usePageLoadingScreen();
  const orientation = useOrientation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { productCustomization } = useFeaturePreferences();
  const [selectedCategory, setSelectedCategory] = useState<ConcessionCategoryId>('combos');
  const [fulfillmentOpen, setFulfillmentOpen] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<OrderFulfillmentMethod>();
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  const [customizationProduct, setCustomizationProduct] = useState<ConcessionProduct | null>(null);
  const [customizationPrice, setCustomizationPrice] = useState<number>();
  const cart = useConcessionsCart();
  const {
    quantities,
    notification,
    totalItems,
    totalPrice: concessionsTotal,
    changeAmount,
  } = cart;
  const goToCheckout = (method?: OrderFulfillmentMethod) => {
    navigate('/purchase/movies/checkout', {
      state: {
        orderContents: totalItems > 0 ? 'TicketsAndConcessions' : 'TicketsOnly',
        fulfillmentMethod: method,
        deliveryEstimate: method === 'seat-delivery' ? deliveryEstimate : undefined,
      },
    });
  };
  const requestFulfillment = () => {
    if (totalItems > 0 && isSeatDeliveryAvailable({
      purchaseType: 'combined',
      roomType: sessionType,
      date: showtimeDate ? new Date(showtimeDate) : new Date(),
      isHoliday,
    })) {
      setFulfillmentMethod(undefined);
      setDeliveryEstimate(formatSeatDeliveryEstimate());
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
  const ticketTotal = getMovieTicketTotal(70);
  const ticketCount = getMovieTicketCount();

  const totalPrice = useMemo(
    () => ticketTotal + concessionsTotal,
    [concessionsTotal, ticketTotal],
  );
  const showCartActions = totalItems > 0 || Boolean(notification);
  const remainingSalesMinutes = useSalesClosingCountdown(sessionStartTime ? {
    time: sessionStartTime,
    showtimeDate,
    salesCutoffMinutes,
  } : undefined);

  useEffect(() => {
    const resetPageState = () => {
      setSelectedCategory('combos');
      setFulfillmentOpen(false);
      setFulfillmentMethod(undefined);
      setDeliveryEstimate('');
      setCustomizationProduct(null);
      setCustomizationPrice(undefined);
    };
    window.addEventListener(CUSTOMER_FLOW_RESET_EVENT, resetPageState);
    return () => window.removeEventListener(CUSTOMER_FLOW_RESET_EVENT, resetPageState);
  }, []);

  return (
    <div data-purchase-page className={`movie-concessions-products-page movie-concessions-products-page--${orientation}${showCartActions ? ' movie-concessions-products-page--has-cart-actions' : ''}${remainingSalesMinutes !== null ? ' movie-concessions-products-page--sales-closing' : ''}${isPageLoading ? ' page-loading-active' : ''}`}>
      <PurchaseHeader
        orientation={orientation}
        sessionStartTime={sessionStartTime}
        showtimeDate={showtimeDate}
        salesCutoffMinutes={salesCutoffMinutes}
        availableSeats={availableSeats}
        movieDetailsPath={movieDetailsPath}
        onViewNextShowtimes={onViewNextShowtimes}
      />
      <PageLoadingScreen active={isPageLoading} />

      <main className="movie-concessions-products-page__main">
        <section className="movie-concessions-products-page__content" aria-label={t('concessions.productsAria')}>
          <nav className="movie-concessions-products-page__categories" aria-label={t('concessions.categoriesAria')}>
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

          <div className="movie-concessions-products-page__products" aria-live="polite">
            {products.map((product) => (
              <ConcessionCard
                key={product.id}
                className={[
                  product.id.includes('combo') ? 'movie-concessions-products-page__product--wide-canvas' : '',
                  product.id === 'small-combo' ? 'movie-concessions-products-page__product--small-combo' : '',
                ].filter(Boolean).join(' ')}
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

        {remainingSalesMinutes !== null && (
          <PurchaseSessionClosingAlert remainingMinutes={remainingSalesMinutes} />
        )}
      </main>

      <CustomerConcessionCart
        orientation={orientation}
        cart={cart}
        onPay={requestCheckout}
        showPayButton={false}
        orderBreakdown={{ ticketCount, ticketTotal }}
      />

      <Footer
        showCenterAction={false}
        price={formatConcessionPrice(totalPrice)}
        mainCtaLabel={t('concessions.payOrder')}
        onMainAction={requestCheckout}
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
          selectedMethod={fulfillmentMethod}
          deliveryEstimate={deliveryEstimate}
          seatDeliveryRequiresDetails={false}
          seatDeliveryEnabled={isSeatDeliveryAvailable({
            purchaseType: 'combined',
            roomType: sessionType,
            date: showtimeDate ? new Date(showtimeDate) : new Date(),
            isHoliday,
          })}
          onMethodChange={setFulfillmentMethod}
          onBack={() => setFulfillmentOpen(false)}
          onSubmit={(method) => goToCheckout(method)}
        />
      </OverlaySurface>
    </div>
  );
}

