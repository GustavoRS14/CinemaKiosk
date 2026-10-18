import React, { useState } from 'react';
import './ConcessionCard.css';
import { Counter } from '../Counter';
import { IconButton } from '../IconButton';

export type ConcessionCardProps = {
  className?: string;
  flowType?: 'Express' | 'Personalized';
  state?: 'Default' | 'Pressed';
  title?: string;
  price?: string;
  imageUrl?: string;
  imageUrls?: string[];
  amount?: number;
  maxAmount?: number;
  cartLimitReached?: boolean;
  onAmountChange?: (newValue: number) => void;
  onClick?: () => void;
};

export const ConcessionCard = ({
  className = '',
  flowType = 'Express',
  state = 'Default',
  title = 'Pipoca Grande',
  price = '160,00',
  imageUrl,
  imageUrls,
  amount,
  maxAmount,
  cartLimitReached = false,
  onAmountChange,
  onClick,
}: ConcessionCardProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const activeState = isPressed ? 'Pressed' : state;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`concession-card concession-card-container ${className}`.trim()}
      data-state={activeState}
      data-flow-type={flowType}
      onClick={onClick}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onClick) onClick();
        }
      }}
    >
      {(imageUrls?.length || imageUrl) && (
        <div className="concession-card-image-wrapper">
          {(imageUrls ?? (imageUrl ? [imageUrl] : [])).map((source, index) => (
            <img
              key={`${source}-${index}`}
              alt={index === 0 ? title : ''}
              aria-hidden={index > 0}
              className="concession-card-image"
              src={source}
            />
          ))}
        </div>
      )}
      <div className="concession-card-content">
        <div className="concession-card-title-wrapper">
          <p className="concession-card-title">{title}</p>
        </div>
        <div className="concession-card-action-area">
          <div className="concession-card-price">
            <span>R$</span>
            <span>{price}</span>
          </div>
          {flowType === 'Express' ? (
            <div
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
            >
              <Counter
                value={amount}
                defaultValue={0}
                max={maxAmount}
                state={cartLimitReached ? ((amount ?? 0) > 0 ? 'Maximum' : 'Disabled') : 'Default'}
                onChange={onAmountChange}
                showValidationTooltip={false}
              />
            </div>
          ) : (
            <div aria-hidden="true">
              <IconButton state="Default" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConcessionCard;
