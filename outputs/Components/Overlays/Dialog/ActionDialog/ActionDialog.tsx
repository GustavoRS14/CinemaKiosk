import React, { ReactNode } from 'react';
import { Button } from '../../../Common/Button';
import { ModalHeader } from '../../../Common/ModalHeader';
import AlertIllustration from '@illustrations/alert.svg';
import { useI18n } from '../../../../i18n';
import '../../overlayDialog.css';
import './ActionDialog.css';

export interface ActionDialogProps {
  title?: ReactNode;
  description?: ReactNode;
  illustration?: ReactNode | string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  tertiaryActionLabel?: string;
  showPrimaryButton?: boolean;
  showSecondaryButton?: boolean;
  showTertiaryButton?: boolean;
  showModalHeader?: boolean;
  modalHeaderText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onTertiaryAction?: () => void;
  onClose?: () => void;
}

export const ActionDialog: React.FC<ActionDialogProps> = ({
  title,
  description,
  illustration = <AlertIllustration aria-hidden="true" />,
  primaryActionLabel,
  secondaryActionLabel,
  tertiaryActionLabel,
  showPrimaryButton = true,
  showSecondaryButton = true,
  showTertiaryButton = false,
  showModalHeader = false,
  modalHeaderText,
  size = 'md',
  onPrimaryAction,
  onSecondaryAction,
  onTertiaryAction,
  onClose,
}) => {
  const { t } = useI18n();
  const resolvedTitle = title ?? t('actionDialog.defaultTitle');
  const resolvedDescription = description ?? t('actionDialog.defaultDescription');
  const resolvedPrimaryLabel = primaryActionLabel ?? t('actionDialog.saveAndClose');
  const resolvedSecondaryLabel = secondaryActionLabel ?? t('actionDialog.doNotSave');
  const renderIllustration = () => {
    if (typeof illustration === 'string') {
      return <img src={illustration} alt="Illustration" />;
    }
    return illustration;
  };

  return (
    <div className={`overlay-dialog overlay-dialog--size-${size} action-dialog`}>
      {showModalHeader && (
        <ModalHeader className="action-dialog-header" text={modalHeaderText ?? (typeof resolvedTitle === 'string' ? resolvedTitle : '')} onClose={onClose} />
      )}
      <div className="action-dialog-content">
        <div className="action-dialog-illustration">
          {renderIllustration()}
        </div>
        <div className="action-dialog-text-actions">
          <div className="action-dialog-text">
            <h5 className="action-dialog-title">{resolvedTitle}</h5>
            <div className="action-dialog-description">{resolvedDescription}</div>
          </div>
          <div className="action-dialog-actions">
            <div className={`action-dialog-action-group ${(!showPrimaryButton || !showSecondaryButton) ? 'action-dialog-action-group--single' : ''}`}>
              {showSecondaryButton && (
                <Button intent="primary" label={resolvedSecondaryLabel} radius="md" showLeftIcon={false} showRightIcon={false} showSecondaryLabel={false} variant="outlined" onClick={onSecondaryAction} />
              )}
              {showPrimaryButton && (
                <Button intent="primary" label={resolvedPrimaryLabel} radius="md" showLeftIcon={false} showRightIcon={false} showSecondaryLabel={false} variant="solid" onClick={onPrimaryAction} />
              )}
            </div>
            {showTertiaryButton && (
              <div className="action-dialog-cancel">
                <Button intent="primary" label={tertiaryActionLabel ?? t('checkout.cancel')} radius="md" showLeftIcon={false} showRightIcon={false} showSecondaryLabel={false} variant="ghost" onClick={onTertiaryAction} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
