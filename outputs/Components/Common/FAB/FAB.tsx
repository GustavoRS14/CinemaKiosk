import React from 'react';
import { Notification, type NotificationBadge } from '../Notification';
import './FAB.css';

// Using local SVG directly as a component based on project instructions
import CartIcon from '@icons/cart.svg';

export type FabProps = {
  /** Visual status of the FAB */
  status?: 'Empty' | 'With Product';
  /** The quantity to display in the badge */
  quantity?: number | string;
  /** Whether to show the item notification */
  itemNotification?: boolean;
  notificationImageUrl?: string;
  notificationProductName?: string;
  notificationPrice?: string;
  notificationQuantity?: string;
  notificationBadge?: NotificationBadge;
  notificationKey?: number;
  onNotificationDismiss?: () => void;
  onNotificationUndo?: () => void;
  /** Click handler */
  onClick?: () => void;
  className?: string;
};

export function FAB({
  status = 'Empty',
  quantity = '1',
  itemNotification = false,
  notificationImageUrl = '',
  notificationProductName = 'Balde 1 Minions + Pipoca',
  notificationPrice = '160,00',
  notificationQuantity = '1',
  notificationBadge = 'Added',
  notificationKey,
  onNotificationDismiss,
  onNotificationUndo,
  onClick,
  className = '',
}: FabProps) {
  return (
    <div className={`fab-wrapper ${className}`.trim()} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="fab"
        onClick={onClick}
        aria-label="Carrinho de Compras"
      >
        <div className="fab__icon">
          <CartIcon />
        </div>
        {status === 'With Product' && (
          <div className="fab__quantity">
            <p className="fab__quantity-text">{quantity}</p>
          </div>
        )}
      </button>

      {itemNotification && (
        <div className="fab__notification-wrapper">
          <Notification
            key={notificationKey}
            badge={notificationBadge}
            title={notificationBadge === 'Added' ? 'Adicionado ao Carrinho!' : 'Removido do Carrinho'}
            imageUrl={notificationImageUrl}
            productName={notificationProductName}
            price={notificationPrice}
            quantity={notificationQuantity}
            onClose={onNotificationDismiss}
            onDismiss={onNotificationDismiss}
            onUndo={onNotificationUndo}
          />
        </div>
      )}
    </div>
  );
}

FAB.displayName = 'FAB';
