import { KeyKeyboard } from '../Common/KeyKeyboard';
import { useI18n } from '../../i18n';
import './NumericKeypad.css';

export type NumericKeypadProps = {
  clearLabel?: string;
  disabled?: boolean;
  onBackspace?: () => void;
  onClear?: () => void;
  onDigit?: (digit: string) => void;
};

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function NumericKeypad({
  clearLabel,
  disabled = false,
  onBackspace,
  onClear,
  onDigit,
}: NumericKeypadProps) {
  const { t } = useI18n();
  return (
    <div className="numeric-keypad" role="group" aria-label={t('keyboard.numeric')}>
      {DIGITS.map((digit) => (
        <KeyKeyboard key={digit} disabled={disabled} onClick={() => onDigit?.(digit)}>
          {digit}
        </KeyKeyboard>
      ))}
      <KeyKeyboard
        intent="Destructive"
        surface="Secondary"
        disabled={disabled}
        onClick={onClear}
      >
        {clearLabel ?? t('common.clear')}
      </KeyKeyboard>
      <KeyKeyboard disabled={disabled} onClick={() => onDigit?.('0')}>0</KeyKeyboard>
      <KeyKeyboard
        icon
        intent="Destructive"
        surface="Secondary"
        aria-label={t('keyboard.deleteLastDigit')}
        disabled={disabled}
        onClick={onBackspace}
      />
    </div>
  );
}
