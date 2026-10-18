import React, { useState, useEffect } from 'react';
import { CloseButton } from '../CloseButton';
import { Divider } from '../Divider';
import { ProgressBar } from '../ProgressBar';
import { OrderItem, type OrderItemProps } from '../OrderItem';
import './Notification.css';

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="currentColor" />
  </svg>
);

export type NotificationBadge = 'Added' | 'Removed';

export type NotificationProps = {
  badge?: NotificationBadge;
  title?: string;
  imageUrl: string;
  price?: string;
  productName?: string;
  quantity?: string;
  onClose?: () => void;
  onDismiss?: () => void;
  onUndo?: () => void;
};

export function Notification({
  badge = 'Added',
  title,
  imageUrl,
  price = '160,00',
  productName = 'Copo de Refrigerante 1000ml',
  quantity = '1',
  onClose,
  onDismiss,
  onUndo,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!isVisible) return null;
  const resolvedTitle = title ?? (badge === 'Added' ? 'Adicionado ao Carrinho!' : 'Removido do Carrinho');

  return (
    <aside className="notification" data-badge={badge.toLowerCase()}>
      <div className="notification__main">
        <div className="notification__header">
          <div className="notification__title-group">
            <strong className="notification__title">{resolvedTitle}</strong>
          </div>
          <CloseButton
            className="notification__close"
            state="Default"
            type="Ghost"
            icon={<CloseIcon className="notification__close-icon" />}
            aria-label="Fechar"
            onClick={(e) => {
              setIsVisible(false);
              onClose?.();
            }}
          />
        </div>

        <Divider className="notification__divider" type="Solid" vertical={false} />

        <OrderItem
          context={badge === 'Removed' ? 'Notification' : 'Summary'}
          imageUrl={imageUrl}
          price={price}
          productName={productName}
          quantity={quantity}
          action={true}
          onAction={onUndo}
        />
      </div>
      <ProgressBar className="notification__progress" progress={100} />
    </aside>
  );
}

Notification.displayName = 'Notification';
