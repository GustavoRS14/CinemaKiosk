import { useEffect, useState } from 'react';
import BackHomeIllustration from '@illustrations/BackHome.svg';
import { ActionDialog } from '../Dialog/ActionDialog';
import { OverlaySurface } from '../OverlaySurface';
import { useOrientation } from '../../../Pages/useOrientation';
import { useI18n } from '../../../i18n';
import { CUSTOMER_FLOW_RESET_EVENT } from '../../../Pages/Customer/customerFlowReset';

const CUSTOMER_HOME_EXIT_EVENT = 'totem-customer-home-exit-request';

export function requestCustomerHomeExit() {
  window.dispatchEvent(new CustomEvent(CUSTOMER_HOME_EXIT_EVENT));
}

type CustomerHomeExitDialogProps = {
  onExit: () => void;
};

export function CustomerHomeExitDialog({ onExit }: CustomerHomeExitDialogProps) {
  const orientation = useOrientation();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const showDialog = () => setOpen(true);
    const resetDialog = () => setOpen(false);
    window.addEventListener(CUSTOMER_HOME_EXIT_EVENT, showDialog);
    window.addEventListener(CUSTOMER_FLOW_RESET_EVENT, resetDialog);
    return () => {
      window.removeEventListener(CUSTOMER_HOME_EXIT_EVENT, showDialog);
      window.removeEventListener(CUSTOMER_FLOW_RESET_EVENT, resetDialog);
    };
  }, []);

  return (
    <OverlaySurface open={open} kind="modal" orientation={orientation} closeOnBackdrop={false} onClose={() => setOpen(false)}>
      <ActionDialog
        size="md"
        illustration={<BackHomeIllustration aria-hidden="true" />}
        title={t('navigation.returnHomeTitle')}
        description={t('navigation.returnHomeDescription')}
        secondaryActionLabel={t('navigation.exit')}
        primaryActionLabel={t('purchase.keepOrder')}
        onSecondaryAction={() => {
          setOpen(false);
          onExit();
        }}
        onPrimaryAction={() => setOpen(false)}
      />
    </OverlaySurface>
  );
}
