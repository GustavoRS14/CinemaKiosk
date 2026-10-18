import React from 'react';
import { ProductActionBar, type ProductActionBarProps } from '../ProductActionBar';
import { Button } from '../Button';
import { Divider } from '../Divider';
import './ModalFooter.css';
import { useI18n } from '../../../i18n';

export interface ModalFooterProps {
  /** Optional custom class name */
  className?: string;
  /** Preserves the existing footer by default and enables the concession cart composition. */
  layout?: 'default' | 'cart';
  /** Figma Boolean property */
  hasProductActionBar?: boolean;
  /** Figma Text property */
  price?: string;
  /** Total quantity of products. The "Subtotal" prefix is intentionally fixed. */
  itemCount?: number;
  subtotalPrice?: string;
  ticketCount?: number;
  ticketSubtotal?: string;
  concessionCount?: number;
  concessionSubtotal?: string;
  showDiscount?: boolean;
  discountLabel?: string;
  discountPrice?: string;
  /** Figma Boolean property */
  secondaryAction?: boolean;
  /** Figma Boolean property */
  showTotalPrice?: boolean;
  primaryLabel?: React.ReactNode;
  primarySecondaryLabel?: React.ReactNode;
  showPrimarySecondaryLabel?: boolean;
  productActionBarProps?: Omit<ProductActionBarProps, 'className'>;
  primaryDisabled?: boolean;
  onPrimaryAction?: () => void;
}

export function ModalFooter({
  className = "",
  layout = 'default',
  hasProductActionBar = false,
  price = "160,00",
  itemCount = 4,
  subtotalPrice = '800,00',
  ticketCount,
  ticketSubtotal,
  concessionCount,
  concessionSubtotal,
  showDiscount = false,
  discountLabel = 'Oferta Especial de Combo',
  discountPrice = '30,00',
  secondaryAction = false,
  showTotalPrice = true,
  primaryLabel,
  primarySecondaryLabel,
  showPrimarySecondaryLabel = false,
  productActionBarProps,
  primaryDisabled = false,
  onPrimaryAction,
}: ModalFooterProps) {
  const { t } = useI18n();

  if (layout === 'cart') {
    return (
      <div className={`totem-modal-footer totem-modal-footer--cart ${className}`.trim()}>
        <div className="totem-modal-footer__cart-summary">
          {ticketCount !== undefined && ticketSubtotal !== undefined && (
            <div className="totem-modal-footer__cart-row">
              <p className="totem-modal-footer__cart-row-label">{t('checkout.tickets')} ({ticketCount})</p>
              <p className="totem-modal-footer__cart-row-value">R$ {ticketSubtotal}</p>
            </div>
          )}
          {concessionCount !== undefined && concessionSubtotal !== undefined && (
            <div className="totem-modal-footer__cart-row">
              <p className="totem-modal-footer__cart-row-label">{t('checkout.concessions')} ({concessionCount})</p>
              <p className="totem-modal-footer__cart-row-value">R$ {concessionSubtotal}</p>
            </div>
          )}
          <div className="totem-modal-footer__cart-row">
            <p className="totem-modal-footer__cart-row-label">
              {t('cart.subtotal')} ({itemCount} {t(itemCount === 1 ? 'cart.item' : 'cart.items')})
            </p>
            <p className="totem-modal-footer__cart-row-value">R$ {subtotalPrice}</p>
          </div>
          {showDiscount && (
            <div className="totem-modal-footer__cart-row totem-modal-footer__cart-row--discount">
              <p className="totem-modal-footer__cart-row-label">{discountLabel}</p>
              <p className="totem-modal-footer__cart-row-value">- R$ {discountPrice}</p>
            </div>
          )}
        </div>

        <Divider className="totem-modal-footer__cart-divider" />

        <div className="totem-modal-footer__cart-actions">
          {showTotalPrice && (
            <div className="totem-modal-footer__cart-total">
              <p className="totem-modal-footer__total-label">{t('common.total')}</p>
              <div className="totem-modal-footer__price">
                <p className="totem-modal-footer__currency">R$</p>
                <p className="totem-modal-footer__value">{price}</p>
              </div>
            </div>
          )}

          <div className="totem-modal-footer__cart-buttons">
            {secondaryAction && (
              <Button
                label={t('action.back')}
                variant="ghost"
                intent="primary"
                showLeftIcon={false}
                showRightIcon={false}
                showSecondaryLabel={false}
                radius="md"
              />
            )}
            <Button
              label={primaryLabel ?? 'Pagar Pedido'}
              variant="solid"
              intent="primary"
              showLeftIcon={false}
              showRightIcon={false}
              showSecondaryLabel={showPrimarySecondaryLabel}
              secondaryLabel={primarySecondaryLabel}
              radius="md"
              disabled={primaryDisabled}
              onClick={onPrimaryAction}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`totem-modal-footer ${className}`.trim()}>
      {showTotalPrice && (
        <div className="totem-modal-footer__total-price">
          <div className="totem-modal-footer__total-price-inner">
            <p className="totem-modal-footer__total-label">{t('common.total')}</p>
            <div className="totem-modal-footer__price">
              <p className="totem-modal-footer__currency">R$</p>
              <p className="totem-modal-footer__value">{price}</p>
            </div>
          </div>
        </div>
      )}
      
      {hasProductActionBar && (
        <ProductActionBar {...productActionBarProps} className="totem-modal-footer__product-action-bar" />
      )}
      
      <div className="totem-modal-footer__actions">
        <div className="totem-modal-footer__actions-inner">
          <div className="totem-modal-footer__secondary-action-slot">
            {secondaryAction && (
              <Button 
                label={t('action.back')} 
                variant="ghost" 
                intent="primary" 
                showLeftIcon={false} 
                showRightIcon={false}
                showSecondaryLabel={false}
                radius="md"
              />
            )}
          </div>
          <div className="totem-modal-footer__primary-action-slot">
            <Button 
              label={primaryLabel ?? t('common.payNow')} 
              variant="solid" 
              intent="primary" 
              showLeftIcon={false} 
              showRightIcon={false}
              showSecondaryLabel={showPrimarySecondaryLabel}
              secondaryLabel={primarySecondaryLabel}
              radius="md"
              disabled={primaryDisabled}
              onClick={onPrimaryAction}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
