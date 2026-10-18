import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@components/Layout/Header';
import ShowtimeUnavailableIllustration from '@illustrations/ShowtimeUnavailable.svg';
import { ActionDialog } from '@components/Overlays/Dialog/ActionDialog';
import { OverlaySurface } from '@components/Overlays/OverlaySurface';
import type { PageOrientation } from '../../useOrientation';
import { useI18n } from '../../../i18n';
import { usePurchaseSessionUnavailable } from './PurchaseSessionClosingAlert';

export type PurchaseHeaderProps = {
  orientation: PageOrientation;
  sessionStartTime?: string;
  showtimeDate?: Date | string;
  salesCutoffMinutes?: number;
  availableSeats?: number;
  movieDetailsPath?: string;
  onViewNextShowtimes?: () => void;
};

export const PURCHASE_CANCEL_REQUEST_EVENT = 'totem-purchase-cancel-request';

export function requestPurchaseCancellation() {
  window.dispatchEvent(new CustomEvent(PURCHASE_CANCEL_REQUEST_EVENT));
}

export function PurchaseHeader({
  orientation,
  sessionStartTime,
  showtimeDate,
  salesCutoffMinutes,
  availableSeats,
  movieDetailsPath = '/movies/details',
  onViewNextShowtimes,
}: PurchaseHeaderProps) {
  const navigate = useNavigate();
  const { resetLocale, t } = useI18n();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const sessionUnavailable = usePurchaseSessionUnavailable(sessionStartTime ? {
    time: sessionStartTime,
    showtimeDate,
    salesCutoffMinutes,
    availableSeats,
  } : undefined);

  useEffect(() => {
    const openCancelDialog = () => setIsCancelDialogOpen(true);
    window.addEventListener(PURCHASE_CANCEL_REQUEST_EVENT, openCancelDialog);
    return () => window.removeEventListener(PURCHASE_CANCEL_REQUEST_EVENT, openCancelDialog);
  }, []);

  const cancelAndExit = () => {
    setIsCancelDialogOpen(false);
    resetLocale();
    navigate('/');
  };

  const viewNextShowtimes = () => {
    if (onViewNextShowtimes) {
      onViewNextShowtimes();
      return;
    }
    navigate(movieDetailsPath);
  };

  return (
    <>
      <Header
        context="Customer"
        type="Purchase"
        onClose={() => setIsCancelDialogOpen(true)}
      />
      <OverlaySurface
        open={isCancelDialogOpen}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => setIsCancelDialogOpen(false)}
      >
        <ActionDialog
          size="md"
          showModalHeader={false}
          modalHeaderText=""
          title={t('purchase.cancelTitle')}
          description={t('purchase.cancelDescription')}
          secondaryActionLabel={t('purchase.cancelAndExit')}
          primaryActionLabel={t('purchase.keepOrder')}
          onSecondaryAction={cancelAndExit}
          onPrimaryAction={() => setIsCancelDialogOpen(false)}
          onClose={() => setIsCancelDialogOpen(false)}
        />
      </OverlaySurface>
      <OverlaySurface
        open={sessionUnavailable}
        kind="modal"
        orientation={orientation}
        closeOnBackdrop={false}
        onClose={() => undefined}
      >
        <ActionDialog
          size="md"
          illustration={<ShowtimeUnavailableIllustration aria-hidden="true" />}
          title={t('purchase.sessionUnavailable')}
          description={t('purchase.sessionUnavailableDescription')}
          secondaryActionLabel={t('purchase.nextShowtimes')}
          showPrimaryButton={false}
          onSecondaryAction={viewNextShowtimes}
        />
      </OverlaySurface>
    </>
  );
}
