import { useMemo, useState, type UIEvent } from 'react';

import { ModalFooter } from '../../../Common/ModalFooter';
import { ModalHeader } from '../../../Common/ModalHeader';
import { ModifierGroup } from '../../../Common/ModifierGroup';
import type { OptionListItemProps } from '../../../Common/ModifierGroup/OptionListItem';
import { useI18n } from '../../../../i18n';
import './ProductCustomizationSlideOver.css';

export type ProductCustomizationOption = {
  id: string;
  name: string;
  priceDelta?: number;
  originalPrice?: string;
  defaultQuantity?: number;
};

export type ProductCustomizationGroup = {
  id: string;
  title: string;
  options: ProductCustomizationOption[];
  requiredCount?: number;
  optional?: boolean;
};

export type ProductCustomizationSlideOverProps = {
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  productName: string;
  productImageSrc: string;
  productImageAlt?: string;
  basePrice: number;
  groups?: ProductCustomizationGroup[];
  quantity?: number;
  defaultQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
  onAddItem?: (details: { quantity: number; selections: Record<string, number[]>; total: number }) => void;
  onClose?: () => void;
  className?: string;
};

const currency = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function ProductCustomizationSlideOver({
  width = 'lg',
  productName,
  productImageSrc,
  productImageAlt = productName,
  basePrice,
  groups = [],
  quantity: controlledQuantity,
  defaultQuantity = 1,
  onQuantityChange,
  onAddItem,
  onClose,
  className = '',
}: ProductCustomizationSlideOverProps) {
  const { t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [internalQuantity, setInternalQuantity] = useState(defaultQuantity);
  const [selections, setSelections] = useState<Record<string, number[]>>({});
  const quantity = controlledQuantity ?? internalQuantity;

  const optionItems = useMemo(
    () => Object.fromEntries(groups.map((group) => [
      group.id,
      group.options.map<OptionListItemProps>((option) => ({
        productName: option.name,
        additionalPrice: option.priceDelta !== undefined,
        currentPrice: option.priceDelta !== undefined ? currency.format(option.priceDelta) : undefined,
        originalPrice: option.originalPrice,
        showOriginalPrice: Boolean(option.originalPrice),
        defaultValue: option.defaultQuantity ?? 0,
      })),
    ])),
    [groups],
  );

  const additionsTotal = groups.reduce((sum, group) => {
    const values = selections[group.id] ?? group.options.map(option => option.defaultQuantity ?? 0);
    return sum + group.options.reduce(
      (groupTotal, option, index) => groupTotal + (option.priceDelta ?? 0) * (values[index] ?? 0),
      0,
    );
  }, 0);
  const total = (basePrice + additionsTotal) * quantity;

  const requirementsComplete = groups.every((group) => {
    if (group.optional || !group.requiredCount) return true;
    const values = selections[group.id] ?? group.options.map(option => option.defaultQuantity ?? 0);
    return values.reduce((sum, value) => sum + value, 0) >= group.requiredCount;
  });

  const setQuantity = (nextQuantity: number) => {
    if (controlledQuantity === undefined) setInternalQuantity(nextQuantity);
    onQuantityChange?.(nextQuantity);
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setIsScrolled(event.currentTarget.scrollTop > 0);
  };

  return (
    <aside
      className={`product-customization-slide-over ${isScrolled ? 'product-customization-slide-over--scrolled' : ''} ${className}`.trim()}
      data-width={width}
      aria-label={t('customization.aria', { product: productName })}
    >
      <ModalHeader text="" onClose={onClose} className="product-customization-slide-over__header" />

      <div className="product-customization-slide-over__content" onScroll={handleScroll}>
        <section className="product-customization-slide-over__hero">
          <img src={productImageSrc} alt={productImageAlt} />
          <h1>{productName}</h1>
        </section>

        <div className="product-customization-slide-over__product-list">
          {groups.length > 0 && (
            <div className="product-customization-slide-over__groups">
              {groups.map((group) => (
                <ModifierGroup
                  key={group.id}
                  title={group.title}
                  items={optionItems[group.id]}
                  requirementCount={group.optional ? undefined : group.requiredCount}
                  showRequirementTag={!group.optional}
                  onQuantitiesChange={(values) => setSelections(current => ({ ...current, [group.id]: values }))}
                />
              ))}
            </div>
          )}

          <p className="product-customization-slide-over__notice">
            {t('customization.exchangeNotice')}
            <br />
            {t('customization.imageNotice')}
          </p>
        </div>
      </div>

      <ModalFooter
        className="product-customization-slide-over__footer"
        hasProductActionBar
        showTotalPrice={false}
        productActionBarProps={{
          productName,
          imageSrc: productImageSrc,
          imageAlt: productImageAlt,
          quantity,
          onQuantityChange: setQuantity,
        }}
        primaryLabel={t('customization.addItem')}
        primarySecondaryLabel={`R$ ${currency.format(total)}`}
        showPrimarySecondaryLabel
        primaryDisabled={!requirementsComplete}
        onPrimaryAction={() => onAddItem?.({ quantity, selections, total })}
      />
    </aside>
  );
}
