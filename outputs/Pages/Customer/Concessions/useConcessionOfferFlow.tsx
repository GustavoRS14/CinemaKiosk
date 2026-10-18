import { useEffect, useState } from 'react';

import { OfferDialog, type OfferDialogVariant, type OfferProduct } from '@components/Overlays/OfferDialog';
import { OverlaySurface } from '@components/Overlays/OverlaySurface';
import { useFeaturePreferences } from '../../featurePreferences';
import type { PageOrientation } from '../../useOrientation';
import {
  ALL_CONCESSION_PRODUCTS,
  CONCESSION_PRODUCTS,
  type ConcessionCategoryId,
  type ConcessionProduct,
} from './concessionsCatalog';
import type { useConcessionsCart } from './useConcessionsCart';

type Cart = ReturnType<typeof useConcessionsCart>;
type PendingOffer = {
  variant: OfferDialogVariant;
  selected: ConcessionProduct;
  suggested: ConcessionProduct;
  discountedPrice?: number;
  checkoutAfter?: boolean;
};

const OFFER_SHOWN_SESSION_KEY = 'totem-concession-offer-shown';
const PRE_CHECKOUT_OFFER_SHOWN_SESSION_KEY = 'totem-concession-pre-checkout-offer-shown';
const OFFER_RESET_EVENT = 'totem-concession-offer-reset';

export function resetConcessionOfferSession() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(OFFER_SHOWN_SESSION_KEY);
    window.sessionStorage.removeItem(PRE_CHECKOUT_OFFER_SHOWN_SESSION_KEY);
  } catch {
    // A new Home session still works when browser storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(OFFER_RESET_EVENT));
}

const categoryEntries = Object.entries(CONCESSION_PRODUCTS) as Array<[ConcessionCategoryId, ConcessionProduct[]]>;
const categoryFor = (product: ConcessionProduct) => categoryEntries.find(([, products]) => products.some(({ id }) => id === product.id))?.[0] ?? 'collectibles';
const offerCategory = (category: ConcessionCategoryId): OfferProduct['category'] => ({
  popcorn: 'popcorn', beverages: 'beverage', candy: 'candy', combos: 'combo', collectibles: 'collectible',
}[category] as OfferProduct['category']);
const upgradeLevels: Record<string, number> = {
  'popcorn-small': 1, 'popcorn-medium': 2, 'popcorn-large': 3,
  'drink-500': 1, 'drink-700': 2, 'drink-1000': 3, 'drink-refill-1000': 4,
};
const asOfferProduct = (product: ConcessionProduct): OfferProduct => ({
  id: product.id,
  name: product.title,
  image: product.imageUrl,
  price: product.price,
  category: offerCategory(categoryFor(product)),
  upgradeLevel: upgradeLevels[product.id],
});

const comboPairs: Record<string, { suggestedId: string; comboId: string }> = {
  'popcorn-small': { suggestedId: 'drink-500', comboId: 'small-combo' },
  'drink-500': { suggestedId: 'popcorn-small', comboId: 'small-combo' },
  'popcorn-medium': { suggestedId: 'drink-700', comboId: 'medium-combo' },
  'drink-700': { suggestedId: 'popcorn-medium', comboId: 'medium-combo' },
};

export function useConcessionOfferFlow({
  cart,
  orientation,
  onCheckout,
  onCustomizeProduct,
}: {
  cart: Cart;
  orientation: PageOrientation;
  onCheckout: () => void;
  onCustomizeProduct?: (product: ConcessionProduct, offeredUnitPrice?: number) => void;
}) {
  const { crossSellUpsell, productCustomization } = useFeaturePreferences();
  const [offer, setOffer] = useState<PendingOffer | null>(null);
  const [offerAlreadyShown, setOfferAlreadyShown] = useState(() => {
    try {
      return window.sessionStorage.getItem(OFFER_SHOWN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [preCheckoutOfferAlreadyShown, setPreCheckoutOfferAlreadyShown] = useState(() => {
    try {
      return window.sessionStorage.getItem(PRE_CHECKOUT_OFFER_SHOWN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const resetOffer = () => {
      setOffer(null);
      setOfferAlreadyShown(false);
      setPreCheckoutOfferAlreadyShown(false);
    };
    window.addEventListener(OFFER_RESET_EVENT, resetOffer);
    return () => window.removeEventListener(OFFER_RESET_EVENT, resetOffer);
  }, []);

  const showOffer = (nextOffer: PendingOffer) => {
    setOffer(nextOffer);
    const isPreCheckout = nextOffer.variant === 'pre-checkout';
    if (isPreCheckout) setPreCheckoutOfferAlreadyShown(true);
    else setOfferAlreadyShown(true);
    try {
      window.sessionStorage.setItem(
        isPreCheckout ? PRE_CHECKOUT_OFFER_SHOWN_SESSION_KEY : OFFER_SHOWN_SESSION_KEY,
        'true',
      );
    } catch {
      // The in-memory flag still enforces one offer for the active page session.
    }
  };

  const commitOriginal = (product: ConcessionProduct) => {
    if (onCustomizeProduct) {
      onCustomizeProduct(product);
      return;
    }
    cart.changeAmount(product, (cart.quantities[product.id] ?? 0) + 1);
  };

  const nextUpgrade = (product: ConcessionProduct) => {
    const level = upgradeLevels[product.id];
    if (!level) return undefined;
    const category = categoryFor(product);
    return CONCESSION_PRODUCTS[category].find((candidate) => upgradeLevels[candidate.id] === level + 1);
  };

  const crossSell = (product: ConcessionProduct) => {
    if (productCustomization) return undefined;
    const category = categoryFor(product);
    const forbidden = new Set<ConcessionCategoryId>([category]);
    if (category === 'combos') {
      forbidden.add('popcorn');
      forbidden.add('beverages');
    }
    return categoryEntries
      .filter(([candidateCategory]) => candidateCategory !== 'collectibles' && !forbidden.has(candidateCategory))
      .flatMap(([, products]) => products)
      .find((candidate) => !(cart.quantities[candidate.id] > 0));
  };

  const requestAmountChange = (product: ConcessionProduct, amount: number) => {
    const current = cart.quantities[product.id] ?? 0;
    if (!crossSellUpsell || offerAlreadyShown || amount <= current) {
      if (amount > current && onCustomizeProduct) onCustomizeProduct(product);
      else cart.changeAmount(product, amount);
      return;
    }

    const upgrade = nextUpgrade(product);
    const level = upgradeLevels[product.id];
    if (upgrade && level === 1) {
      showOffer({ variant: 'upgrade', selected: product, suggested: upgrade });
      return;
    }

    const pair = comboPairs[product.id];
    if (pair && cart.totalItems <= cart.maxItems - 2 && !(cart.quantities[pair.suggestedId] > 0)) {
      const suggested = ALL_CONCESSION_PRODUCTS.find(({ id }) => id === pair.suggestedId);
      const combo = ALL_CONCESSION_PRODUCTS.find(({ id }) => id === pair.comboId);
      if (suggested && combo) {
        showOffer({
          variant: 'combo-offer',
          selected: product,
          suggested,
          discountedPrice: Math.max(0, combo.price - product.price),
        });
        return;
      }
    }

    if (upgrade) {
      showOffer({ variant: 'upgrade', selected: product, suggested: upgrade });
      return;
    }

    const suggestion = cart.totalItems <= cart.maxItems - 2 ? crossSell(product) : undefined;
    if (suggestion) {
      showOffer({ variant: 'cross-sell', selected: product, suggested: suggestion });
      return;
    }
    commitOriginal(product);
  };

  const requestCheckout = () => {
    if (!crossSellUpsell || preCheckoutOfferAlreadyShown || cart.totalItems === 0 || cart.totalItems >= cart.maxItems) {
      onCheckout();
      return;
    }
    const occupiedCategories = new Set(
      ALL_CONCESSION_PRODUCTS
        .filter((product) => (cart.quantities[product.id] ?? 0) > 0)
        .map(categoryFor),
    );
    const suggestionFrom = (category: ConcessionCategoryId) => {
      if (category === 'collectibles' || occupiedCategories.has(category)) return undefined;
      return CONCESSION_PRODUCTS[category].find((product) => !(cart.quantities[product.id] > 0));
    };
    const coreCategories: ConcessionCategoryId[] = ['popcorn', 'beverages', 'combos'];
    const occupiedCoreCategories = coreCategories.filter((category) => occupiedCategories.has(category));

    let suggestion: ConcessionProduct | undefined;
    if (occupiedCategories.size === 1 && occupiedCategories.has('beverages')) {
      suggestion = suggestionFrom('popcorn');
    } else if (occupiedCategories.size === 1 && occupiedCategories.has('candy')) {
      suggestion = (['popcorn', 'beverages', 'combos'] as ConcessionCategoryId[])
        .map(suggestionFrom)
        .find(Boolean);
    } else if (occupiedCoreCategories.length >= 2) {
      suggestion = suggestionFrom('candy');
    } else {
      suggestion = categoryEntries
        .map(([category]) => suggestionFrom(category))
        .find(Boolean);
    }
    if (!suggestion) {
      onCheckout();
      return;
    }
    showOffer({ variant: 'pre-checkout', selected: suggestion, suggested: suggestion, checkoutAfter: true });
  };

  const dismiss = () => {
    if (!offer) return;
    if (offer.variant !== 'pre-checkout') commitOriginal(offer.selected);
    const checkoutAfter = offer.checkoutAfter;
    setOffer(null);
    if (checkoutAfter) onCheckout();
  };

  const confirm = () => {
    if (!offer) return;
    if (offer.variant === 'upgrade') {
      if (onCustomizeProduct) onCustomizeProduct(offer.suggested);
      else cart.changeAmount(offer.suggested, (cart.quantities[offer.suggested.id] ?? 0) + 1);
    } else if (offer.variant === 'combo-offer') {
      if (onCustomizeProduct) onCustomizeProduct(offer.suggested, offer.discountedPrice);
      else {
        commitOriginal(offer.selected);
        cart.changeAmount(
          offer.suggested,
          (cart.quantities[offer.suggested.id] ?? 0) + 1,
          offer.discountedPrice,
        );
      }
    } else {
      if (offer.variant !== 'pre-checkout' && !onCustomizeProduct) commitOriginal(offer.selected);
      if (onCustomizeProduct) onCustomizeProduct(offer.suggested);
      else cart.changeAmount(offer.suggested, (cart.quantities[offer.suggested.id] ?? 0) + 1);
    }
    const checkoutAfter = offer.checkoutAfter;
    setOffer(null);
    if (checkoutAfter) onCheckout();
  };

  const offerOverlay = (
    <OverlaySurface
      open={offer !== null}
      kind="modal"
      orientation={orientation}
      closeOnBackdrop={false}
      onClose={dismiss}
    >
      {offer && (
        <OfferDialog
          variant={offer.variant}
          size="md"
          product={asOfferProduct(offer.suggested)}
          selectedProduct={asOfferProduct(offer.selected)}
          upgradeOptions={CONCESSION_PRODUCTS[categoryFor(offer.selected)].map(asOfferProduct)}
          discountedPrice={offer.discountedPrice}
          onDismiss={dismiss}
          onConfirm={confirm}
        />
      )}
    </OverlaySurface>
  );

  return { requestAmountChange, requestCheckout, offerOverlay };
}
