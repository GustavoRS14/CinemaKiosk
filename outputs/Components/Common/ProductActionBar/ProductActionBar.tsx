import React, { useState } from 'react';
import { IconButton } from '../IconButton';
import placeholderImg from '@images/placeholder.png';
import MinusIcon from '@icons/minus.svg';
import PlusIcon from '@icons/add-plus.svg';
import './ProductActionBar.css';
import { useI18n } from '../../../i18n';

export interface ProductActionBarProps {
  /** Map to the Figma Component Property */
  productName?: string;
  imageSrc?: string;
  imageAlt?: string;
  quantity?: number;
  defaultQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
  /** Optional custom class name */
  className?: string;
}

export function ProductActionBar({
  productName = "Balde 1 Minions + Pipoca",
  imageSrc = placeholderImg,
  imageAlt = "Product",
  quantity: controlledQuantity,
  defaultQuantity = 1,
  onQuantityChange,
  className = "",
}: ProductActionBarProps) {
  const { t } = useI18n();
  // Adding internal counter state for uncontrolled toggle logic
  const [internalQuantity, setInternalQuantity] = useState(defaultQuantity);
  const quantity = controlledQuantity ?? internalQuantity;

  const updateQuantity = (nextQuantity: number) => {
    if (controlledQuantity === undefined) setInternalQuantity(nextQuantity);
    onQuantityChange?.(nextQuantity);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    updateQuantity(quantity + 1);
  };

  return (
    <div className={`totem-product-action-bar ${className}`.trim()}>
      <div className="totem-product-action-bar__info">
        <div className="totem-product-action-bar__image-container">
          <img 
            alt={imageAlt}
            className="totem-product-action-bar__image" 
            src={imageSrc}
          />
        </div>
        <div className="totem-product-action-bar__text-container">
          <p className="totem-product-action-bar__title">{t('common.chooseQuantity')}</p>
          <p className="totem-product-action-bar__product-name">{productName}</p>
        </div>
      </div>
      
      <div className="totem-product-action-bar__counter-container">
        <div className="totem-product-action-bar__counter">
          <IconButton 
            icon={<MinusIcon />} 
            state={quantity <= 1 ? 'Disabled' : 'Default'}
            onClick={handleDecrement}
            disabled={quantity <= 1}
            aria-label={t('common.decreaseQuantity')}
          />
          <p className="totem-product-action-bar__quantity">{quantity}</p>
          <IconButton 
            icon={<PlusIcon />} 
            onClick={handleIncrement}
            aria-label={t('common.increaseQuantity')}
          />
        </div>
      </div>
    </div>
  );
}
