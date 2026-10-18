import React from 'react';
import { TextButton } from '../TextButton';
import './OrderItem.css';

export type OrderItemContext = 'Notification' | 'Summary';

export type OrderItemProps = {
  context?: 'Notification' | 'Summary';
  productName?: string;
  price?: string;
  quantity?: string | number;
  action?: boolean;
  imageUrl?: string;
  imagePosition?: 'center' | 'left';
  onAction?: () => void;
};

export function OrderItem({
  context = 'Notification',
  productName = 'Product Name',
  price = '0,00',
  quantity = '1',
  action = true,
  imageUrl,
  imagePosition = 'center',
  onAction,
}: OrderItemProps) {
  const showActionButton = context === 'Notification' && action;

  return (
    <div className="order-item">
      <img
        className="order-item__image"
        src={imageUrl}
        alt={productName}
        style={{ objectPosition: imagePosition }}
      />
      <span className="order-item__quantity">{quantity}x</span>
      <div className="order-item__product">
        <span className="order-item__product-name" title={productName}>
          {productName}
        </span>
        <span className="order-item__product-price">R$ {price}</span>
      </div>
      {showActionButton && (
        <div className="order-item__action">
          <TextButton
            intent="Information"
            size="sm"
            weight="SemiBold"
            label="Desfazer"
            hasLeftIcon={false}
            hasRightIcon={false}
            onClick={onAction}
          />
        </div>
      )}
    </div>
  );
}

OrderItem.displayName = 'OrderItem';
