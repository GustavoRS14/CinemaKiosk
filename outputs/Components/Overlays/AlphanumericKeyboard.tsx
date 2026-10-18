import { KeyKeyboard } from '../Common/KeyKeyboard';
import { useI18n } from '../../i18n';
import './AlphanumericKeyboard.css';

export type AlphanumericKeyboardProps = {
  clearLabel?: string;
  spaceLabel?: string;
  disabled?: boolean;
  onBackspace?: () => void;
  onClear?: () => void;
  onKey?: (key: string) => void;
};

const KEY_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ç'],
];

export function AlphanumericKeyboard({
  clearLabel,
  spaceLabel,
  disabled = false,
  onBackspace,
  onClear,
  onKey,
}: AlphanumericKeyboardProps) {
  const { t } = useI18n();
  return (
    <div className="alphanumeric-keyboard" role="group" aria-label={t('keyboard.alphanumeric')}>
      {KEY_ROWS.map((row, rowIndex) => (
        <div className="alphanumeric-keyboard__row" key={row.join('')} data-row={rowIndex + 1}>
          {row.map((key) => (
            <KeyKeyboard key={key} disabled={disabled} onClick={() => onKey?.(key)}>
              {key}
            </KeyKeyboard>
          ))}
        </div>
      ))}
      <div className="alphanumeric-keyboard__controls">
        <KeyKeyboard intent="Destructive" surface="Secondary" disabled={disabled} onClick={onClear}>
          {clearLabel ?? t('common.clear')}
        </KeyKeyboard>
        <KeyKeyboard
          className="alphanumeric-keyboard__space"
          surface="Secondary"
          disabled={disabled}
          onClick={() => onKey?.(' ')}
        >
          {spaceLabel ?? t('keyboard.space')}
        </KeyKeyboard>
        <KeyKeyboard
          icon
          intent="Destructive"
          surface="Secondary"
          aria-label={t('keyboard.deleteLastCharacter')}
          disabled={disabled}
          onClick={onBackspace}
        />
      </div>
    </div>
  );
}
