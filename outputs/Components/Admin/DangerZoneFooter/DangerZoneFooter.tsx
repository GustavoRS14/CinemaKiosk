import React, { type ReactNode } from 'react';
import { Button } from '../../Common/Button';
import DangerIcon from '@icons/danger.svg';
import { useI18n } from '../../../i18n';
import './DangerZoneFooter.css';

export type DangerZoneFooterProps = {
  /** The main title text */
  title?: string;
  /** The subtitle text below the title */
  subtitle?: string;
  /** Label for the primary action button */
  primaryActionLabel?: string;
  /** Label for the secondary action button */
  secondaryActionLabel?: string;
  /** Callback for when the primary action button is clicked */
  onPrimaryAction?: () => void;
  /** Callback for when the secondary action button is clicked */
  onSecondaryAction?: () => void;
  /** If true, the footer and its actions are disabled */
  disabled?: boolean;
  /** If true, the footer and its actions are read-only */
  readOnly?: boolean;
};

export function DangerZoneFooter({
  title,
  subtitle,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  disabled = false,
  readOnly = false,
}: DangerZoneFooterProps) {
  const { t } = useI18n();
  const resolvedTitle = title ?? t('admin.system.title');
  const resolvedSubtitle = subtitle ?? t('admin.system.description');
  const resolvedPrimaryActionLabel = primaryActionLabel ?? t('admin.system.close');
  const resolvedSecondaryActionLabel = secondaryActionLabel ?? t('admin.system.restart');
  const isInteractiveBlocked = disabled || readOnly;

  const handlePrimaryAction = () => {
    if (isInteractiveBlocked) return;
    onPrimaryAction?.();
  };

  const handleSecondaryAction = () => {
    if (isInteractiveBlocked) return;
    onSecondaryAction?.();
  };

  return (
    <div
      className="danger-zone-footer"
      aria-disabled={disabled}
      aria-readonly={readOnly}
    >
      <div className="danger-zone-footer__text-container">
        <div className="danger-zone-footer__title-group">
          <span className="danger-zone-footer__icon" aria-hidden="true">
            <DangerIcon/>
          </span>
          <span className="danger-zone-footer__title">{resolvedTitle}</span>
        </div>
        <span className="danger-zone-footer__subtitle">{resolvedSubtitle}</span>
      </div>

      <div className="danger-zone-footer__actions">
        <Button
          intent="primary"
          variant="outlined"
          radius="xs"
          label={resolvedSecondaryActionLabel}
          showSecondaryLabel={false}
          showLeftIcon={false}
          showRightIcon={false}
          onClick={handleSecondaryAction}
          disabled={isInteractiveBlocked}
        />
        <Button
          intent="primary"
          variant="solid"
          radius="xs"
          label={resolvedPrimaryActionLabel}
          showSecondaryLabel={false}
          showLeftIcon={false}
          showRightIcon={false}
          onClick={handlePrimaryAction}
          disabled={isInteractiveBlocked}
        />
      </div>
    </div>
  );
}

DangerZoneFooter.displayName = 'DangerZoneFooter';
