import {
  useState,
  type CSSProperties,
} from 'react';

import { IconButton } from '../IconButton';
import { Validation_Tooltip } from '../Validation_Tooltip';
import './Counter.css';

import MinusIcon from '@icons/minus.svg';
import AddPlusIcon from '@icons/add-plus.svg';

export type CounterState = 'Minimum' | 'Default' | 'Maximum' | 'Disabled';

export type CounterProps = {
  /** Map to the Figma State property. */
  state?: CounterState;
  /** Toggles the visibility of the validation tooltip. */
  showValidationTooltip?: boolean;
  /** Text passed to the validation tooltip. */
  validationMessage?: string;
  /** Current value for controlled usage. */
  value?: number;
  /** Initial value for uncontrolled usage. Defaults to 0. */
  defaultValue?: number;
  /** Smallest allowed value. Defaults to 0. */
  min?: number;
  /** Largest allowed value. Defaults to 10. */
  max?: number;
  /** Callback fired when the value changes via button clicks. */
  onChange?: (newValue: number) => void;
  /** Additional CSS classes. */
  className?: string;
  /** Optional inline styles. */
  style?: CSSProperties;
};

export function Counter({
  state = 'Default',
  showValidationTooltip = false,
  validationMessage,
  value,
  defaultValue = 0,
  min = 0,
  max = 10,
  onChange,
  className,
  style,
}: CounterProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  let effectiveState = state;
  if (state !== 'Disabled' && state !== 'Maximum') {
    if (currentValue <= min) {
      effectiveState = 'Minimum';
    } else if (currentValue >= max) {
      effectiveState = 'Maximum';
    } else {
      effectiveState = 'Default';
    }
  }

  const handleMinus = () => {
    if (effectiveState === 'Disabled' || effectiveState === 'Minimum') return;
    if (currentValue <= min) return;
    const newValue = currentValue - 1;
    if (!isControlled) setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handlePlus = () => {
    if (effectiveState === 'Disabled' || effectiveState === 'Maximum') return;
    if (currentValue >= max) return;
    
    const newValue = currentValue + 1;
    if (!isControlled) setInternalValue(newValue);
    onChange?.(newValue);
  };

  const isMinusDisabled = effectiveState === 'Disabled' || effectiveState === 'Minimum';
  const isPlusDisabled = effectiveState === 'Disabled' || effectiveState === 'Maximum';

  return (
    <div 
      className={`totem-counter ${className || ''}`.trim()} 
      style={style}
      data-state={effectiveState}
    >
      <IconButton
        state={isMinusDisabled ? 'Disabled' : 'Default'}
        icon={<MinusIcon />}
        onClick={handleMinus}
        aria-label="Decrease"
      />
      
      <p className="totem-counter__text">{currentValue}</p>
      
      <IconButton
        state={isPlusDisabled ? 'Disabled' : 'Default'}
        icon={<AddPlusIcon />}
        onClick={handlePlus}
        aria-label="Increase"
      />
      
      {showValidationTooltip && (
        <div className="totem-counter__tooltip-wrapper">
          <Validation_Tooltip text={validationMessage || 'Atenção, campo inválido'} />
        </div>
      )}
    </div>
  );
}
