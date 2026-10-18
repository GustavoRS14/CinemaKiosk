import { useMemo, useState } from 'react';

import { Button } from '../../Common/Button';
import { Counter } from '../../Common/Counter';
import { Tag } from '../../Common/Tag';
import { useI18n, type TranslationKey } from '../../../i18n';
import '../overlayDialog.css';
import './OfferDialog.css';

export type OfferDialogVariant = 'pre-checkout' | 'cross-sell' | 'upgrade' | 'combo-offer';
export type OfferProductCategory = 'candy' | 'popcorn' | 'beverage' | 'combo' | 'collectible' | 'other';
export type OfferDialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type OfferProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
  category: OfferProductCategory;
  /** Numeric order inside a size family. The next greater level is the upgrade offered. */
  upgradeLevel?: number;
};

export type OfferDialogProps = {
  variant?: OfferDialogVariant;
  product?: OfferProduct;
  /** Required by the upgrade variant when product is resolved from upgradeOptions. */
  selectedProduct?: OfferProduct;
  /** Products from the same size family, in any order. */
  upgradeOptions?: OfferProduct[];
  /** Final unit price offered by a combo promotion. */
  discountedPrice?: number;
  quantity?: number;
  defaultQuantity?: number;
  maxQuantity?: number;
  size?: OfferDialogSize;
  className?: string;
  onQuantityChange?: (quantity: number) => void;
  onDismiss?: () => void;
  onConfirm?: (product: OfferProduct, quantity: number) => void;
};

const fallbackProduct: OfferProduct = {
  id: 'diamante-negro',
  name: 'Diamante Negro',
  image: '',
  price: 160,
  category: 'candy',
};

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const categoryHeadingKeys: Record<OfferProductCategory, TranslationKey> = {
  candy: 'offer.candyTitle',
  popcorn: 'offer.popcornTitle',
  beverage: 'offer.beverageTitle',
  combo: 'offer.comboTitle',
  collectible: 'offer.collectibleTitle',
  other: 'offer.otherTitle',
};

export function getNextUpgradeSuggestion(
  selectedProduct: OfferProduct,
  options: OfferProduct[],
): OfferProduct | undefined {
  if (selectedProduct.upgradeLevel === undefined) return undefined;

  return [...options]
    .filter(
      (option) =>
        option.category === selectedProduct.category &&
        option.upgradeLevel !== undefined &&
        option.upgradeLevel > selectedProduct.upgradeLevel!,
    )
    .sort((a, b) => a.upgradeLevel! - b.upgradeLevel!)[0];
}

export function OfferDialog({
  variant = 'cross-sell',
  product,
  selectedProduct,
  upgradeOptions = [],
  discountedPrice,
  quantity,
  defaultQuantity = 1,
  maxQuantity = 10,
  size = 'md',
  className = '',
  onQuantityChange,
  onDismiss,
  onConfirm,
}: OfferDialogProps) {
  const { t } = useI18n();
  const suggestedUpgrade = useMemo(
    () => selectedProduct ? getNextUpgradeSuggestion(selectedProduct, upgradeOptions) : undefined,
    [selectedProduct, upgradeOptions],
  );
  const displayedProduct = product ?? suggestedUpgrade ?? fallbackProduct;
  const [internalQuantity, setInternalQuantity] = useState(defaultQuantity);
  const currentQuantity = quantity ?? internalQuantity;
  const isPreCheckout = variant === 'pre-checkout';
  const isComboOffer = variant === 'combo-offer';
  const isUpgrade = variant === 'upgrade';
  const offerPrice = isComboOffer
    ? Math.min(discountedPrice ?? displayedProduct.price, displayedProduct.price)
    : displayedProduct.price;
  const savings = Math.max(0, displayedProduct.price - offerPrice);
  const upgradeDifference = Math.max(
    0,
    displayedProduct.price - (selectedProduct?.price ?? displayedProduct.price),
  );

  const updateQuantity = (nextQuantity: number) => {
    const normalized = Math.min(maxQuantity, Math.max(1, nextQuantity));
    if (quantity === undefined) setInternalQuantity(normalized);
    onQuantityChange?.(normalized);
  };

  const copy = getVariantCopy(variant, displayedProduct, offerPrice, upgradeDifference, t);

  return (
    <section
      className={`overlay-dialog overlay-dialog--size-${size} offer-dialog offer-dialog--${variant} ${className}`.trim()}
      aria-labelledby="offer-dialog-title"
    >
      {isComboOffer && (
        <header className="offer-dialog__badge">{t('offer.comboBadge')}</header>
      )}

      <div className="offer-dialog__content">
        <div className="offer-dialog__product">
          <div className="offer-dialog__image-slot">
            {displayedProduct.image ? (
              <img src={displayedProduct.image} alt={displayedProduct.name} />
            ) : (
              <div className="offer-dialog__image-placeholder" aria-hidden="true" />
            )}
            {isComboOffer && (
              <Tag
                className="offer-dialog__savings-tag"
                status="Brand"
                text={t('offer.save', { value: currency.format(savings) })}
              />
            )}
          </div>

          {!isUpgrade && (
            <div className="offer-dialog__product-details">
              <p className="offer-dialog__product-name">{displayedProduct.name}</p>
              {isComboOffer ? (
                <div className="offer-dialog__price-pair">
                  <del>{currency.format(displayedProduct.price)}</del>
                  <strong>{currency.format(offerPrice)}</strong>
                </div>
              ) : (
                <p className="offer-dialog__price">{currency.format(displayedProduct.price)}</p>
              )}
              {isPreCheckout && (
                <Counter
                  value={currentQuantity}
                  min={1}
                  max={maxQuantity}
                  state={currentQuantity >= maxQuantity ? 'Maximum' : 'Default'}
                  onChange={updateQuantity}
                />
              )}
            </div>
          )}
        </div>

        <div className="offer-dialog__text-actions">
          <div className="offer-dialog__copy">
            <h2 id="offer-dialog-title">{copy.title}</h2>
            <p>{copy.description}</p>
          </div>

          <div className="offer-dialog__actions">
            <Button
              label={copy.secondaryAction}
              intent="primary"
              variant="outlined"
              radius="md"
              showLeftIcon={false}
              showRightIcon={false}
              showSecondaryLabel={false}
              onClick={onDismiss}
            />
            <Button
              label={copy.primaryAction}
              intent="primary"
              variant="solid"
              radius="md"
              showLeftIcon={false}
              showRightIcon={false}
              showSecondaryLabel={false}
              onClick={() => onConfirm?.(displayedProduct, currentQuantity)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function getVariantCopy(
  variant: OfferDialogVariant,
  product: OfferProduct,
  offerPrice: number,
  upgradeDifference: number,
  t: (key: TranslationKey, values?: Record<string, string | number>) => string,
) {
  switch (variant) {
    case 'pre-checkout':
      return {
        title: t(categoryHeadingKeys[product.category]),
        description: t('offer.preCheckoutDescription', { product: product.name }),
        secondaryAction: t('concessions.payOrder'),
        primaryAction: t('offer.addAndPay'),
      };
    case 'upgrade':
      return {
        title: t('offer.upgradeTitle', { value: currency.format(upgradeDifference) }),
        description: t('offer.upgradeDescription', { product: product.name }),
        secondaryAction: t('offer.noThanks'),
        primaryAction: t('offer.upgradeAction'),
      };
    case 'combo-offer':
      return {
        title: t('offer.comboOfferTitle'),
        description: t('offer.comboOfferDescription', { product: product.name, value: currency.format(offerPrice) }),
        secondaryAction: t('offer.noThanks'),
        primaryAction: t('offer.getDiscount'),
      };
    default:
      return {
        title: t('offer.crossSellTitle'),
        description: t('offer.crossSellDescription', { product: product.name }),
        secondaryAction: t('offer.noThanks'),
        primaryAction: t('customization.addItem'),
      };
  }
}
