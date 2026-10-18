import { useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';

import AmexIcon from '@icons/Payment/AMEX.svg';
import BanriComprasIcon from '@icons/Payment/Banri Compras.svg';
import DinnersClubIcon from '@icons/Payment/Dinners Club.svg';
import DiscoverNetworkIcon from '@icons/Payment/Discover Network.svg';
import EloIcon from '@icons/Payment/ELO.svg';
import HiperIcon from '@icons/Payment/Hiper.svg';
import JcbIcon from '@icons/Payment/JCB.svg';
import MasterCardIcon from '@icons/Payment/MasterCard.svg';
import PixLogo from '@icons/Payment/PIX.svg';
import VisaIcon from '@icons/Payment/Visa.svg';
import sampleQrCode from '@project-images/Payment/qr-code.png';
import { LoadingSpinner } from '../../../Common/LoadingSpinner';
import { TextButton } from '../../../Common/TextButton';
import { VectorQrCode } from '../../../Common/VectorQrCode';
import { useI18n } from '../../../../i18n';
import '../../overlayDialog.css';
import './PaymentDialog.css';

export type PaymentDialogMethod = 'credit' | 'debit' | 'pix';
export type PaymentBrand =
  | 'mastercard'
  | 'visa'
  | 'elo'
  | 'amex'
  | 'hiper'
  | 'diners'
  | 'discover'
  | 'jcb'
  | 'banri';

export interface PaymentDialogProps {
  method?: PaymentDialogMethod;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  acceptedBrands?: PaymentBrand[];
  qrValue?: string;
  qrImageSrc?: string;
  pixExpirationSeconds?: number;
  onChangeMethod?: () => void;
  onPixExpired?: () => void;
  onQrDecodeError?: (error: Error) => void;
  className?: string;
}

type PaymentBrandDefinition = {
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const paymentBrands: Record<PaymentBrand, PaymentBrandDefinition> = {
  mastercard: { label: 'Mastercard', Icon: MasterCardIcon },
  visa: { label: 'Visa', Icon: VisaIcon },
  elo: { label: 'Elo', Icon: EloIcon },
  amex: { label: 'American Express', Icon: AmexIcon },
  hiper: { label: 'Hiper', Icon: HiperIcon },
  diners: { label: 'Diners Club', Icon: DinnersClubIcon },
  discover: { label: 'Discover Network', Icon: DiscoverNetworkIcon },
  jcb: { label: 'JCB', Icon: JcbIcon },
  banri: { label: 'Banri Compras', Icon: BanriComprasIcon },
};

const creditBrands: PaymentBrand[] = [
  'mastercard',
  'visa',
  'elo',
  'amex',
  'hiper',
  'diners',
  'discover',
  'jcb',
];
const debitBrands: PaymentBrand[] = ['mastercard', 'visa', 'elo', 'banri'];

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function PaymentDialog({
  method = 'credit',
  size = 'md',
  acceptedBrands,
  qrValue,
  qrImageSrc = sampleQrCode,
  pixExpirationSeconds = 5 * 60,
  onChangeMethod,
  onPixExpired,
  onQrDecodeError,
  className = '',
}: PaymentDialogProps) {
  const { t } = useI18n();
  const brands = acceptedBrands ?? (method === 'debit' ? debitBrands : creditBrands);
  const isPix = method === 'pix';
  const duration = Math.max(0, Math.floor(pixExpirationSeconds));
  const [remainingSeconds, setRemainingSeconds] = useState(duration);
  const expirationNotifiedRef = useRef(false);

  useEffect(() => {
    if (!isPix) return;

    const expiresAt = Date.now() + duration * 1000;
    expirationNotifiedRef.current = false;
    setRemainingSeconds(duration);

    const updateCountdown = () => {
      const nextValue = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemainingSeconds(nextValue);

      if (nextValue === 0 && !expirationNotifiedRef.current) {
        expirationNotifiedRef.current = true;
        onPixExpired?.();
      }
    };

    const timer = window.setInterval(updateCountdown, 250);
    return () => window.clearInterval(timer);
  }, [duration, isPix, onPixExpired]);

  return (
    <section
      className={`overlay-dialog overlay-dialog--size-${size} payment-dialog payment-dialog--${method} ${className}`.trim()}
      aria-labelledby="payment-dialog-title"
    >
      <div className="payment-dialog__content">
        {isPix ? (
          <>
            <PixLogo className="payment-dialog__pix-logo" aria-label="PIX" />
            <div className="payment-dialog__main">
              <h2 id="payment-dialog-title">{t('payment.pointCamera')}</h2>
              <div className="payment-dialog__qr-code">
                <VectorQrCode
                  value={qrValue}
                  imageSrc={qrImageSrc}
                  className="payment-dialog__qr-svg"
                  fallbackClassName="payment-dialog__qr-fallback"
                  title={t('payment.pixQrCode')}
                  onDecodeError={onQrDecodeError}
                />
              </div>
              <div className="payment-dialog__footer-block">
                <div className="payment-dialog__pix-status">
                  <p>{t('payment.waiting')}</p>
                  <p>
                    {t('payment.expiresIn')} <strong>{formatCountdown(remainingSeconds)}</strong>
                  </p>
                </div>
                <ChangeMethodButton label={t('payment.changeMethod')} onClick={onChangeMethod} />
              </div>
            </div>
          </>
        ) : (
          <div className="payment-dialog__main">
            <h2 id="payment-dialog-title">{t('payment.insertCard')}</h2>
            <p className="payment-dialog__description">
              {t('payment.followTerminal')}
            </p>
            <div className="payment-dialog__processing">
              <LoadingSpinner size="lg" intent="Primary" aria-label={t('payment.processing')} />
              <p>{t('payment.processing')}</p>
            </div>
            <div className="payment-dialog__footer-block">
              <ul className="payment-dialog__brands" aria-label={t('payment.acceptedBrands')}>
                {brands.map((brand) => {
                  const { Icon, label } = paymentBrands[brand];
                  return (
                    <li key={brand}>
                      <Icon role="img" aria-label={label} />
                    </li>
                  );
                })}
              </ul>
              <ChangeMethodButton label={t('payment.changeMethod')} onClick={onChangeMethod} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ChangeMethodButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <TextButton
      intent="Muted"
      size="sm"
      weight="Medium"
      label={label}
      hasLeftIcon={false}
      hasRightIcon={false}
      onClick={onClick}
    />
  );
}
