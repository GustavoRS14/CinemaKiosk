import { useEffect, useState } from 'react';

import PrintingFailureIllustration from '@illustrations/PritingFailure.svg';
import sampleQrCode from '@project-images/Payment/qr-code.png';

import { Button } from '../../../Common/Button';
import { LoadingSpinner } from '../../../Common/LoadingSpinner';
import { TextButton } from '../../../Common/TextButton';
import { VectorQrCode } from '../../../Common/VectorQrCode';
import { useI18n } from '../../../../i18n';
import '../../overlayDialog.css';
import './PrintingFailureDialog.css';

export type PrintingFailureScenario = 'totem' | 'online-order';
export type PrintingFailureStage = 'generating' | 'qr-ready';

export type PrintingFailureDialogProps = {
  scenario?: PrintingFailureScenario;
  initialStage?: PrintingFailureStage;
  autoAdvance?: boolean;
  qrGenerationDelayMs?: number;
  qrValue?: string;
  qrImageSrc?: string;
  countdownSeconds?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onSms?: () => void;
  onWhatsApp?: () => void;
  onFinish?: () => void;
  onClose?: () => void;
  onQrDecodeError?: (error: Error) => void;
  className?: string;
};

export function PrintingFailureDialog({
  scenario = 'totem',
  initialStage = 'generating',
  autoAdvance = true,
  qrGenerationDelayMs = 3000,
  qrValue,
  qrImageSrc = sampleQrCode,
  countdownSeconds = 15,
  size = 'md',
  onSms,
  onWhatsApp,
  onFinish,
  onClose,
  onQrDecodeError,
  className = '',
}: PrintingFailureDialogProps) {
  const { t } = useI18n();
  const [stage, setStage] = useState<PrintingFailureStage>(initialStage);
  const [remainingSeconds, setRemainingSeconds] = useState(countdownSeconds);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    setStage(initialStage);
  }, [initialStage, scenario]);

  useEffect(() => {
    if (scenario !== 'totem' || !autoAdvance || stage !== 'generating') return;
    const timeout = window.setTimeout(() => setStage('qr-ready'), qrGenerationDelayMs);
    return () => window.clearTimeout(timeout);
  }, [autoAdvance, qrGenerationDelayMs, scenario, stage]);

  useEffect(() => {
    if (scenario !== 'online-order') return;
    setIsClosed(false);
    setRemainingSeconds(countdownSeconds);
    let seconds = countdownSeconds;
    const interval = window.setInterval(() => {
      seconds = Math.max(0, seconds - 1);
      setRemainingSeconds(seconds);
      if (seconds === 0) {
        window.clearInterval(interval);
        setIsClosed(true);
        onClose?.();
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [countdownSeconds, onClose, scenario]);

  const state = scenario === 'online-order' ? 'online-order' : stage;
  const titleId = `printing-failure-dialog-title-${state}`;

  if (isClosed) return null;

  return (
    <section
      className={`overlay-dialog overlay-dialog--size-${size} printing-failure-dialog printing-failure-dialog--${state} ${className}`.trim()}
      aria-labelledby={titleId}
      role="dialog"
    >
      {state !== 'qr-ready' && (
        <PrintingFailureIllustration
          className="printing-failure-dialog__illustration"
          aria-hidden="true"
        />
      )}

      {state === 'generating' && (
        <div className="printing-failure-dialog__body">
          <div className="printing-failure-dialog__copy">
            <h2 id={titleId}>{t('printing.confirmed')}<br />{t('printing.unavailable')}</h2>
            <p>{t('printing.generatingDescription')}</p>
          </div>
          <div className="printing-failure-dialog__spinner">
            <LoadingSpinner size="lg" intent="Primary" aria-label={t('printing.generating')} />
          </div>
        </div>
      )}

      {state === 'qr-ready' && (
        <div className="printing-failure-dialog__qr-content">
          <h2 id={titleId}>
            {t('printing.scanDescription')}
          </h2>
          <div className="printing-failure-dialog__qr-code">
            <VectorQrCode
              value={qrValue}
              imageSrc={qrImageSrc}
              className="printing-failure-dialog__qr-svg"
              fallbackClassName="printing-failure-dialog__qr-fallback"
              title={t('printing.orderQrCode')}
              onDecodeError={onQrDecodeError}
            />
          </div>
          <div className="printing-failure-dialog__delivery">
            <div className="printing-failure-dialog__delivery-message">
              <p>{t('printing.sendPhone')}</p>
              <div className="printing-failure-dialog__delivery-actions">
                <Button label="SMS" intent="primary" variant="outlined" radius="md" showLeftIcon={false} showRightIcon={false} showSecondaryLabel={false} onClick={onSms} />
                <Button label="Whatsapp" intent="primary" variant="solid" radius="md" showLeftIcon={false} showRightIcon={false} showSecondaryLabel={false} onClick={onWhatsApp} />
              </div>
            </div>
            <TextButton label={t('checkout.finishExit')} intent="Neutral" size="sm" weight="Medium" onClick={onFinish} />
          </div>
        </div>
      )}

      {state === 'online-order' && (
        <div className="printing-failure-dialog__body">
          <div className="printing-failure-dialog__copy">
            <h2 id={titleId}>{t('printing.problem')}</h2>
            <p>{t('printing.digitalValid')}</p>
            <p>
              {t('printing.returningIn')}{' '}
              <strong className="printing-failure-dialog__countdown">
                {remainingSeconds} {remainingSeconds === 1 ? t('printing.second') : t('printing.seconds')}
              </strong>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
