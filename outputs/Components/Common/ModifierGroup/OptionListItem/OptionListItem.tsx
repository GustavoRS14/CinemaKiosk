import React from 'react';
import './OptionListItem.css';
import { Counter } from '../../Counter';

export type OptionListItemState = 'Default' | 'Disabled';

export type OptionListItemProps = {
  /** Additional class names. */
  className?: string;
  /** Show the additional price section. @default true */
  additionalPrice?: boolean;
  /** Current price text. @default "160,00" */
  currentPrice?: string;
  /** Original price text. @default "R$ 160,00" */
  originalPrice?: string;
  /** Product name text. @default "Nome do Produto" */
  productName?: string;
  /** Show original price text. @default true */
  showOriginalPrice?: boolean;
  /** Current value of the counter for controlled usage. */
  value?: number;
  /** Initial value of the counter for uncontrolled usage. @default 0 */
  defaultValue?: number;
  /** Callback fired when the counter value changes. */
  onChange?: (value: number) => void;
  /** Figma state property */
  state?: OptionListItemState;
  /** Boolean disabled override (used by ModifierGroup orchestrator) */
  disabled?: boolean;
  /** Maximum allowed value (used by ModifierGroup orchestrator) */
  max?: number;
};

export const OptionListItem: React.FC<OptionListItemProps> = ({
  className = '',
  additionalPrice = true,
  currentPrice = '160,00',
  originalPrice = 'R$ 160,00',
  productName = 'Nome do Produto',
  showOriginalPrice = true,
  value,
  defaultValue = 0,
  state = 'Default',
  disabled = false,
  max,
  onChange,
}) => {
  // Derive final state based on explicit variant or injected boolean
  const appliedState = disabled ? 'Disabled' : state;

  return (
    <div className={`option-list-item ${className}`.trim()} data-state={appliedState}>
      <div className="option-list-item-product-name">
        <p>{productName}</p>
      </div>

      <div className="option-list-item-actions">
        {additionalPrice && (
          <div className="option-list-item-prices-wrapper">
            <div className="option-list-item-current-price">
              <p>+R$</p>
              <p>{currentPrice}</p>
            </div>
            {showOriginalPrice && (
              <div className="option-list-item-original-price">
                <p>{originalPrice}</p>
              </div>
            )}
          </div>
        )}

        <Counter
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          max={max}
          state={appliedState}
        />
      </div>
    </div>
  );
};
