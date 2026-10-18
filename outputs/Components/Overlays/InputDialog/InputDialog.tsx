import { useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react';
import EyeOpenIcon from '@asset-icons/eye-open.svg';
import EyeClosedIcon from '@asset-icons/eye-closed.svg';
import { Button } from '../../Common/Button';
import { Input } from '../../Common/Input';
import { NumericKeypad } from '../NumericKeypad';
import type { KeyboardDialogSize } from '../KeyboardDialog';
import { useI18n } from '../../../i18n';
import {
  formatInputValue,
  onlyDigits,
  type InputVisualFormat,
} from '../../../Utilities/inputFormatters';
import '../overlayDialog.css';
import './InputDialog.css';

export type InputDialogProps = {
  title?: string;
  description?: string;
  methodText?: ReactNode;
  showMethodText?: boolean;
  inputPlaceholder?: string;
  value?: string;
  defaultValue?: string;
  maxLength?: number;
  clearLabel?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  primaryDisabled?: boolean;
  maskValue?: boolean;
  /** Changes only the displayed value; onChange continues to receive digits. */
  inputFormat?: InputVisualFormat;
  size?: KeyboardDialogSize;
  onChange?: (value: string) => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
};

export function InputDialog({
  title,
  description,
  methodText,
  showMethodText = true,
  inputPlaceholder = '( _ _ ) _ _ _ _ _ - _ _ _ _',
  value,
  defaultValue = '',
  maxLength = 11,
  clearLabel,
  primaryActionLabel,
  secondaryActionLabel,
  primaryDisabled = true,
  maskValue = false,
  inputFormat = 'phone',
  size = 'lg',
  onChange,
  onPrimaryAction,
  onSecondaryAction,
}: InputDialogProps) {
  const { t } = useI18n();
  const resolvedTitle = title ?? t('inputDialog.phoneTitle');
  const resolvedDescription = description ?? t('inputDialog.phoneDescription');
  const resolvedMethodText = methodText ?? <>{t('inputDialog.digitalVia')} <strong>WhatsApp</strong></>;
  const resolvedPrimaryAction = primaryActionLabel ?? t('inputDialog.send');
  const resolvedSecondaryAction = secondaryActionLabel ?? t('action.back');
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [valueVisible, setValueVisible] = useState(!maskValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentValue = value ?? internalValue;
  const displayedValue = formatInputValue(currentValue, inputFormat);

  const updateValue = (nextValue: string) => {
    const normalized = onlyDigits(nextValue, maxLength);
    if (value === undefined) setInternalValue(normalized);
    onChange?.(normalized);
  };

  const restoreInputFocus = () => {
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handlePhysicalKeyboard = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      updateValue(`${currentValue}${event.key}`);
      return;
    }
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      updateValue(currentValue.slice(0, -1));
      return;
    }
    if (event.key === 'Enter' && !primaryDisabled) {
      event.preventDefault();
      onPrimaryAction?.();
    }
  };

  return (
    <section
      className={`overlay-dialog overlay-dialog--size-${size} input-dialog`}
      aria-labelledby="input-dialog-title"
    >
      <aside className="input-dialog__information">
        <div className="input-dialog__copy">
          <h2 id="input-dialog-title">{resolvedTitle}</h2>
          <p>{resolvedDescription}</p>
        </div>

        <div className="input-dialog__method-actions">
          {showMethodText && <p className="input-dialog__method">{resolvedMethodText}</p>}
          <div className="input-dialog__actions">
            <Button
              label={resolvedPrimaryAction}
              variant="solid"
              radius="md"
              disabled={primaryDisabled}
              showLeftIcon={false}
              showRightIcon={false}
              showSecondaryLabel={false}
              onClick={onPrimaryAction}
            />
            <Button
              label={resolvedSecondaryAction}
              variant="outlined"
              radius="md"
              showLeftIcon={false}
              showRightIcon={false}
              showSecondaryLabel={false}
              onClick={onSecondaryAction}
            />
          </div>
        </div>
      </aside>

      <div className="input-dialog__keyboard">
        <Input
          ref={inputRef}
          aria-label={resolvedTitle}
          autoFocus
          inputMode="numeric"
          placeholder={inputPlaceholder}
          value={displayedValue}
          type={valueVisible ? 'text' : 'password'}
          showIconRight={maskValue}
          iconRight={valueVisible ? <EyeClosedIcon aria-hidden="true" /> : <EyeOpenIcon aria-hidden="true" />}
          onIconRightClick={maskValue ? () => {
            setValueVisible((visible) => !visible);
            restoreInputFocus();
          } : undefined}
          maxLength={inputFormat === 'none' ? maxLength : undefined}
          onKeyDown={handlePhysicalKeyboard}
          onChange={(event: ChangeEvent<HTMLInputElement>) => updateValue(event.target.value)}
        />
        <NumericKeypad
          clearLabel={clearLabel}
          onDigit={(digit) => {
            updateValue(`${currentValue}${digit}`);
            restoreInputFocus();
          }}
          onClear={() => {
            updateValue('');
            restoreInputFocus();
          }}
          onBackspace={() => {
            updateValue(currentValue.slice(0, -1));
            restoreInputFocus();
          }}
        />
      </div>
    </section>
  );
}
