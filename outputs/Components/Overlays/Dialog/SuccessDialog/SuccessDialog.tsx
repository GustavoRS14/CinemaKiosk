import { useEffect, useState } from 'react';
import CheckIcon from '@asset-icons/check-2.svg';
import BackgroundIllustration from '@illustrations/BackgroundIllustration.svg';

import { Button } from '../../../Common/Button';
import { TextButton } from '../../../Common/TextButton';
import { useI18n } from '../../../../i18n';
import { formatPhoneNumber } from '../../../../Utilities/inputFormatters';
import '../../overlayDialog.css';
import './SuccessDialog.css';

export type SuccessDialogVariant =
  | 'payment-confirmed'
  | 'order-found'
  | 'order-sent'
  | 'order-sent-retry';

export type SuccessDialogProps = {
  variant?: SuccessDialogVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  deliveryMethod?: 'SMS' | 'WhatsApp';
  phoneNumber?: string;
  onExit?: () => void;
  onNotReceived?: () => void;
  onChangeMethod?: () => void;
  onResend?: () => void;
  className?: string;
};

export function SuccessDialog({
  variant = 'payment-confirmed',
  size = 'md',
  deliveryMethod = 'SMS',
  phoneNumber = '(XX) 9 XXXX-XXXX',
  onExit,
  onNotReceived,
  onChangeMethod,
  onResend,
  className = '',
}: SuccessDialogProps) {
  const { t } = useI18n();
  const [resendCooldown, setResendCooldown] = useState(0);
  const content = variant === 'payment-confirmed'
    ? { title: t('success.paymentConfirmed'), description: t('success.paymentConfirmedDescription') }
    : variant === 'order-found'
      ? { title: t('success.orderFound'), description: t('success.orderFoundDescription') }
      : { title: t('success.orderSent'), description: '' };
  const titleId = `success-dialog-title-${variant}`;
  const isSentVariant = variant === 'order-sent' || variant === 'order-sent-retry';
  const displayedPhoneNumber = formatPhoneNumber(phoneNumber);

  useEffect(() => {
    if (variant !== 'order-sent-retry' || resendCooldown <= 0) return undefined;
    const timeout = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1_000);
    return () => window.clearTimeout(timeout);
  }, [resendCooldown, variant]);

  useEffect(() => {
    if (variant !== 'order-sent-retry') setResendCooldown(0);
  }, [variant]);

  return (
    <section
      className={`overlay-dialog overlay-dialog--size-${size} success-dialog success-dialog--${variant} ${className}`.trim()}
      aria-labelledby={titleId}
      role="status"
    >
      {!isSentVariant && (
        <BackgroundIllustration className="success-dialog__background" aria-hidden="true" />
      )}

      <div className="success-dialog__content">
        <CheckIcon className="success-dialog__icon" aria-hidden="true" />

        <div className="success-dialog__copy">
          <h2 id={titleId}>{content.title}</h2>
          {isSentVariant ? (
            <p>
              {t('success.orderSentPrefix')} <strong>{deliveryMethod}</strong> {t('success.orderSentTo')}{' '}
              <span className="success-dialog__phone">{displayedPhoneNumber}</span>. {t('success.orderSentCheckPhone')}
            </p>
          ) : (
            <p>{content.description}</p>
          )}

          {variant === 'order-sent' && (
            <div className="success-dialog__text-actions">
              <TextButton
                label={t('success.receivedExit')}
                intent="Primary"
                size="sm"
                weight="Medium"
                onClick={onExit}
              />
              <TextButton
                label={t('success.notReceived')}
                intent="Neutral"
                size="sm"
                weight="Medium"
                onClick={onNotReceived}
              />
            </div>
          )}

          {variant === 'order-sent-retry' && (
            <>
              <div className="success-dialog__button-actions">
                <Button
                  label={t('success.changeMethod')}
                  intent="primary"
                  variant="solid"
                  radius="md"
                  showLeftIcon={false}
                  showRightIcon={false}
                  showSecondaryLabel={false}
                  onClick={onChangeMethod}
                />
                <Button
                  label={t('success.resendOrder')}
                  intent="primary"
                  variant="outlined"
                  radius="md"
                  showLeftIcon={false}
                  showRightIcon={false}
                  showSecondaryLabel={false}
                  disabled={resendCooldown > 0}
                  onClick={() => {
                    if (resendCooldown > 0) return;
                    setResendCooldown(30);
                    onResend?.();
                  }}
                />
              </div>
              {resendCooldown > 0 && (
                <p className="success-dialog__resend-countdown" aria-live="polite">
                  <span>{t('success.resendIn')} </span>
                  <strong>{t('success.seconds', { count: resendCooldown })}</strong>
                </p>
              )}
              <TextButton
                label={t('success.receivedExit')}
                intent="Neutral"
                size="sm"
                weight="Medium"
                onClick={onExit}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
