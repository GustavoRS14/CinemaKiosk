import { useEffect, useState, type ChangeEvent } from 'react';
import EyeClosedIcon from '@icons/eye-closed.svg';
import EyeOpenIcon from '@icons/eye-open.svg';
import { Button } from '../../Common/Button';
import { Input } from '../../Common/Input';
import { AlphanumericKeyboard } from '../AlphanumericKeyboard';
import { NumericKeypad } from '../NumericKeypad';
import { useI18n } from '../../../i18n';
import '../overlayDialog.css';
import './KeyboardDialog.css';

export type KeyboardDialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type KeyboardDialogProps = {
  variant?: 'numeric' | 'alphanumeric';
  title?: string;
  description?: string;
  showIntro?: boolean;
  inputPlaceholder?: string;
  value?: string;
  defaultValue?: string;
  maxLength?: number;
  clearLabel?: string;
  spaceLabel?: string;
  secondaryActionLabel?: string;
  primaryActionLabel?: string;
  tertiaryActionLabel?: string;
  showTertiaryButton?: boolean;
  primaryDisabled?: boolean;
  maskValue?: boolean;
  inputState?: 'Default' | 'Filled' | 'Invalid' | 'Disabled';
  supportingText?: string;
  busy?: boolean;
  busyPrimaryActionLabel?: string;
  size?: KeyboardDialogSize;
  onChange?: (value: string) => void;
  onSecondaryAction?: () => void;
  onPrimaryAction?: () => void;
  onTertiaryAction?: () => void;
};

export function KeyboardDialog({
  variant = 'numeric',
  title,
  description,
  showIntro = true,
  inputPlaceholder,
  value,
  defaultValue = '',
  maxLength,
  clearLabel,
  spaceLabel,
  secondaryActionLabel,
  primaryActionLabel,
  tertiaryActionLabel,
  showTertiaryButton = false,
  primaryDisabled = true,
  maskValue = false,
  inputState = 'Default',
  supportingText,
  busy = false,
  busyPrimaryActionLabel,
  size = 'md',
  onChange,
  onSecondaryAction,
  onPrimaryAction,
  onTertiaryAction,
}: KeyboardDialogProps) {
  const { t } = useI18n();
  const resolvedTitle = title ?? t('keyboardDialog.defaultTitle');
  const resolvedDescription = description ?? t('keyboardDialog.defaultDescription');
  const resolvedPlaceholder = inputPlaceholder ?? t('keyboardDialog.defaultPlaceholder');
  const resolvedSecondaryAction = secondaryActionLabel ?? t('action.back');
  const resolvedPrimaryAction = primaryActionLabel ?? t('keyboardDialog.changePin');
  const resolvedTertiaryAction = tertiaryActionLabel ?? t('checkout.cancel');
  const resolvedBusyAction = busyPrimaryActionLabel ?? t('identity.checking');
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [valueVisible, setValueVisible] = useState(!maskValue);
  const currentValue = value ?? internalValue;
  const isAlphanumeric = variant === 'alphanumeric';

  const updateValue = (nextValue: string) => {
    const normalized = maxLength ? nextValue.slice(0, maxLength) : nextValue;
    if (value === undefined) setInternalValue(normalized);
    onChange?.(normalized);
  };

  useEffect(() => {
    if (busy) return undefined;

    const handlePhysicalKeyboard = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Backspace') {
        event.preventDefault();
        updateValue(currentValue.slice(0, -1));
        return;
      }
      if (event.key === 'Escape') {
        onSecondaryAction?.();
        return;
      }
      if (event.key === 'Enter' && !primaryDisabled) {
        event.preventDefault();
        onPrimaryAction?.();
        return;
      }
      const acceptedKey = isAlphanumeric
        ? (/^[\p{L}\p{N} ]$/u.test(event.key) ? event.key.toUpperCase() : '')
        : (/^\d$/.test(event.key) ? event.key : '');
      if (acceptedKey) {
        event.preventDefault();
        updateValue(`${currentValue}${acceptedKey}`);
      }
    };

    window.addEventListener('keydown', handlePhysicalKeyboard);
    return () => window.removeEventListener('keydown', handlePhysicalKeyboard);
  }, [busy, currentValue, isAlphanumeric, maxLength, onChange, onPrimaryAction, onSecondaryAction, primaryDisabled, value]);

  return (
    <section
      className={`overlay-dialog overlay-dialog--size-${size} keyboard-dialog`}
      aria-labelledby={showIntro ? 'keyboard-dialog-title' : undefined}
      aria-label={showIntro ? undefined : resolvedPlaceholder}
    >
      <div className="keyboard-dialog__content">
        {showIntro && (
          <div className="keyboard-dialog__copy">
            <h2 id="keyboard-dialog-title">{resolvedTitle}</h2>
            <p>{resolvedDescription}</p>
          </div>
        )}

        <div className="keyboard-dialog__input-keypad">
          <Input
            aria-label={resolvedPlaceholder}
            inputMode={isAlphanumeric ? 'text' : 'numeric'}
            placeholder={resolvedPlaceholder}
            value={currentValue}
            type={maskValue && !valueVisible ? 'password' : 'text'}
            maxLength={maxLength}
            state={busy ? 'Disabled' : inputState}
            disabled={busy}
            showSupportingText={Boolean(supportingText)}
            supportingText={supportingText}
            showIconRight={!isAlphanumeric && maskValue}
            iconRight={!isAlphanumeric && maskValue
              ? (valueVisible ? <EyeClosedIcon aria-hidden="true" /> : <EyeOpenIcon aria-hidden="true" />)
              : undefined}
            onIconRightClick={!isAlphanumeric && maskValue
              ? () => setValueVisible((visible) => !visible)
              : undefined}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const nextValue = isAlphanumeric
                ? event.target.value.toUpperCase()
                : event.target.value.replace(/\D/g, '');
              updateValue(nextValue);
            }}
          />
          {isAlphanumeric ? (
            <AlphanumericKeyboard
              disabled={busy}
              clearLabel={clearLabel}
              spaceLabel={spaceLabel}
              onKey={(key) => updateValue(`${currentValue}${key}`)}
              onClear={() => updateValue('')}
              onBackspace={() => updateValue(currentValue.slice(0, -1))}
            />
          ) : (
            <NumericKeypad
              disabled={busy}
              clearLabel={clearLabel}
              onDigit={(digit) => updateValue(`${currentValue}${digit}`)}
              onClear={() => updateValue('')}
              onBackspace={() => updateValue(currentValue.slice(0, -1))}
            />
          )}
        </div>

        <div className="keyboard-dialog__actions">
          <div className="keyboard-dialog__primary-actions">
            <Button
              label={resolvedSecondaryAction}
              variant="outlined"
              radius="md"
              showLeftIcon={false}
              showRightIcon={false}
              showSecondaryLabel={false}
              disabled={busy}
              onClick={onSecondaryAction}
            />
            <Button
              label={busy ? resolvedBusyAction : resolvedPrimaryAction}
              variant="solid"
              radius="md"
              disabled={primaryDisabled || busy}
              showLeftIcon={false}
              showRightIcon={false}
              showSecondaryLabel={false}
              onClick={onPrimaryAction}
            />
          </div>
          {showTertiaryButton && (
            <Button
              className="keyboard-dialog__tertiary-action"
              label={resolvedTertiaryAction}
              variant="ghost"
              radius="md"
              showLeftIcon={false}
              showRightIcon={false}
              showSecondaryLabel={false}
              onClick={onTertiaryAction}
            />
          )}
        </div>
      </div>
    </section>
  );
}
