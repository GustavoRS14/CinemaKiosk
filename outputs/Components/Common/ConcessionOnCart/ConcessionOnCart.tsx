import React, { useState, useEffect, useRef } from 'react';
import './ConcessionOnCart.css';
import { Counter } from '../Counter';
import { TextButton } from '../TextButton';
import { SelectedModifierRow } from '../SelectedModifierRow';
import PlaceholderImg from '@images/placeholder.png';
import { useI18n } from '../../../i18n';

const EditIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.0417 17.7649H13.4583M5.95833 17.7649L9.49999 16.9316L17.2441 9.18752C17.5695 8.86208 17.5695 8.33445 17.2441 8.00901L15.7142 6.47919C15.3888 6.15375 14.8612 6.15375 14.5357 6.47919L6.79166 14.2233L5.95833 17.7649Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type ConcessionStatus = 'Default' | 'Removed';
export type ConcessionFlowType = 'Express' | 'Personalized';

export interface ConcessionOnCartProps {
  status?: ConcessionStatus;
  flowType?: ConcessionFlowType;
  productName: string;
  price: string;
  imageUrl?: string;

  quantity?: number;
  /** Maximum quantity allowed for this instance. */
  maxQuantity?: number;
  onQuantityChange?: (newValue: number) => void;

  onEdit?: () => void;
  onUndo?: () => void;
  onRemove?: () => void;

  /** Toggle to show modifiers in Personalized flow */
  hasModifiers?: boolean;
  /** List of modifiers */
  modifiers?: Array<{ quantity: number; name: string }>;

  className?: string;
}

export const ConcessionOnCart: React.FC<ConcessionOnCartProps> = ({
  status = 'Default',
  flowType = 'Express',
  productName,
  price,
  imageUrl,
  quantity = 1,
  maxQuantity = 10,
  onQuantityChange,
  onEdit,
  onUndo,
  onRemove,
  hasModifiers = false,
  modifiers = [
    { quantity: 1, name: 'Nome do Produto' },
    { quantity: 1, name: 'Nome do Produto' },
    { quantity: 1, name: 'Nome do Produto' }
  ],
  className = '',
}) => {
  const { t } = useI18n();
  const [internalStatus, setInternalStatus] = useState<ConcessionStatus>(status);
  const [internalQuantity, setInternalQuantity] = useState<number>(quantity);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const onRemoveRef = useRef(onRemove);

  useEffect(() => {
    onRemoveRef.current = onRemove;
  }, [onRemove]);

  // Sync with props if they change
  useEffect(() => {
    setInternalStatus(status);
  }, [status]);

  useEffect(() => {
    setInternalQuantity(quantity);
  }, [quantity]);

  // Handle auto-remove timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (internalStatus === 'Removed') {
      timer = setTimeout(() => {
        setIsUnmounted(true);
        onRemoveRef.current?.();
      }, 4000); // 4000ms matches the CSS animation duration
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [internalStatus]);

  const handleQuantityChange = (newValue: number) => {
    if (newValue === 0) {
      setInternalStatus('Removed');
    }
    setInternalQuantity(newValue);
    onQuantityChange?.(newValue);
  };

  const handleUndo = () => {
    setInternalStatus('Default');
    setInternalQuantity(1);
    onQuantityChange?.(1);
    onUndo?.();
  };

  if (isUnmounted) return null;

  const isRemoved = internalStatus === 'Removed';
  const isPersonalized = flowType === 'Personalized';

  return (
    <div
      className={`concession-on-cart ${className}`}
      data-status={internalStatus}
      data-flow={flowType}
    >
      {!isRemoved ? (
        <>
          <div className="concession-content-left">
            <div className="concession-image-wrapper">
              <div className="concession-image-container">
                {imageUrl ? (
                  <img src={imageUrl} alt={productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={PlaceholderImg} alt="Placeholder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            </div>

            <div className="concession-details">
              <div className="concession-details-top">
                <h6 className="concession-title" title={productName}>
                  {productName}
                </h6>

                <div className="concession-price-row">
                  <span className="concession-price-currency">R$</span>
                  <span className="concession-price-value">{price}</span>
                </div>

                {isPersonalized && (
                  <TextButton
                    intent="Information"
                    size="sm"
                    weight="Medium"
                    label={t('common.edit')}
                    hasLeftIcon={false}
                    hasRightIcon={true}
                    rightIcon={<EditIcon />}
                    onClick={onEdit}
                  />
                )}
              </div>

              {isPersonalized && hasModifiers && modifiers.length > 0 && (
                <div className="concession-modifiers-list">
                  {modifiers.map((mod, idx) => (
                    <SelectedModifierRow key={idx} quantity={mod.quantity} name={mod.name} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="concession-actions-right">
            <Counter
              value={internalQuantity}
              onChange={handleQuantityChange}
              max={maxQuantity}
              state={maxQuantity <= 0 ? 'Disabled' : internalQuantity >= maxQuantity ? 'Maximum' : 'Default'}
            />
          </div>
        </>
      ) : (
        <>
          <div className="concession-removed-content">
            <h6 className="concession-title" title={productName}>
              {productName}
            </h6>

            <div className="concession-actions-right">
              <TextButton
                intent="Information"
                size="sm"
                weight="Medium"
                label={t('common.undo')}
                hasLeftIcon={false}
                hasRightIcon={false}
                onClick={handleUndo}
              />
            </div>
          </div>

          <div className="concession-progress-bar-container">
            <div className="concession-progress-bar-fill" />
          </div>
        </>
      )}
    </div>
  );
};
