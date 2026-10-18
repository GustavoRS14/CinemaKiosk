import React from 'react';
import { Tag, type TagProps } from '../../Common/Tag';
import { Button } from '../../Common/Button';
import './DeviceStatusCard.css';

import PrinterIcon from '@icons/printer.svg';
import TefIcon from '@icons/tef.svg';
import { translate, useI18n } from '../../../i18n';

export type HardwareDeviceType = 'printer' | 'payment-terminal';
export type PrinterPaperStatus = 'ok' | 'low' | 'empty' | 'unknown';

export type DetectedHardwareDevice = {
  /** Stable identifier supplied by the machine integration. */
  id: string;
  /** Keeps printer and payment-terminal instances isolated from one another. */
  type: HardwareDeviceType;
  connected: boolean;
  /** Manufacturer/model reported by the operating system or native integration. */
  model?: string;
  /** Port or transport reported by the integration, such as COM3 or USB. */
  connection?: string;
  /** Only applies to printer devices. */
  paperStatus?: PrinterPaperStatus;
};

type DevicePresentation = {
  metadata: string;
  status: NonNullable<TagProps['status']>;
  statusText: string;
  actionAvailable: boolean;
};

export function findDetectedHardwareDevice(
  devices: readonly DetectedHardwareDevice[],
  deviceType: HardwareDeviceType,
) {
  const matchingDevices = devices.filter((device) => device.type === deviceType);
  return matchingDevices.find((device) => device.connected) ?? matchingDevices[0];
}

export function getHardwareDevicePresentation(
  deviceType: HardwareDeviceType,
  device?: DetectedHardwareDevice,
): DevicePresentation {
  if (!device?.connected) {
    return {
      metadata: translate('hardware.noneFound'),
      status: 'Error',
      statusText: translate('hardware.disconnected'),
      actionAvailable: false,
    };
  }

  const identity = device.model?.trim()
    || (deviceType === 'printer' ? translate('hardware.printer') : translate('hardware.paymentTerminal'));
  const connection = device.connection?.trim();
  const metadata = connection ? `${identity} (${connection})` : identity;

  if (deviceType === 'printer' && device.paperStatus === 'empty') {
    return { metadata, status: 'Error', statusText: translate('hardware.noPaper'), actionAvailable: false };
  }

  if (deviceType === 'printer' && device.paperStatus === 'low') {
    return { metadata, status: 'Warning', statusText: translate('hardware.lowPaper'), actionAvailable: true };
  }

  return { metadata, status: 'Information', statusText: translate('hardware.connected'), actionAvailable: true };
}

export type DeviceStatusCardProps = {
  className?: string;
  /** Device category owned by this card. Enables automatic status resolution. */
  deviceType?: HardwareDeviceType;
  /** Hardware snapshots supplied by the machine/native integration. */
  detectedDevices?: readonly DetectedHardwareDevice[];
  /** Custom icon for the device. Falls back to a default printer icon if not provided. */
  deviceIcon?: React.ReactNode | null;
  /** The metadata text displayed below the device name */
  deviceMetadata?: string;
  /** The name of the device */
  deviceName?: string;
  /** The text to display inside the status tag */
  statusText?: string;
  /** Semantic appearance of the status tag. */
  status?: TagProps['status'];
  /** The label for the primary action button */
  actionLabel?: string;
  /** Disables the device action until the hardware is available. */
  actionDisabled?: boolean;
  /** Click handler for the action button */
  onAction?: () => void;
};

export function DeviceStatusCard({
  className = '',
  deviceType,
  detectedDevices = [],
  deviceIcon = null,
  deviceMetadata,
  deviceName,
  statusText,
  status,
  actionLabel,
  actionDisabled,
  onAction,
}: DeviceStatusCardProps) {
  const { t } = useI18n();
  const detectedDevice = deviceType
    ? findDetectedHardwareDevice(detectedDevices, deviceType)
    : undefined;
  const presentation = deviceType
    ? getHardwareDevicePresentation(deviceType, detectedDevice)
    : undefined;
  const resolvedDeviceName = deviceName
    ?? (deviceType === 'printer'
      ? t('hardware.printer')
      : deviceType === 'payment-terminal'
        ? t('hardware.paymentTerminal')
        : t('hardware.device'));
  const resolvedIcon = deviceIcon
    || (deviceType === 'payment-terminal'
      ? <TefIcon aria-hidden="true" />
      : <PrinterIcon aria-hidden="true" />);
  const resolvedActionDisabled = actionDisabled ?? (presentation ? !presentation.actionAvailable : false);

  return (
    <div
      className={`device-status-card ${className}`.trim()}
      data-device-type={deviceType}
      data-device-id={detectedDevice?.id}
    >
      <div className="device-status-card__header">
        <div className="device-status-card__icon-wrapper">
          <div className="device-status-card__icon">
            {resolvedIcon}
          </div>
        </div>
        <Tag
          text={statusText ?? presentation?.statusText ?? 'Status'}
          status={status ?? presentation?.status ?? 'Information'}
          state="Default"
        />
      </div>
      
      <div className="device-status-card__text">
        <h3 className="device-status-card__title">{resolvedDeviceName}</h3>
        <p className="device-status-card__metadata">
          {deviceMetadata ?? presentation?.metadata ?? 'Metadado'}
        </p>
      </div>
      
      <div className="device-status-card__action">
        <Button 
          intent="primary" 
          variant="outlined" 
          radius="2xs"
          label={actionLabel ?? t('hardware.action')}
          showLeftIcon={false}
          showRightIcon={false}
          showSecondaryLabel={false}
          disabled={resolvedActionDisabled}
          onClick={onAction}
          className="w-full"
        />
      </div>
    </div>
  );
}

DeviceStatusCard.displayName = 'DeviceStatusCard';
