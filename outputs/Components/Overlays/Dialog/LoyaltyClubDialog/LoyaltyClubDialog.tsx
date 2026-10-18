import BackgroundIllustration from '@illustrations/BackgroundIllustration.svg';
import sampleQrCode from '@project-images/Payment/qr-code.png';

import { BrandLogo } from '../../../BrandLogo/BrandLogo';
import { Button } from '../../../Common/Button';
import { VectorQrCode } from '../../../Common/VectorQrCode';
import { useI18n } from '../../../../i18n';
import '../../overlayDialog.css';
import './LoyaltyClubDialog.css';

export type LoyaltyClubDialogProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  tenant?: string;
  clubName?: string;
  qrValue?: string;
  qrImageSrc?: string;
  onEnterCpf?: () => void;
  onDecline?: () => void;
  onQrDecodeError?: (error: Error) => void;
  className?: string;
};

export function LoyaltyClubDialog({
  size = 'lg',
  tenant = '',
  clubName = 'Clube',
  qrValue,
  qrImageSrc = sampleQrCode,
  onEnterCpf,
  onDecline,
  onQrDecodeError,
  className = '',
}: LoyaltyClubDialogProps) {
  const { t } = useI18n();
  const resolvedClubName = clubName.trim() || 'Clube';
  return (
    <section
      className={`overlay-dialog overlay-dialog--size-${size} loyalty-club-dialog ${className}`.trim()}
      aria-labelledby="loyalty-club-dialog-title"
    >
      <div className="loyalty-club-dialog__content">
        <BrandLogo
          className="loyalty-club-dialog__logo"
          tenant={tenant}
          type="Fidelity"
          colorVariant="Default"
          size="lg"
          format="Full"
          hideWhenMissing
        />

        <div className="loyalty-club-dialog__copy">
          <h2 id="loyalty-club-dialog-title">
            {t('loyalty.title', { clubName: resolvedClubName })}
          </h2>
          <p>
            {t('loyalty.description')}
          </p>
        </div>

        <div className="loyalty-club-dialog__actions">
          <Button
            label={t('loyalty.enterCpf')}
            intent="primary"
            variant="solid"
            radius="md"
            showLeftIcon={false}
            showRightIcon={false}
            showSecondaryLabel={false}
            onClick={onEnterCpf}
          />
          <Button
            label={t('loyalty.notNow')}
            intent="primary"
            variant="outlined"
            radius="md"
            showLeftIcon={false}
            showRightIcon={false}
            showSecondaryLabel={false}
            onClick={onDecline}
          />
        </div>
      </div>

      <div className="loyalty-club-dialog__qr-panel">
        <BackgroundIllustration className="loyalty-club-dialog__background" aria-hidden="true" />
        <div className="loyalty-club-dialog__qr-card">
          <div className="loyalty-club-dialog__qr-code">
            <VectorQrCode
              value={qrValue}
              imageSrc={qrImageSrc}
              className="loyalty-club-dialog__qr-svg"
              fallbackClassName="loyalty-club-dialog__qr-fallback"
              title={t('loyalty.qrTitle', { clubName: resolvedClubName })}
              onDecodeError={onQrDecodeError}
            />
          </div>
          <p>{t('loyalty.qrDescription')}</p>
        </div>
      </div>
    </section>
  );
}
