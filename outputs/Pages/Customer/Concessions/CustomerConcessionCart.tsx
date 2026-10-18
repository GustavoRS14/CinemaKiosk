import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ActionDialog } from '@components/Overlays/Dialog/ActionDialog';
import { OverlaySurface } from '@components/Overlays/OverlaySurface';
import {
  ConcessionCartSlideOver,
  type ConcessionCartItem,
} from '@components/Overlays/SlideOver/ConcessionCartSlideOver';
import { Button } from '@components/Common/Button';
import { FAB } from '@components/Common/FAB';
import type { PageOrientation } from '../../useOrientation';
import {
  ALL_CONCESSION_PRODUCTS,
  CONCESSION_CATEGORIES,
  CONCESSION_PRODUCTS,
  formatConcessionPrice,
} from './concessionsCatalog';
import { useConcessionsCart } from './useConcessionsCart';
import './CustomerConcessionCart.css';
import { useFeaturePreferences } from '../../featurePreferences';
import { useI18n } from '../../../i18n';
import { CUSTOMER_FLOW_RESET_EVENT } from '../customerFlowReset';

type ConcessionsCartState = ReturnType<typeof useConcessionsCart>;

export type CustomerConcessionCartProps = {
  orientation: PageOrientation;
  cart?: ConcessionsCartState;
  onPay?: () => void;
  showPayButton?: boolean;
  orderBreakdown?: { ticketCount: number; ticketTotal: number };
};

const categoryByProductId = new Map(
  CONCESSION_CATEGORIES.flatMap((category) => (
    CONCESSION_PRODUCTS[category.id].map((product) => [product.id, category.label] as const)
  )),
);

function buildCartItems(quantities: Record<string, number>, discountedPrices: Record<string, number>, personalized: boolean): ConcessionCartItem[] {
  return ALL_CONCESSION_PRODUCTS
    .filter((product) => (quantities[product.id] ?? 0) > 0)
    .map((product) => ({
      id: product.id,
      category: categoryByProductId.get(product.id) ?? '',
      productName: product.title,
      price: formatConcessionPrice(product.price),
      imageUrl: product.imageUrl,
      quantity: quantities[product.id],
      flowType: personalized ? 'Personalized' : 'Express',
    }));
}

export function CustomerConcessionCart({ orientation, cart: providedCart, onPay, showPayButton = true, orderBreakdown }: CustomerConcessionCartProps) {
  const { t } = useI18n();
  const { productCustomization } = useFeaturePreferences();
  const internalCart = useConcessionsCart();
  const navigate = useNavigate();
  const location = useLocation();
  const cart = providedCart ?? internalCart;
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);
  const [cartSnapshot, setCartSnapshot] = useState<ConcessionCartItem[]>([]);
  const [cartRevision, setCartRevision] = useState(0);
  const currentCartItems = useMemo(
    () => buildCartItems(cart.quantities, cart.discountedPrices, productCustomization),
    [cart.discountedPrices, cart.quantities, productCustomization],
  );
  const showCartActions = cart.totalItems > 0 || Boolean(cart.notification);
  const comboOfferDiscount = useMemo(() => ALL_CONCESSION_PRODUCTS.reduce((total, product) => {
    const offeredPrice = cart.discountedPrices[product.id];
    const quantity = cart.quantities[product.id] ?? 0;
    return offeredPrice === undefined
      ? total
      : total + Math.max(0, product.price - offeredPrice) * quantity;
  }, 0), [cart.discountedPrices, cart.quantities]);
  const goToStandaloneCheckout = () => navigate('/purchase/movies/checkout', {
    state: {
      orderContents: 'ConcessionsOnly',
      returnPath: `${location.pathname}${location.search}`,
    },
  });

  useEffect(() => {
    const resetCartOverlay = () => {
      setIsCartOpen(false);
      setIsClearConfirmationOpen(false);
      setCartSnapshot([]);
      setCartRevision((current) => current + 1);
    };
    window.addEventListener(CUSTOMER_FLOW_RESET_EVENT, resetCartOverlay);
    return () => window.removeEventListener(CUSTOMER_FLOW_RESET_EVENT, resetCartOverlay);
  }, []);

  const openCart = () => {
    setCartSnapshot(currentCartItems);
    setCartRevision((current) => current + 1);
    setIsCartOpen(true);
  };

  const updateCartItems = (items: ConcessionCartItem[]) => {
    cart.replaceQuantities(Object.fromEntries(items.map((item) => [item.id, item.quantity ?? 0])));
  };

  const confirmClearCart = () => {
    cart.clearCart();
    setCartSnapshot([]);
    setCartRevision((current) => current + 1);
    setIsClearConfirmationOpen(false);
  };

  return (
    <>
      {showCartActions && (
        <aside
          className={`customer-concession-cart-actions customer-concession-cart-actions--${orientation}`}
          aria-label={t('concessions.cartAria')}
        >
          {showPayButton && cart.totalItems > 0 && !cart.notification && (
            <Button
              intent="primary"
              variant="solid"
              radius="xl"
              label={t('concessions.payOrder')}
              secondaryLabel={`R$ ${formatConcessionPrice(cart.totalPrice)}`}
              showSecondaryLabel
              showLeftIcon={false}
              showRightIcon={false}
              onClick={onPay ?? openCart}
            />
          )}
          <FAB
            status={cart.totalItems > 0 ? 'With Product' : 'Empty'}
            quantity={cart.totalItems}
            itemNotification={Boolean(cart.notification)}
            notificationKey={cart.notification?.id}
            notificationBadge={cart.notification?.badge}
            notificationImageUrl={cart.notification?.product.imageUrl}
            notificationProductName={cart.notification?.product.title}
            notificationPrice={cart.notification ? formatConcessionPrice(cart.notification.product.price) : undefined}
            notificationQuantity="1"
            onNotificationDismiss={cart.dismissNotification}
            onNotificationUndo={cart.undoRemoval}
            onClick={openCart}
          />
        </aside>
      )}

      <OverlaySurface
        open={isCartOpen}
        kind="slideover"
        orientation={orientation}
        onClose={() => setIsCartOpen(false)}
      >
        <ConcessionCartSlideOver
          key={cartRevision}
          items={cartSnapshot}
          maxItems={cart.maxItems}
          showDiscount={comboOfferDiscount > 0}
          discountLabel={t('cart.comboOffer')}
          discountPrice={formatConcessionPrice(comboOfferDiscount)}
          ticketCount={orderBreakdown?.ticketCount}
          ticketSubtotal={orderBreakdown ? formatConcessionPrice(orderBreakdown.ticketTotal) : undefined}
          onItemsChange={updateCartItems}
          onRequestClearCart={() => setIsClearConfirmationOpen(true)}
          onPay={() => {
            setIsCartOpen(false);
            if (onPay) onPay();
            else goToStandaloneCheckout();
          }}
          onClose={() => setIsCartOpen(false)}
        />
      </OverlaySurface>

      <OverlaySurface
        open={isClearConfirmationOpen}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => setIsClearConfirmationOpen(false)}
        className="customer-concession-cart-clear-dialog"
      >
        <ActionDialog
          size="md"
          showModalHeader={false}
          modalHeaderText=""
          title={t('concessions.clearCartTitle')}
          description={t('concessions.clearCartDescription')}
          secondaryActionLabel={t('concessions.clearCart')}
          primaryActionLabel={t('concessions.keepCart')}
          onSecondaryAction={confirmClearCart}
          onPrimaryAction={() => setIsClearConfirmationOpen(false)}
          onClose={() => setIsClearConfirmationOpen(false)}
        />
      </OverlaySurface>
    </>
  );
}
