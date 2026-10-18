import React from 'react';
import { CloseButton } from '../CloseButton';
import { useI18n } from '../../../i18n';
import './ModalHeader.css';

export interface ModalHeaderProps {
  /** Optional custom class name */
  className?: string;
  /** Figma text property */
  text?: string;
  /** Called when the close control is activated. */
  onClose?: () => void;
}

export function ModalHeader({
  className = "",
  text = "Título",
  onClose,
}: ModalHeaderProps) {
  const { t } = useI18n();
  return (
    <div className={`totem-modal-header ${className}`.trim()}>
      <div className="totem-modal-header__title-container">
        <p className="totem-modal-header__title">{text}</p>
      </div>
      <CloseButton className="totem-modal-header__close-btn" onClick={onClose} aria-label={t('common.close')} />
    </div>
  );
}
